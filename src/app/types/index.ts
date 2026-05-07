// Tipos principales de la aplicación

export type UserRole = 'cliente' | 'administrador';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
  photoURL?: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export type ProductCategory = 'proteina' | 'creatina' | 'pre-workout' | 'accesorios';
export type ProductGoal = 'volumen' | 'definicion' | 'fuerza' | 'resistencia' | 'general';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  description: string;
  nutritionalInfo: NutritionalInfo;
  presentation: string;
  stock: number;
  images: string[];
  goal: ProductGoal[];
  featured: boolean;
  bestSeller: boolean;
  discount?: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionalInfo {
  servingSize: string;
  servingsPerContainer: number;
  protein?: string;
  carbs?: string;
  fats?: string;
  calories?: string;
  otherIngredients: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type OrderStatus = 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // porcentaje
  validUntil: string;
  active: boolean;
}

// Nuevos tipos para el Dashboard
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface Notification {
  id: string;
  type: 'sale' | 'stock' | 'order' | 'user';
  message: string;
  timestamp: string;
  read: boolean;
}