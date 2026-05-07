// ─────────────────────────────────────────────────────────────
// Tipos compartidos entre backend y frontend.
// Deben mantenerse en sincronía con src/app/types/index.ts del cliente Vite.
// Las fechas SIEMPRE se exponen como ISO strings (Firestore Timestamps se convierten
// antes de salir de los repositorios).
// ─────────────────────────────────────────────────────────────

export type UserRole = 'cliente' | 'administrador'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  addresses: Address[]
  createdAt: string
  photoURL?: string
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export type ProductCategory = 'proteina' | 'creatina' | 'pre-workout' | 'accesorios'
export type ProductGoal = 'volumen' | 'definicion' | 'fuerza' | 'resistencia' | 'general'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  description: string
  nutritionalInfo: NutritionalInfo
  presentation: string
  stock: number
  images: string[]
  goal: ProductGoal[]
  featured: boolean
  bestSeller: boolean
  discount?: number
  rating: number
  reviewCount: number
  createdAt: string
}

export interface NutritionalInfo {
  servingSize: string
  servingsPerContainer: number
  protein?: string
  carbs?: string
  fats?: string
  calories?: string
  otherIngredients: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado'

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: OrderStatus
  shippingAddress: Address
  paymentMethod: string
  createdAt: string
  updatedAt: string
}
