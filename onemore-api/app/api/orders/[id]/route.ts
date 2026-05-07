import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getOrderById } from '@/repositories/order.repository'
import { ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/orders/[id]
// Devuelve una orden específica. Solo el dueño puede verla.
// ─────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { id } = await params
  const order = await getOrderById(id).catch(() => null)

  if (!order) return fail('Orden no encontrada', 404)

  // Verificar que la orden pertenece al usuario (o es admin)
  if (order.userId !== user.id && user.role !== 'administrador') {
    return fail('No tienes permiso para ver esta orden', 403)
  }

  return ok(order)
}
