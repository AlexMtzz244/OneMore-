import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { ok } from '@/lib/api-response'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// GET /api/auth/profile
// Devuelve el perfil completo del usuario autenticado (desde Firestore).
// Requiere session cookie válida — el middleware ya verificó su presencia.
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  return ok(user)
}
