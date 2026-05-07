import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { listAllOrders } from '@/repositories/order.repository'
import { ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/admin/orders — Lista todas las órdenes (solo admin)
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const orders = await listAllOrders().catch(() => null)
  if (!orders) return fail('Error al obtener órdenes', 500)

  return ok(orders)
}
