import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { listOrdersByUser, createOrder } from '@/repositories/order.repository'
import { ok, fail } from '@/lib/api-response'
import type { Order } from '@/types'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET  /api/orders — Órdenes del usuario autenticado
// POST /api/orders — Crear una orden nueva
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const orders = await listOrdersByUser(user.id).catch(() => null)
  if (!orders) return fail('Error al obtener órdenes', 500)

  return ok(orders)
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const body = await request.json().catch(() => null)

  if (!body || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return fail('La orden debe contener al menos un producto (items[])', 400)
  }

  if (!body.shippingAddress) {
    return fail('La dirección de envío es requerida', 400)
  }

  // El userId SIEMPRE viene de la sesión — el cliente no puede suplantarlo
  const orderData: Order = {
    id: body.id ?? `order_${Date.now()}`,
    userId: user.id,
    items: body.items,
    total: body.total,
    status: 'pendiente',
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod ?? 'No especificado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const created = await createOrder(orderData).catch((e: Error) => {
    throw e
  })

  return ok(created, 201)
}
