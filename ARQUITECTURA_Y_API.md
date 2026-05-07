# OneMore - Arquitectura, APIs y Guía de Desarrollo

## 📋 Resumen del Proyecto

**OneMore** es una plataforma e-commerce completa construida con una arquitectura moderna de **SPA frontend + backend API centralizado**:

- **Frontend**: Vite 6.3.5 + React 18.3.1 (puerto 5173) → SPA moderna con TypeScript, Tailwind CSS, React Router
- **Backend**: Next.js 15.5.16 (puerto 3001) → API REST centralizada con Node.js runtime
- **Base de datos**: Firestore (Google Cloud) → almacenamiento de usuarios, productos, órdenes
- **Autenticación**: Firebase Authentication → OAuth2 seguro, idTokens, session cookies httpOnly
- **Seguridad**: Middleware protegiendo rutas admin, cookies de sesión firmadas, roles de usuario (cliente/admin)

---

## 🎯 Qué Se Puede Hacer

### Como Usuario Cliente
- ✅ Registrarse e iniciar sesión con email/contraseña
- ✅ Ver catálogo completo de productos
- ✅ Buscar productos por nombre
- ✅ Ver detalles de producto individual
- ✅ Agregar/remover productos del carrito
- ✅ Completar checkout y crear órdenes
- ✅ Ver historial de órdenes personales
- ✅ Actualizar perfil (nombre, dirección, foto)

### Como Administrador
- ✅ Gestionar productos (crear, editar, eliminar)
- ✅ Controlar inventario y precios
- ✅ Ver todas las órdenes del sistema
- ✅ Actualizar estado de órdenes

---

## 🏗️ Cómo Funciona - Flujo de Arquitectura

### 1. **Frontend (Vite)**
```
Usuario en navegador (localhost:5173)
    ↓
React App (AuthContext + ProductContext + CartContext)
    ↓
Vite Dev Proxy (/api → localhost:3001)
    ↓
Request con credentials: 'include' (envía cookie httpOnly)
```

### 2. **Middleware (Next.js Edge Runtime)**
```
Petición entrante → http://localhost:3001
    ↓
middleware.ts (valida presencia de cookie en rutas protegidas)
    ↓
✅ Cookie válida → permite acceso a /api/admin/*, /api/orders/*, /api/auth/profile
❌ Sin cookie → retorna 401 Unauthorized
```

### 3. **API Handlers (Next.js Node.js Runtime)**
```
POST /api/auth/session
    ↓
1. Recibe idToken del cliente Firebase
2. Verifica con Firebase Admin SDK
3. Crea session cookie firmada
4. Hace upsert del perfil en Firestore
5. Retorna cookie + usuario
    ↓
Cliente guarda cookie en navegador (httpOnly, automático)
```

### 4. **Firestore (Base de Datos)**
```
Colecciones:
├── users/        → perfiles de usuario (uid, email, name, role, addresses, createdAt)
├── products/     → catálogo (id, name, description, price, stock, category, image)
├── orders/       → historial (id, userId, items, total, status, createdAt, updatedAt)
└── (extensible)
```

---

## 🔑 Archivos Clave para Manejo de APIs

### **Backend - Estructura de Carpetas**

```
onemore-api/
├── app/api/
│   ├── auth/
│   │   ├── session/
│   │   │   └── route.ts          ⭐ POST crear sesión, DELETE cerrar sesión
│   │   └── profile/
│   │       └── route.ts          ⭐ GET perfil del usuario autenticado (protegido por middleware)
│   ├── products/
│   │   └── route.ts              ⭐ GET productos públicos
│   ├── admin/
│   │   ├── products/
│   │   │   ├── route.ts          ⭐ GET/POST productos (admin only)
│   │   │   └── [id]/route.ts     ⭐ PUT/DELETE producto específico (admin only)
│   │   └── orders/
│   │       ├── route.ts          ⭐ GET todas las órdenes (admin only)
│   │       └── [id]/route.ts     ⭐ PUT actualizar estado orden (admin only)
│   └── orders/
│       ├── route.ts              ⭐ GET órdenes del usuario, POST crear orden (auth required)
│       └── [id]/route.ts         ⭐ GET orden específica (auth required)
│
├── lib/
│   ├── firebase-admin.ts         ⭐ Singleton de Firebase Admin SDK
│   ├── session.ts                ⭐ Funciones createSessionCookie, verifySessionCookie
│   ├── api-response.ts           ⭐ ok<T>() y fail() respuestas estándar
│   └── auth-helpers.ts           ⭐ requireAuth() y requireAdmin() para proteger rutas
│
├── repositories/                 ⭐ Capa de acceso a datos (Firestore CRUD)
│   ├── user.repository.ts        ⭐ getUserByUid(), upsertUser()
│   ├── product.repository.ts     ⭐ getProducts(), getProductById(), createProduct(), updateProduct(), deleteProduct()
│   └── order.repository.ts       ⭐ getOrdersByUserId(), getOrderById(), getAllOrders(), createOrder()
│
├── types/
│   └── index.ts                  ⭐ Tipos TypeScript compartidos (User, Product, Order, etc.)
│
├── middleware.ts                 ⭐ Valida presencia de session cookie en rutas protegidas
├── next.config.ts                ⭐ Configuración webpack (serverExternalPackages para firebase-admin)
├── .env.local                    ⭐ Credenciales Firebase Admin (¡secreto, nunca commitear!)
└── package.json                  ⭐ npm scripts: "dev": "next dev --port 3001"
```

### **Frontend - Archivos de API**

```
src/
├── lib/
│   ├── api-client.ts             ⭐ Cliente HTTP centralizado (fetch con credentials: 'include')
│   ├── firebase.ts               ⭐ Inicialización Firebase Auth cliente
│   └── (otros helpers)
│
├── app/contexts/
│   ├── AuthContext.tsx           ⭐ login(), register(), logout(), onAuthStateChanged()
│   ├── ProductContext.tsx        ⭐ fetchProducts(), getProductById(), (admin: createProduct, updateProduct, deleteProduct)
│   ├── CartContext.tsx           ⭐ addToCart(), removeFromCart(), checkout()
│   └── (otros contextos)
│
├── app/components/
│   ├── Login.tsx                 ⭐ Formulario de login → AuthContext.login()
│   ├── ProductCatalog.tsx        ⭐ Muestra productos desde ProductContext
│   ├── Cart.tsx                  ⭐ Carrito integrado con CartContext
│   ├── Checkout.tsx              ⭐ Confirmación y envío a /api/orders
│   ├── OrderHistory.tsx          ⭐ Historial de órdenes personales
│   ├── AdminPanel.tsx            ⭐ Panel para admin (gestión de productos/órdenes)
│   └── (otros componentes)
│
└── vite.config.ts                ⭐ Proxy: /api → http://localhost:3001
```

---

## 📡 Formato Estándar de Respuestas API

**Todas las respuestas siguen este formato:**

```typescript
// ✅ Éxito
{
  "ok": true,
  "data": { /* objeto con datos */ },
  "status": 200
}

// ❌ Error
{
  "ok": false,
  "message": "Descripción del error",
  "status": 400 | 401 | 403 | 500
}
```

**Funciones de respuesta** en `lib/api-response.ts`:
```typescript
ok<T>(data: T, status = 200) // Retorna { ok: true, data, status }
fail(message: string, status = 400) // Retorna { ok: false, message, status }
```

---

## 🔐 Flujo de Autenticación Completo

### **1. Registro**
```
1. Usuario llena formulario (email, contraseña, nombre)
2. Frontend: createUserWithEmailAndPassword(email, password) → Firebase Auth
3. Frontend: updateProfile(name, photoURL) → Firebase Auth
4. Frontend: getIdToken() → obtiene JWT del usuario
5. Frontend: POST /api/auth/session { idToken }
6. Backend: verifyIdToken(idToken) → valida con Firebase Admin SDK
7. Backend: createSessionCookie(idToken) → genera cookie firmada
8. Backend: upsertUser() → crea documento en Firestore /users/{uid}
9. Backend: responde con User object + establece cookie httpOnly
10. Frontend: guarda usuario en AuthContext
```

### **2. Login**
```
1. Usuario ingresa email + contraseña
2. Frontend: signInWithEmailAndPassword(email, password) → Firebase Auth
3. Frontend: getIdToken() → obtiene JWT
4. Frontend: POST /api/auth/session { idToken }
5-10. Mismo flujo que registro (pasos 6-10)
```

### **3. Acceso a Rutas Protegidas**
```
1. Cliente hace request: GET /api/auth/profile
2. Middleware: verifica presencia de cookie __onemore_session
   ✅ Cookie existe → permite acceso
   ❌ Sin cookie → responde 401 Unauthorized
3. Handler: verifySessionCookie(cookie) → valida con Firebase Admin SDK
4. Handler: responde con datos protegidos
```

### **4. Logout**
```
1. Frontend: DELETE /api/auth/session
2. Backend: verifica la cookie existente
3. Backend: revokeRefreshTokens(uid) → invalida tokens del usuario en Firebase
4. Backend: borra cookie del navegador
5. Frontend: signOut() → cierra sesión en Firebase Auth
6. Frontend: limpia AuthContext
```

---

## 🔧 Configuración de Desarrollo

### **Variables de Entorno Backend** (`.env.local`)
```env
# Firebase Admin Credentials (real service account)
FIREBASE_ADMIN_PROJECT_ID=onemore-843b8
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@onemore-843b8.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Servidor
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### **Variables de Entorno Frontend** (`.env.local` o `.env.example`)
```env
# Vacío = usa proxy de Vite
VITE_API_URL=
```

### **Iniciar Desarrollo**

**Terminal 1 - Backend:**
```bash
cd onemore-api
npm run dev  # Escucha en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev  # Escucha en http://localhost:5173
# Automáticamente proxea /api → localhost:3001
```

---

## 📤 Endpoints de API Disponibles

### **Public (sin autenticación)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista todos los productos |

### **Auth (requiere idToken en body)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/session` | Crea sesión + cookie |
| DELETE | `/api/auth/session` | Cierra sesión + revoca tokens |

### **Protected (requiere cookie válida)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/profile` | Obtiene perfil del usuario autenticado |
| GET | `/api/orders` | Obtiene órdenes del usuario |
| POST | `/api/orders` | Crea nueva orden |
| GET | `/api/orders/{id}` | Obtiene detalles de orden |

### **Admin Only (requiere cookie + role:admin)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/products` | Lista todos los productos |
| POST | `/api/admin/products` | Crea nuevo producto |
| PUT | `/api/admin/products/{id}` | Actualiza producto |
| DELETE | `/api/admin/products/{id}` | Elimina producto |
| GET | `/api/admin/orders` | Lista todas las órdenes |
| PUT | `/api/admin/orders/{id}` | Actualiza estado de orden |

---

## 🐛 Bugs Conocidos Resueltos

### ✅ Resuelto: `UnhandledSchemeError: node:process`
**Problema**: webpack intentaba bundlear `firebase-admin` y sus subpaths para Edge runtime.
**Solución**: `serverExternalPackages` en `next.config.ts` lista explícitamente todos los subpaths:
```typescript
serverExternalPackages: [
  'firebase-admin', 'firebase-admin/app', 'firebase-admin/auth',
  'firebase-admin/firestore', // ... todos los subpaths
]
```

### ✅ Resuelto: Middleware cargando firebase-admin
**Problema**: `middleware.ts` importaba `SESSION_COOKIE_NAME` desde `lib/session.ts` que a su vez importaba `firebase-admin` → crash en Edge runtime.
**Solución**: `SESSION_COOKIE_NAME` inlineado directamente en `middleware.ts`:
```typescript
const SESSION_COOKIE_NAME = '__onemore_session'
```

### ✅ Resuelto: photoURL undefined en Firestore
**Problema**: Cuando usuario sin foto de perfil, `photoURL: undefined` rechazado por Firestore.
**Solución**: Spread condicional en `user.repository.ts`:
```typescript
...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
```

---

## 🚀 Próximos Pasos / Extensibilidad

1. **Búsqueda avanzada**: Agregar full-text search con Atlas Search
2. **Reseñas de productos**: Nueva colección + endpoint de lectura/escritura
3. **Wishlist**: Campo en usuarios + endpoints GET/POST
4. **Notificaciones**: Integrar Firebase Cloud Messaging
5. **Analytics**: Rastrear eventos de usuario
6. **Pagos**: Integrar Stripe/PayPal en checkout
7. **Reportes**: Dashboard admin con gráficas
8. **Cache**: Redis para sesiones y productos frecuentes
9. **Tests**: Unit tests (Vitest) + integration tests (Playwright)
10. **Deployment**: Docker + Azure Container Apps o Vercel

---

## 📚 Tipos TypeScript Clave

```typescript
// User - Perfil de usuario
interface User {
  id: string
  email: string
  name: string
  role: 'cliente' | 'admin'
  addresses: Address[]
  photoURL?: string
  createdAt: string // ISO
}

// Product - Artículo del catálogo
interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  createdAt: string
  updatedAt: string
}

// Order - Historial de compras
interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// ApiResponse - Respuesta estándar
interface ApiResponse<T> {
  ok: boolean
  data?: T
  message?: string
}
```

---

## 🎓 Aprendizajes Clave

1. **Proxy en dev**: Vite proxy resuelve CORS y cookies sin necesidad de HTTPS en desarrollo
2. **Edge Runtime**: No puede usar módulos de Node.js (firebase-admin), solo lógica simple
3. **Session Cookies**: httpOnly + secure (prod) + sameSite previene CSRF
4. **Firestore**: Rechaza `undefined`, usa spread condicional o `.delete()` para campos opcionales
5. **Firebase Admin**: idToken válido solo 5 minutos, `createCustomToken` para testing
6. **TypeScript**: Tipos compartidos entre frontend/backend en `types/index.ts`
7. **Modularity**: Repositories separan lógica de acceso a datos de handlers

---

## 📞 Soporte Rápido

**Error 500 en login?**
→ Revisar `/api/auth/session` handler y `user.repository.ts` por campos undefined

**Cookie no se envía?**
→ Verificar `credentials: 'include'` en `api-client.ts` y `changeOrigin: true` en Vite proxy

**Firestore vacío?**
→ Verificar credenciales `.env.local` y que el proyecto ID coincida

**Rutas admin 401?**
→ Revisar middleware matcher y que usuario tenga `role: 'admin'` en Firestore

---

**Última actualización**: Mayo 6, 2026
**Versiones**: Next.js 15.5.16 | Vite 6.3.5 | React 18.3.1 | Firebase Admin 12.3
