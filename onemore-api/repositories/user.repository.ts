import { getAdminFirestore } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { User, UserRole, Address } from '@/types'

const COLLECTION = 'users'

// Forma raw del documento en Firestore (Timestamps aún sin convertir)
interface UserDoc {
  uid: string
  email: string
  name: string
  role: UserRole
  addresses: Address[]
  photoURL?: string
  createdAt: Timestamp | string
}

function docToUser(data: UserDoc): User {
  return {
    id: data.uid,
    email: data.email,
    name: data.name,
    role: data.role ?? 'cliente',
    addresses: data.addresses ?? [],
    photoURL: data.photoURL,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
  }
}

/** Obtiene el perfil de usuario desde Firestore. Devuelve null si no existe. */
export async function getUserByUid(uid: string): Promise<User | null> {
  const db = getAdminFirestore()
  const doc = await db.collection(COLLECTION).doc(uid).get()

  if (!doc.exists) return null

  return docToUser(doc.data() as UserDoc)
}

/**
 * Crea el perfil si no existe (primer login) o actualiza email/name/photoURL
 * sin tocar el campo `role` (evita degradar un administrador a cliente accidentalmente).
 */
export async function upsertUser(data: {
  uid: string
  email: string
  name: string
  photoURL?: string
}): Promise<User> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc(data.uid)
  const snap = await ref.get()

  if (snap.exists) {
    await ref.update({
      email: data.email,
      name: data.name,
      ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
    })
    const updated = await ref.get()
    return docToUser(updated.data() as UserDoc)
  }

  // Usuario nuevo — rol por defecto: cliente
  const newDoc: UserDoc = {
    uid: data.uid,
    email: data.email,
    name: data.name,
    role: 'cliente',
    addresses: [],
    ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
    createdAt: Timestamp.now(),
  }

  await ref.set(newDoc)
  return docToUser(newDoc)
}

/** Actualiza campos editables del perfil (dirección, nombre, etc.). */
export async function updateUser(
  uid: string,
  updates: Partial<Pick<User, 'name' | 'addresses' | 'photoURL' | 'role'>>,
): Promise<User | null> {
  const db = getAdminFirestore()
  const ref = db.collection(COLLECTION).doc(uid)
  const snap = await ref.get()

  if (!snap.exists) return null

  await ref.update(updates as FirebaseFirestore.UpdateData<UserDoc>)
  const updated = await ref.get()
  return docToUser(updated.data() as UserDoc)
}

/** Lista todos los usuarios desde Firestore. */
export async function listUsers(): Promise<User[]> {
  const db = getAdminFirestore()
  const snapshot = await db.collection(COLLECTION).get()
  const users = snapshot.docs.map((doc) => docToUser(doc.data() as UserDoc))

  return users.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
