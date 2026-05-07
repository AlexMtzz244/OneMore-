import { type NextRequest } from 'next/server'
import { listProducts } from '@/repositories/product.repository'
import { ok, fail } from '@/lib/api-response'
import type { ProductCategory } from '@/types'

export const runtime = 'nodejs'

const VALID_CATEGORIES: ProductCategory[] = ['proteina', 'creatina', 'pre-workout', 'accesorios']

// ─────────────────────────────────────────────────────────────
// GET /api/products
// Ruta pública. Soporta ?category=proteina para filtrar.
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get('category')

  // Validar el parámetro de categoría si se proporciona
  if (categoryParam && !VALID_CATEGORIES.includes(categoryParam as ProductCategory)) {
    return fail(`Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}`, 400)
  }

  const products = await listProducts(categoryParam as ProductCategory | undefined).catch(
    () => null,
  )

  if (!products) return fail('Error al obtener productos', 500)

  return ok(products)
}
