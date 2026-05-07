import { getAdminFirestore } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { Order, OrderStatus } from '@/types'

const COLLECTION = 'orders'

// ─────────────────────────────────────────────────────────────
// Conversión Firestore → tipo Order (Timestamps → ISO strings).
// Los items y shippingAddress son objetos planos y no necesitan conversión.
// ─────────────────────────────────────────────────────────────
function docToOrder(id: string, data: FirebaseFirestore.DocumentData): Order {
  return {
    id,
    userId: data.userId,
    items: data.items ?? [],
    total: data.total,
    status: data.status,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string),
  }
}

/** Obtiene todas las órdenes de un usuario específico. */
export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const db = getAdminFirestore()
  const snapshot = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()))
}

/** Obtiene todas las órdenes (uso exclusivo de administradores). */
export async function listAllOrders(): Promise<Order[]> {
  const db = getAdminFirestore()
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()))
}

/** Obtiene una orden por su ID. Devuelve null si no existe. */
export async function getOrderById(id: string): Promise<Order | null> {
  const db = getAdminFirestore()
  const doc = await db.collection(COLLECTION).doc(id).get()

  if (!doc.exists) return null

  return docToOrder(doc.id, doc.data()!)
}

/**
 * Crea una orden y descuenta el stock de cada producto en una transacción atómica.
 * Lanza un error si algún producto no tiene stock suficiente.
 */
export async function createOrder(orderData: Order): Promise<Order> {
  const db = getAdminFirestore()
  // Usa el id generado por el cliente (ej. "order_1234567890")
  const orderRef = db.collection(COLLECTION).doc(orderData.id)

  await db.runTransaction(async (transaction) => {
    // 1. Verificar stock de cada producto en la misma transacción
    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.product.id)
      const productSnap = await transaction.get(productRef)

      if (!productSnap.exists) {
        throw new Error(`Producto "${item.product.name}" no encontrado`)
      }

      const currentStock = (productSnap.data()!.stock as number) ?? 0

      if (currentStock < item.quantity) {
        throw new Error(
          `Stock insuficiente para "${item.product.name}": disponible ${currentStock}, solicitado ${item.quantity}`,
        )
      }

      // 2. Descontar stock
      transaction.update(productRef, { stock: currentStock - item.quantity })
    }

    // 3. Crear la orden
    transaction.set(orderRef, {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  })

  return {
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/** Actualiza el estado de una orden. Devuelve null si no existe. */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()

  if (!snap.exists) return null

  await ref.update({ status, updatedAt: Timestamp.now() })
  const updated = await ref.get()
  return docToOrder(updated.id, updated.data()!)
}
