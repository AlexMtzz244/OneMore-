import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { listProducts, createProduct } from '@/repositories/product.repository'
import { ok, fail } from '@/lib/api-response'
import type { Product } from '@/types'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/admin/products  — Lista todos los productos (admin)
// POST /api/admin/products — Crea un producto nuevo (admin)
//
// El middleware ya verificó presencia de cookie; aquí se verifica rol.
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const products = await listProducts().catch(() => null)
  if (!products) return fail('Error al obtener productos', 500)

  return ok(products)
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const body = await request.json().catch(() => null)
  if (!body) return fail('Cuerpo de la petición inválido', 400)

  // Campos obligatorios
  const required: (keyof Product)[] = ['name', 'brand', 'category', 'price', 'description', 'presentation', 'stock']
  const missing = required.filter((f) => body[f] === undefined || body[f] === null)
  if (missing.length > 0) {
    return fail(`Campos obligatorios faltantes: ${missing.join(', ')}`, 400)
  }

  const product = await createProduct({
    name: body.name,
    brand: body.brand,
    category: body.category,
    price: Number(body.price),
    description: body.description,
    nutritionalInfo: body.nutritionalInfo ?? { servingSize: '', servingsPerContainer: 0, otherIngredients: [] },
    presentation: body.presentation,
    stock: Number(body.stock),
    images: body.images ?? [],
    goal: body.goal ?? [],
    featured: body.featured ?? false,
    bestSeller: body.bestSeller ?? false,
    discount: body.discount,
    rating: 0,
    reviewCount: 0,
  }).catch((e: Error) => { throw e })

  return ok(product, 201)
}
