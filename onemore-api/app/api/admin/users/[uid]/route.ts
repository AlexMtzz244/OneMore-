import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { updateUser } from '@/repositories/user.repository'
import { ok, fail } from '@/lib/api-response'
import type { UserRole } from '@/types'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/users/:uid — Actualiza rol de usuario (solo admin)
// ─────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const body = await request.json().catch(() => null)
  if (!body) return fail('Cuerpo de la petición inválido', 400)

  const role = body.role as UserRole | undefined
  if (role !== 'cliente' && role !== 'administrador') {
    return fail('Rol inválido', 400)
  }

  const updated = await updateUser(params.uid, { role }).catch(() => null)
  if (!updated) return fail('Usuario no encontrado', 404)

  return ok(updated)
}
