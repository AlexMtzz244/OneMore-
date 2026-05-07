import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

// ─────────────────────────────────────────────────────────────
// Singleton pattern: evita múltiples inicializaciones en hot-reload de Next.js.
// ─────────────────────────────────────────────────────────────
let adminApp: App | undefined

function getApp(): App {
  if (adminApp) return adminApp

  // Reutiliza instancia si ya fue inicializada (ej. hot-reload de Next.js dev)
  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]!
    return adminApp
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  // Los \n literales en la variable de entorno deben convertirse a saltos de línea reales
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Variables de entorno de Firebase Admin incompletas. ' +
        'Verifica FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en .env.local',
    )
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  })

  return adminApp
}

export function getAdminAuth(): Auth {
  return getAuth(getApp())
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getApp())
}
