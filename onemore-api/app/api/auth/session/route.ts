import { type NextRequest } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { createSessionCookie, cookieOptions, SESSION_COOKIE_NAME, SESSION_EXPIRES_MS } from '@/lib/session'
import { upsertUser } from '@/repositories/user.repository'
import { ok, fail } from '@/lib/api-response'

// firebase-admin requiere el runtime de Node.js (no Edge)
export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────
// POST /api/auth/session
// Recibe el idToken de Firebase (obtenido en el cliente tras login/register),
// lo verifica con Admin SDK, crea una session cookie httpOnly y hace upsert
// del perfil del usuario en Firestore.
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.idToken !== 'string') {
    return fail('El campo idToken es requerido y debe ser un string', 400)
  }

  // Verificar el idToken con Firebase Admin
  const decodedToken = await getAdminAuth()
    .verifyIdToken(body.idToken)
    .catch(() => null)

  if (!decodedToken) {
    return fail('idToken inválido o expirado', 401)
  }

  // Crear la session cookie firmada por Firebase
  const sessionCookie = await createSessionCookie(body.idToken).catch(() => null)

  if (!sessionCookie) {
    return fail('Error interno al generar la sesión', 500)
  }

  // Crear o actualizar el perfil en Firestore (no sobrescribe el rol)
  const user = await upsertUser({
    uid: decodedToken.uid,
    email: decodedToken.email ?? '',
    name: decodedToken.name ?? decodedToken.email?.split('@')[0] ?? 'Usuario',
    photoURL: decodedToken.picture,
  }).catch(() => null)

  if (!user) {
    return fail('Error al sincronizar el perfil de usuario', 500)
  }

  const response = ok(user, 200)

  // Establecer la cookie httpOnly en el navegador
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, cookieOptions(SESSION_EXPIRES_MS / 1000))

  return response
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/auth/session
// Cierra la sesión: revoca los tokens de Firebase y borra la cookie.
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const existingCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (existingCookie) {
    try {
      // Verificar para obtener el UID y revocar todos sus refresh tokens
      const decoded = await getAdminAuth().verifySessionCookie(existingCookie)
      await getAdminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // Si la cookie ya es inválida, ignorar el error y proceder a borrarla
    }
  }

  const response = ok(null)
  response.cookies.set(SESSION_COOKIE_NAME, '', cookieOptions(0))

  return response
}
