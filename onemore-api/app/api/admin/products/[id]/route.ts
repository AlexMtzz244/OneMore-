import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { updateProduct, deleteProduct } from '@/repositories/product.repository'
import { ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// PUT    /api/admin/products/[id] — Actualiza un producto (admin)
// DELETE /api/admin/products/[id] — Elimina un producto (admin)
// ─────────────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body) return fail('Cuerpo de la petición inválido', 400)

  // Prevenir sobrescritura del id y createdAt desde el cliente
  const { id: _id, createdAt: _createdAt, ...updates } = body

  const updated = await updateProduct(id, updates).catch(() => null)

  if (!updated) return fail('Producto no encontrado', 404)

  return ok(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { id } = await params
  const deleted = await deleteProduct(id).catch(() => false)

  if (!deleted) return fail('Producto no encontrado', 404)

  return ok({ id, deleted: true })
}
