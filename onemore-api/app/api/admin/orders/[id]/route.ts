import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { updateOrderStatus } from '@/repositories/order.repository'
import { ok, fail } from '@/lib/api-response'
import type { OrderStatus } from '@/types'

export const runtime = 'nodejs'

const VALID_STATUSES: OrderStatus[] = ['pendiente', 'enviado', 'entregado', 'cancelado']

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/orders/[id] — Actualiza el estado de una orden (admin)
// ─────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body || typeof body.status !== 'string') {
    return fail('El campo status es requerido', 400)
  }

  if (!VALID_STATUSES.includes(body.status as OrderStatus)) {
    return fail(`Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`, 400)
  }

  const updated = await updateOrderStatus(id, body.status as OrderStatus).catch(() => null)

  if (!updated) return fail('Orden no encontrada', 404)

  return ok(updated)
}
