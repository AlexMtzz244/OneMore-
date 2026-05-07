// ─────────────────────────────────────────────────────────────
// Cliente HTTP centralizado para comunicarse con el backend Next.js.
//
// En desarrollo usa el proxy de Vite (/api → localhost:3001),
// por lo que API_BASE está vacío y la cookie se envía en el mismo origen.
// En producción, VITE_API_URL puede apuntar al dominio del backend.
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  message?: string
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include', // Envía la session cookie httpOnly en cada petición
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const json = (await response.json()) as ApiResponse<T>
    return json
  } catch {
    return { ok: false, message: 'Error de red: no se pudo conectar con el servidor' }
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
