import { type NextRequest } from 'next/server'
import { getProductById } from '@/repositories/product.repository'
import { ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/products/[id]
// Ruta pública. Devuelve un producto por su ID.
// ─────────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const product = await getProductById(id).catch(() => null)

  if (product === null) return fail('Producto no encontrado', 404)

  return ok(product)
}
