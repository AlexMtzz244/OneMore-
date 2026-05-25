# OneMore — Presentación del Proyecto
### Tienda en línea de suplementos deportivos
> **Duración estimada:** 15 minutos · Todo se muestra sobre el sistema desplegado en producción

---

## Guión de la presentación

| # | Sección | Tiempo |
|---|---------|--------|
| 1 | Abrir el sitio — lo que el usuario ve | 1.5 min | T
| 2 | Cómo nació el proyecto y qué problema resuelve | 1 min | T
| 3 | El stack: por qué cada tecnología está ahí | 2 min | T
| 4 | Cómo se usó la IA para construirlo | 1.5 min |D 
| 5 | La arquitectura por dentro | 2.5 min | D
| 6 | Firebase: autenticación y base de datos | 1.5 min | D
| 7 | MVP — qué funciona en producción hoy | 1 min | A
| 8 | Despliegue en Vercel | 1.5 min | A
| 9 | Recorrido completo del sistema | 3 min | A

---

## 1. Abrir el sitio — lo que el usuario ve

> *Abrir el navegador directamente en la URL de producción desplegada en Vercel.*

Lo primero que aparece es la tienda: un hero con carrusel automático, productos destacados, categorías y testimonios. No hay pantalla de carga larga, no hay errores, no hay datos de prueba ficticios — los productos que se ven están en **Firestore**, una base de datos real en la nube.

Esto ya dice mucho del proyecto: es una aplicación funcional, desplegada, que cualquier persona puede visitar desde su teléfono o computadora en este momento.

---

## 2. Qué es OneMore y qué problema resuelve

**OneMore** es una tienda en línea especializada en suplementos deportivos. Permite a un negocio real tener presencia digital con todo lo que eso implica: un catálogo navegable, carrito de compras, checkout con pago real a través de PayPal, y un panel de administración para gestionar el inventario, las órdenes y los clientes — todo en la nube, sin instalar nada.

El proyecto nació como un ejercicio de integración: tomar los conceptos aprendidos en clase durante el semestre y construir algo que funcione igual que una aplicación comercial real. No una demo, no un mockup — una tienda que acepta pagos, guarda órdenes en base de datos y tiene roles de usuario con rutas protegidas.

---

## 3. El stack: por qué cada tecnología está ahí

### El punto de partida fue Figma AI

El proyecto no comenzó con código. Comenzó en **Figma**, usando la herramienta de inteligencia artificial llamada *Make*. A partir del prompt *"tienda online de suplementos deportivos"*, la IA generó automáticamente el diseño visual completo: la paleta de colores, los componentes base, la tipografía, los espaciados, y lo más importante — **exportó el scaffolding inicial en código React + Vite**, listo para funcionar.

Eso nos dio una ventaja enorme al inicio: en lugar de empezar desde cero con una pantalla en blanco, teníamos una base visual sólida que extender con funcionalidad real.

---

### El frontend: Vite + React

El frontend de la tienda es una **Single Page Application (SPA)** construida con **React 18** y **Vite 6**. 

React se eligió porque toda la interfaz se compone de piezas reutilizables: el header aparece en todas las páginas, las tarjetas de producto se repiten en el catálogo y en la home, el carrito está disponible desde cualquier punto. React permite construir esos componentes una sola vez y usarlos en cualquier lugar.

Vite reemplaza a Create React App como herramienta de build. La diferencia práctica es que el servidor de desarrollo arranca en milisegundos y los cambios en código se reflejan al instante en el navegador sin recargar la página completa. También es quien gestiona el **proxy de desarrollo** que resuelve el problema de cookies entre el frontend y el backend — algo que veremos más adelante.

Todo el proyecto está escrito en **TypeScript**, lo que significa que cada componente, cada función, cada dato que llega del servidor tiene un tipo definido. Eso previene errores en tiempo de desarrollo antes de que lleguen a producción.

---

### Los estilos: Tailwind CSS + shadcn/ui

Para los estilos se usa **Tailwind CSS v4**, integrado nativamente con Vite. Tailwind permite escribir estilos directamente en el HTML usando clases utilitarias. En lugar de crear un archivo CSS separado, el estilo vive junto al componente.

Encima de Tailwind se construyeron los componentes de interfaz usando el patrón **shadcn/ui**, que combina **Radix UI** como base accesible y sin estilos con Tailwind para la apariencia. Esto da componentes como modales, dropdowns, selects y tablas que funcionan bien en teclado, son accesibles para lectores de pantalla, y se ven exactamente como queremos.

Para los iconos se usa **Lucide React**, y para las gráficas del panel de administración se usa **Recharts**, que permite renderizar charts de líneas y áreas directamente como componentes React.

---

### El backend: Next.js como API pura

Aquí viene la decisión arquitectónica más importante del proyecto: **el backend no es parte del frontend**. 

Existe una carpeta separada llamada `onemore-api/` que es un proyecto **Next.js 15** independiente. Pero no se usa como una aplicación web con páginas — se usa exclusivamente como una **API REST**. Cada archivo en `onemore-api/app/api/` es un endpoint HTTP que el frontend llama para obtener o modificar datos.

¿Por qué Next.js y no Express o Fastify? Porque Next.js ofrece algo valioso: un **middleware que corre en el Edge Runtime** antes de que cualquier petición llegue a los handlers. Ese middleware es la primera línea de defensa de seguridad — verifica si el usuario tiene una cookie de sesión válida antes de permitir el acceso a las rutas protegidas.

---

### Los pagos: PayPal SDK

En el checkout se usa el **PayPal React SDK** para procesar pagos reales. No es una simulación — si alguien completa el checkout, el pago va a una cuenta de PayPal sandbox configurable para producción. La integración funciona con dos funciones: una que crea la orden en PayPal con el monto correcto, y otra que la captura cuando el usuario aprueba el pago.

---

## 4. Cómo se usó la IA para construir el proyecto

### Ingeniería inversa de arquitectura

En el curso de Programación Web, el proyecto de clase fue desarrollado en **Next.js full-stack**: frontend y API en la misma aplicación. Para OneMore, el desafío fue diferente: queríamos algo más complejo, con el frontend separado del backend, pero sin perder los conceptos aprendidos.

Aquí la IA entró como herramienta de **ingeniería inversa**: se le describió la arquitectura del proyecto de clase y se le preguntó cómo trasladar esos patrones a una estructura desacoplada. La IA ayudó a identificar qué parte del código de Next.js correspondía al frontend y qué parte era lógica de servidor, y cómo reescribir eso como una API independiente que el frontend en Vite pudiera consumir.

### El problema real que resolvió la IA: las cookies cross-origin

Uno de los problemas más concretos fue el manejo de cookies `httpOnly` entre dominios en desarrollo. En producción no hay problema porque ambos servicios tienen dominios en Vercel bajo HTTPS. Pero en desarrollo local, el frontend corre en `localhost:5173` y el backend en `localhost:3002`, y los navegadores bloquean el intercambio de cookies entre orígenes distintos.

La solución fue configurar un **proxy en Vite** que hace pasar las peticiones del frontend como si vinieran del mismo origen. La IA no solo sugirió esto — también ayudó a entender **por qué** funciona, que es lo que realmente importa:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      changeOrigin: true,
      // Toda petición a /api desde el frontend (puerto 5173)
      // se reenvía al backend (puerto 3002) como si viniera del mismo servidor.
      // El navegador ve un solo origen → las cookies httpOnly funcionan.
    },
  },
},
```

### Componentes complejos

El `AdminDashboard` — el panel de administración con tablas, gráficas, CRUD de productos y gestión de órdenes — fue construido con asistencia de IA. Se le dieron las especificaciones funcionales y los tipos TypeScript existentes, y la IA generó la estructura base que luego se refinó. El proceso fue iterativo: probar, ajustar, conectar con el backend real.

### Lo que la IA no puede hacer

La IA acelera, pero no reemplaza la comprensión. Cuando la sesión no se restauraba correctamente al recargar la página, entender por qué requería conocer cómo funciona `onAuthStateChanged` de Firebase, el flujo de la cookie, y el timing entre el SDK del cliente y la respuesta del backend. Ese debugging fue manual.

---

## 5. La arquitectura por dentro

### El flujo completo de una petición

Cuando alguien abre la tienda, esto es lo que ocurre:

```
Navegador (Vite SPA)
      │
      │  GET /api/products
      │  (proxy de Vite → localhost:3002)
      ▼
Middleware de Next.js (Edge Runtime)
      │  ¿Tiene cookie __onemore_session?
      │  → /api/products es público → pasa directo
      ▼
Route Handler: /api/products/route.ts (Node.js Runtime)
      │  llama a product.repository.ts
      ▼
Firestore (Google Cloud)
      │  devuelve los documentos
      ▼
JSON → ProductContext → componentes React
```

Cuando la ruta es protegida (como `/api/admin/products`), el middleware bloquea antes de que el handler siquiera se ejecute si no hay cookie válida.

---

### El sistema de sesión: cómo funciona la autenticación

Este es el mecanismo más importante de seguridad del proyecto. Cuando un usuario inicia sesión:

**1. Firebase emite un `idToken` en el cliente:**
```ts
// AuthContext.tsx — el usuario escribe email y contraseña
const credential = await signInWithEmailAndPassword(auth, email, password)
const idToken = await credential.user.getIdToken()
```

**2. Ese token se envía al backend para crear una cookie de sesión:**
```ts
// session/route.ts — el backend verifica el token con Admin SDK
const decodedToken = await getAdminAuth().verifyIdToken(body.idToken)

// Y crea una session cookie firmada por Firebase (válida 5 días)
const sessionCookie = await createSessionCookie(body.idToken)

// La cookie se establece como httpOnly — el JavaScript del cliente nunca puede leerla
response.cookies.set('__onemore_session', sessionCookie, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
})
```

**3. En cada petición siguiente, el navegador envía la cookie automáticamente:**
```ts
// api-client.ts — todas las peticiones incluyen credentials
const response = await fetch(`${API_BASE}${path}`, {
  method,
  credentials: 'include', // <- envía la cookie httpOnly sin que el código la toque
  headers: { 'Content-Type': 'application/json' },
})
```

La cookie nunca es accesible desde JavaScript — no puede ser robada por un ataque XSS. Esa es la ventaja de `httpOnly`.

---

### Los repositorios: la capa de acceso a datos

El backend tiene una carpeta `repositories/` que separa la lógica de acceso a Firestore del resto de la aplicación. Así luce el repositorio de productos:

```ts
// product.repository.ts
export async function listProducts(category?: ProductCategory): Promise<Product[]> {
  const db = getAdminFirestore()
  const col = db.collection('products')

  // Si hay filtro de categoría, Firestore lo aplica en la nube
  // Si no, trae todos ordenados por fecha de creación
  const snapshot = category
    ? await col.where('category', '==', category).get()
    : await col.orderBy('createdAt', 'desc').get()

  return snapshot.docs.map((doc) => docToProduct(doc.id, doc.data()))
}
```

Este patrón — separar la consulta de la lógica de negocio — fue directamente extrapolado del proyecto de clase. Hace que si mañana se cambia Firestore por otra base de datos, solo cambia el repositorio, no los handlers ni los componentes.

---

### El carrito: estado local con persistencia

El carrito no se guarda en el servidor — se guarda en el `localStorage` del navegador. Esto significa que si alguien agrega productos al carrito y cierra el navegador, los productos siguen ahí cuando vuelve. El `CartContext` maneja esto de forma transparente:

```ts
// CartContext.tsx
useEffect(() => {
  // Al cargar la app, restaura el carrito del localStorage
  const storedCart = localStorage.getItem('cart')
  if (storedCart) setCart(JSON.parse(storedCart))
}, [])

useEffect(() => {
  // Cada vez que el carrito cambia, lo guarda
  localStorage.setItem('cart', JSON.stringify(cart))
}, [cart])
```

---

### Rutas protegidas en el frontend

La protección de rutas no es solo en el backend. En el frontend también hay guardas: si alguien intenta navegar a `/checkout` sin estar autenticado, React Router lo redirige automáticamente al login.

```tsx
// App.tsx — rutas que requieren sesión
<Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <PageTransition><Checkout /></PageTransition>
    </ProtectedRoute>
  }
/>

// La ruta de admin además verifica el rol
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user || !isAdmin()) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
```

---

## 6. Firebase: autenticación y base de datos

### Firebase Authentication — lo que hace en la app

Firebase Authentication maneja el ciclo de vida de las cuentas de usuario: registro, login, y recuperación de contraseña. En la tienda, cuando alguien hace clic en "Crear cuenta", se llama a `createUserWithEmailAndPassword`. Cuando inicia sesión, `signInWithEmailAndPassword`. Firebase valida las credenciales, gestiona la seguridad de las contraseñas, y emite un JWT — el `idToken` — que el backend puede verificar de forma criptográfica.

Hay un listener clave que mantiene la sesión activa entre recargas de página:

```ts
// AuthContext.tsx
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) { setUser(null); return }

  // Si Firebase detecta que el usuario sigue logueado,
  // intenta restaurar la sesión consultando el perfil al backend
  const profileRes = await apiClient.get('/api/auth/profile')
  if (profileRes.ok) setUser(profileRes.data)
})
```

Esto significa que al recargar la página, el usuario no tiene que volver a iniciar sesión.

---

### Firestore — la base de datos

Firestore es una base de datos NoSQL en la nube organizada en colecciones de documentos. El proyecto tiene tres colecciones principales:

- **`users/`** — un documento por usuario, con su email, nombre, rol (`cliente` o `admin`), y direcciones guardadas
- **`products/`** — el catálogo completo: nombre, marca, categoría, precio, stock, imágenes, información nutricional
- **`orders/`** — cada orden creada: qué productos, cuánto total, estado actual, a qué usuario pertenece

El frontend **nunca accede a Firestore directamente**. Toda operación pasa por el backend, que usa el **Firebase Admin SDK** — una versión del SDK con privilegios de administrador que puede leer y escribir cualquier documento sin restricciones de reglas de seguridad del lado cliente. Esto es lo que permite que el panel de admin pueda actualizar estados de órdenes o eliminar productos de forma segura.

---

## 7. MVP — qué funciona en producción hoy

Un MVP es la versión más simple de un producto que entrega valor real. OneMore cumple esa definición:

El flujo de compra está completo de punta a punta. Un usuario puede entrar a la tienda sin tener cuenta, navegar el catálogo, filtrar por categoría, ver el detalle de un producto, agregarlo al carrito, crear una cuenta, completar su dirección de envío, pagar con PayPal, y recibir la confirmación de su orden — todo eso funciona hoy, en producción, sin intervención manual.

El panel de administración permite gestionar ese negocio en tiempo real: crear productos nuevos, actualizar precios y stock, ver todas las órdenes que llegan y cambiarles el estado. Un administrador puede operar la tienda completamente desde ese panel.

Lo que haría crecer este MVP en una siguiente versión: notificaciones por email al confirmar una orden, pagos con tarjeta de crédito via Stripe, y un sistema de reseñas por producto.

---

## 8. Despliegue en Vercel

### Por qué Vercel

Vercel es la plataforma detrás de Next.js — desplegar ahí es la ruta natural. Ofrece hosting gratuito para proyectos académicos, CI/CD automático desde GitHub (cada push a `main` genera un nuevo despliegue), y soporte nativo tanto para apps Vite como para Next.js.

### Dos proyectos en Vercel, un sistema

El frontend (Vite) y el backend (Next.js) son dos proyectos separados en Vercel. Se apuntan a carpetas distintas del mismo repositorio.

Para el **frontend**, las variables de entorno críticas son las credenciales de Firebase (para que el SDK del cliente pueda conectarse), la URL del backend desplegado, y el Client ID de PayPal:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_API_URL=https://onemore-api.vercel.app
VITE_PAYPAL_CLIENT_ID=...
```

Para el **backend**, lo más sensible es la clave privada de la cuenta de servicio de Firebase, que permite usar el Admin SDK:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
SESSION_SECRET=...
```

### El problema de las cookies en producción

En producción, el frontend y el backend tienen dominios distintos (por ejemplo, `onemore.vercel.app` y `onemore-api.vercel.app`). Las cookies que en desarrollo funcionaban a través del proxy de Vite ahora deben cruzar dominios bajo HTTPS real.

La solución fue configurar las cookies con `Secure: true` y `SameSite: 'none'`, que es la combinación que los navegadores permiten para cookies cross-site bajo HTTPS. Así el navegador acepta la cookie del backend y la envía en cada petición al mismo backend, aunque el origen sea diferente al del frontend.

---

## 9. Recorrido completo del sistema

> *Todo lo siguiente se muestra en el sistema desplegado mientras se explica.*

### Lo que ve un usuario que llega por primera vez

Al entrar a la tienda, el carrusel del hero rota automáticamente entre imágenes de fondo. Debajo hay productos destacados con su precio, el badge de "Más vendido" si aplica, y un botón de agregar al carrito que funciona sin necesitar cuenta. Las categorías llevan directamente al catálogo filtrado.

En el catálogo se puede filtrar por tipo de suplemento y por objetivo deportivo (ganar músculo, perder grasa, resistencia). La búsqueda en tiempo real filtra los productos a medida que se escribe — eso no hace una petición al servidor, filtra sobre los datos ya cargados en el contexto.

El detalle de producto muestra la imagen, la descripción, la información nutricional, el selector de cantidad respetando el stock disponible, y el botón de carrito. Si el stock es cero, el botón se deshabilita.

El carrito muestra el resumen actualizable, el total con la moneda seleccionada (el selector de moneda en el header convierte los precios en tiempo real), y el botón de ir al checkout — que redirige al login si el usuario no tiene sesión.

El checkout pide la dirección de envío y muestra el botón de PayPal. Al hacer clic en el botón, se abre la ventana de PayPal, el usuario aprueba el pago, y la app captura la orden y la guarda en Firestore. Redirige a la pantalla de confirmación con el número de orden.

Desde el perfil, el usuario puede cambiar su nombre, foto y direcciones guardadas. En "Mis pedidos" ve el historial completo con el estado de cada orden.

---

### El panel de administración

El acceso es por `/admin/login`, con credenciales de administrador. La diferencia con un usuario normal no es solo visual — el rol `admin` está guardado en Firestore y el backend lo verifica en cada petición a rutas protegidas de admin.

El dashboard principal muestra las métricas del negocio: total de ventas, órdenes activas, productos en bajo stock. La gráfica de ventas usa **Recharts** para mostrar la evolución en el tiempo.

En la sección de productos se puede crear un producto nuevo llenando el formulario en un modal: nombre, marca, categoría, precio, stock, descripción, información nutricional, URL de imagen. Al guardar, el backend escribe el documento en Firestore y el frontend actualiza el listado inmediatamente. Editar o eliminar funciona de la misma forma.

En las órdenes se ven todas las compras realizadas con el estado actual. Al cambiar el estado de `procesando` a `enviado`, por ejemplo, el backend actualiza el documento en Firestore y el usuario lo verá reflejado en su historial de pedidos la próxima vez que consulte.

---

## Resumen

OneMore es la demostración práctica de que los conceptos vistos en el semestre — arquitectura cliente-servidor, autenticación con tokens, base de datos en la nube, protección de rutas, despliegue — se pueden combinar en un sistema real que funciona.

No es una demo académica con datos falsos. Es una tienda que acepta pagos, guarda datos en la nube, y puede ser operada por un administrador real desde un panel web. Eso es lo que distingue a este proyecto.

