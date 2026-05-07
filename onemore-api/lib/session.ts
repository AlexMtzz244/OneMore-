import { getAdminAuth } from './firebase-admin'
import type { DecodedIdToken } from 'firebase-admin/auth'

// ─────────────────────────────────────────────────────────────
// Nombre de la cookie httpOnly que almacena la sesión Firebase.
// ─────────────────────────────────────────────────────────────
export const SESSION_COOKIE_NAME = '__onemore_session'

/** Duración de la sesión: 5 días en milisegundos */
export const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000

/**
 * Intercambia un idToken de Firebase por una session cookie firmada.
 * Lanza un error si el idToken es inválido o ha expirado.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_MS,
  })
}

/**
 * Verifica criptográficamente la session cookie.
 * El parámetro `checkRevoked: true` invalida tokens revocados (logout remoto).
 * Lanza si la cookie es inválida, expirada o revocada.
 */
export async function verifySessionCookie(cookie: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifySessionCookie(cookie, true)
}

/** Opciones base para la cookie de sesión */
export function cookieOptions(maxAgeSeconds?: number) {
  return {
    httpOnly: true,
    // secure solo en producción (HTTPS). En dev el proxy de Vite evita el problema de cross-origin.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds ?? SESSION_EXPIRES_MS / 1000,
  }
}
