import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionCookie } from './session'
import { getUserByUid } from '../repositories/user.repository'
import type { User } from '../types'

// ─────────────────────────────────────────────────────────────
// Helpers de autenticación para route handlers.
// Verifican la session cookie con Firebase Admin SDK (Node.js runtime)
// y devuelven el usuario o un NextResponse de error listo para retornar.
// ─────────────────────────────────────────────────────────────

type AuthSuccess = { user: User; error: null }
type AuthFailure = { user: null; error: NextResponse }
type AuthResult = AuthSuccess | AuthFailure

function unauthorized(message: string): AuthFailure {
  return {
    user: null,
    error: NextResponse.json({ ok: false, message }, { status: 401 }),
  }
}

function forbidden(message: string): AuthFailure {
  return {
    user: null,
    error: NextResponse.json({ ok: false, message }, { status: 403 }),
  }
}

/**
 * Verifica la session cookie y devuelve el perfil del usuario desde Firestore.
 * Patrón de uso en route handlers:
 *   const { user, error } = await requireAuth(request)
 *   if (error) return error
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!cookie) return unauthorized('Autenticación requerida')

  try {
    const decoded = await verifySessionCookie(cookie)
    const user = await getUserByUid(decoded.uid)

    if (!user) return unauthorized('Usuario no encontrado en Firestore')

    return { user, error: null }
  } catch {
    return unauthorized('Sesión inválida o expirada')
  }
}

/**
 * Como requireAuth, pero además valida que el usuario tenga rol 'administrador'.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const result = await requireAuth(request)

  if (result.error !== null) return result

  if (result.user.role !== 'administrador') {
    return forbidden('Acceso denegado: se requiere rol de administrador')
  }

  return result
}
