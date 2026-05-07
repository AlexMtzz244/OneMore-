import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { listUsers } from '@/repositories/user.repository'
import { ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users — Lista todos los usuarios (solo admin)
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const users = await listUsers().catch(() => null)
  if (!users) return fail('Error al obtener usuarios', 500)

  return ok(users)
}
