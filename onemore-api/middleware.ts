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
  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

  // ── Preflight CORS (OPTIONS) ────────────────────────────────
  // Los preflights no llevan cookies, por lo que NO deben pasar
  // por la verificación de sesión. Se responde aquí directamente
  // con los headers CORS necesarios para que el navegador continúe.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!cookie) {
    return NextResponse.json(
      { ok: false, message: 'Autenticación requerida' },
      {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    )
  }

  // Propagar CORS en respuestas exitosas también
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export const config = {
  // Protege rutas de admin, órdenes del usuario y perfil autenticado
  matcher: ['/api/admin/:path*', '/api/orders/:path*', '/api/auth/profile'],
}
