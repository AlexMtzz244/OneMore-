import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Formato unificado de respuestas de la API.
// Todas las rutas devuelven { ok, data?, message? }
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  message?: string
}

/** Respuesta exitosa — HTTP 200 por defecto */
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status })
}

/** Respuesta de error con mensaje descriptivo */
export function fail(message: string, status = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ ok: false, message }, { status })
}
