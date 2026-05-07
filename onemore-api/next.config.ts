import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // firebase-admin usa subpath imports (firebase-admin/app, /auth, /firestore).
  // serverExternalPackages con el nombre raíz NO cubre esos subpaths, por lo que
  // webpack intenta bundlearlos y falla al encontrar importaciones "node:" internas.
  // Solución: listar cada subpath explícitamente para que Next.js los trate como
  // módulos nativos de Node.js y no los incluya en el bundle.
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/auth',
    'firebase-admin/firestore',
    'firebase-admin/database',
    'firebase-admin/messaging',
    'firebase-admin/storage',
    '@google-cloud/firestore',
    'google-auth-library',
    'google-gax',
    'gcp-metadata',
    'google-logging-utils',
  ],

  async headers() {
    // CORS only needed in development when NOT using the Vite dev proxy
    if (process.env.NODE_ENV !== 'development') return []

    const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: origin },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

export default nextConfig
