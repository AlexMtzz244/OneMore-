import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Middleware (Edge runtime): primera línea de defensa.
//
// IMPORTANTE: firebase-admin NO puede ejecutarse en el Edge runtime.
// NO importar nada de lib/session ni lib/firebase-admin aquí —
// esos módulos arrastran firebase-admin que usa APIs "node:" incompatibles.
// La constante se define inline para evitar esa cadena de imports.
// La verificación criptográfica completa ocurre en cada route handler
// mediante requireAuth() / requireAdmin() (Node.js runtime).
// ─────────────────────────────────────────────────────────────

const SESSION_COOKIE_NAME = '__onemore_session'

export function middleware(request: NextRequest): NextResponse {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!cookie) {
    return NextResponse.json(
      { ok: false, message: 'Autenticación requerida' },
      { status: 401 },
    )
  }

  return NextResponse.next()
}

export const config = {
  // Protege rutas de admin, órdenes del usuario y perfil autenticado
  matcher: ['/api/admin/:path*', '/api/orders/:path*', '/api/auth/profile'],
}
