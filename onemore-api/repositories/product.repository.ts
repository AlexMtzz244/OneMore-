import { getAdminFirestore } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { Product, ProductCategory } from '@/types'

const COLLECTION = 'products'

// ─────────────────────────────────────────────────────────────
// Conversión Firestore → tipo Product (Timestamps → ISO strings)
// ─────────────────────────────────────────────────────────────
function docToProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  return {
    id,
    name: data.name,
    brand: data.brand,
    category: data.category,
    price: data.price,
    description: data.description,
    nutritionalInfo: data.nutritionalInfo,
    presentation: data.presentation,
    stock: data.stock ?? 0,
    images: data.images ?? [],
    goal: data.goal ?? [],
    featured: data.featured ?? false,
    bestSeller: data.bestSeller ?? false,
    discount: data.discount,
    rating: data.rating ?? 0,
    reviewCount: data.reviewCount ?? 0,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string ?? new Date().toISOString()),
  }
}

/**
 * Lista todos los productos, con filtro opcional por categoría.
 * Para evitar índices compuestos en Firestore, el ordenamiento se aplica en memoria
 * cuando se usa el filtro de categoría.
 */
export async function listProducts(category?: ProductCategory): Promise<Product[]> {
  const db = getAdminFirestore()
  const col = db.collection(COLLECTION)

  const snapshot = category
    ? await col.where('category', '==', category).get()
    : await col.orderBy('createdAt', 'desc').get()

  const products = snapshot.docs.map((doc) => docToProduct(doc.id, doc.data()))

  // Ordenar en memoria cuando se filtra por categoría (evita índice compuesto en Firestore)
  if (category) {
    products.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  return products
}

/** Obtiene un producto por su ID. Devuelve null si no existe. */
export async function getProductById(id: string): Promise<Product | null> {
  const db = getAdminFirestore()
  const doc = await db.collection(COLLECTION).doc(id).get()

  if (!doc.exists) return null

  return docToProduct(doc.id, doc.data()!)
}

/** Crea un producto nuevo. El ID lo genera Firestore automáticamente. */
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
): Promise<Product> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc()

  const productData = { ...data, createdAt: Timestamp.now() }
  await ref.set(productData)

  return { id: ref.id, ...data, createdAt: new Date().toISOString() }
}

/** Actualiza los campos proporcionados de un producto. Devuelve null si no existe. */
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
): Promise<Product | null> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()

  if (!snap.exists) return null

  await ref.update(data as FirebaseFirestore.UpdateData)
  const updated = await ref.get()
  return docToProduct(updated.id, updated.data()!)
}

/** Elimina un producto. Devuelve false si no existía. */
export async function deleteProduct(id: string): Promise<boolean> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc(id)
  const snap = await ref.get()

  if (!snap.exists) return false

  await ref.delete()
  return true
}
