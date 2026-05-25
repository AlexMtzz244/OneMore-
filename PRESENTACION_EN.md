# OneMore — Project Presentation
### Online Sports Supplement Store
> **Estimated duration:** 15 minutes · Everything is shown on the live production system

---

## Presentation Script

| # | Section | Time |
|---|---------|------|
| 1 | Open the site — what the user sees | 1.5 min |
| 2 | How the project was born and what problem it solves | 1 min |
| 3 | The stack: why each technology is there | 2 min |
| 4 | How AI was used to build it | 1.5 min |
| 5 | The architecture from the inside | 2.5 min |
| 6 | Firebase: authentication and database | 1.5 min |
| 7 | MVP — what works in production today | 1 min |
| 8 | Deployment on Vercel | 1.5 min |
| 9 | Full system walkthrough | 3 min |

---

## 1. Open the site — what the user sees

> *Open the browser directly on the production URL deployed on Vercel.*

The first thing that appears is the store: a hero with an auto-rotating carousel, featured products, categories, and testimonials. No long loading screens, no errors, no fake test data — the products visible are in **Firestore**, a real cloud database.

This already says a lot about the project: it is a functional application, deployed, that anyone can visit from their phone or computer right now.

---

## 2. What OneMore is and what problem it solves

**OneMore** is an online store specializing in sports supplements. It allows a real business to have a digital presence with everything that implies: a browsable catalog, shopping cart, checkout with real payment through PayPal, and an admin panel to manage inventory, orders, and customers — all in the cloud, nothing to install.

The project was born as an integration exercise: take the concepts learned in class during the semester and build something that works just like a real commercial application. Not a demo, not a mockup — a store that accepts payments, saves data to a cloud database, and has user roles with protected routes.

---

## 3. The stack: why each technology is there

### The starting point was Figma AI

The project did not begin with code. It began in **Figma**, using the AI tool called *Make*. From the prompt *"online sports supplement store"*, the AI automatically generated the complete visual design: the color palette, base components, typography, spacing, and most importantly — **it exported the initial scaffolding as working React + Vite code**.

That gave a huge advantage at the start: instead of beginning from scratch with a blank screen, there was a solid visual base to extend with real functionality.

---

### The frontend: Vite + React

The store's frontend is a **Single Page Application (SPA)** built with **React 18** and **Vite 6**.

React was chosen because the entire interface is built from reusable pieces: the header appears on every page, product cards repeat across the catalog and the home, the cart is accessible from anywhere. React allows building those components once and using them everywhere.

Vite replaces Create React App as the build tool. The practical difference is that the development server starts in milliseconds and code changes are reflected instantly in the browser without reloading the whole page. It also manages the **development proxy** that solves the cookie problem between frontend and backend — something we will see shortly.

The entire project is written in **TypeScript**, meaning every component, every function, every piece of data arriving from the server has a defined type. That prevents bugs at development time before they reach production.

---

### Styles: Tailwind CSS + shadcn/ui

For styles, **Tailwind CSS v4** is used, integrated natively with Vite. Tailwind allows writing styles directly in HTML using utility classes. Instead of creating a separate CSS file, the style lives alongside the component.

On top of Tailwind, the UI components are built using the **shadcn/ui** pattern, which combines **Radix UI** as an accessible, unstyled base with Tailwind for the appearance. This provides components like modals, dropdowns, selects, and tables that work correctly with keyboard navigation, are accessible for screen readers, and look exactly as intended.

**Lucide React** is used for icons, and **Recharts** is used for the admin panel charts — it renders line and area charts directly as React components.

---

### The backend: Next.js as a pure API

This is the most important architectural decision of the project: **the backend is not part of the frontend**.

There is a separate folder called `onemore-api/` which is an independent **Next.js 15** project. But it is not used as a web application with pages — it is used exclusively as a **REST API**. Every file in `onemore-api/app/api/` is an HTTP endpoint that the frontend calls to read or modify data.

Why Next.js instead of Express or Fastify? Because Next.js offers something valuable: a **middleware that runs on the Edge Runtime** before any request reaches the handlers. That middleware is the first security line of defense — it checks whether the user has a valid session cookie before allowing access to protected routes.

---

### Payments: PayPal SDK

At checkout, the **PayPal React SDK** is used to process real payments. It is not a simulation — if someone completes the checkout, the payment goes to a PayPal sandbox account configurable for production. The integration works with two functions: one that creates the order in PayPal with the correct amount, and another that captures it when the user approves the payment.

---

## 4. How AI was used to build the project

### Reverse engineering of architecture

In the Web Programming course, the class project was developed in **full-stack Next.js**: frontend and API in the same application. For OneMore, the challenge was different: we wanted something more complex, with the frontend separated from the backend, but without losing the concepts learned.

Here AI entered as a **reverse engineering tool**: the class project architecture was described to it, and we asked how to translate those patterns into a decoupled structure. AI helped identify which part of the Next.js code corresponded to the frontend and which was server logic, and how to rewrite that as an independent API that the Vite frontend could consume.

### The concrete problem AI solved: cross-origin cookies

One of the most specific problems was handling `httpOnly` cookies between domains in development. In production there is no issue because both services have Vercel domains under HTTPS. But in local development, the frontend runs on `localhost:5173` and the backend on `localhost:3002`, and browsers block cookie exchange between different origins.

The solution was to configure a **Vite proxy** that makes the frontend's requests appear to come from the same origin. AI did not just suggest this — it also helped understand **why** it works, which is what really matters:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      changeOrigin: true,
      // Every request to /api from the frontend (port 5173)
      // is forwarded to the backend (port 3002) as if it came from the same server.
      // The browser sees a single origin → httpOnly cookies work.
    },
  },
},
```

### Complex components

The `AdminDashboard` — the admin panel with tables, charts, product CRUD, and order management — was built with AI assistance. Functional specifications and the existing TypeScript types were provided, and AI generated the base structure that was later refined. The process was iterative: test, adjust, connect to the real backend.

### What AI cannot do

AI accelerates, but it does not replace understanding. When the session was not being restored correctly on page reload, understanding why required knowing how Firebase's `onAuthStateChanged` works, the cookie flow, and the timing between the client SDK and the backend response. That debugging was manual.

---

## 5. The architecture from the inside

### The complete flow of a request

When someone opens the store, this is what happens:

```
Browser (Vite SPA)
      │
      │  GET /api/products
      │  (Vite proxy → localhost:3002)
      ▼
Next.js Middleware (Edge Runtime)
      │  Does it have a __onemore_session cookie?
      │  → /api/products is public → passes through
      ▼
Route Handler: /api/products/route.ts (Node.js Runtime)
      │  calls product.repository.ts
      ▼
Firestore (Google Cloud)
      │  returns documents
      ▼
JSON → ProductContext → React components
```

When the route is protected (like `/api/admin/products`), the middleware blocks before the handler even executes if there is no valid cookie.

---

### The session system: how authentication works

This is the most important security mechanism in the project. When a user logs in:

**1. Firebase issues an `idToken` on the client:**
```ts
// AuthContext.tsx — the user types email and password
const credential = await signInWithEmailAndPassword(auth, email, password)
const idToken = await credential.user.getIdToken()
```

**2. That token is sent to the backend to create a session cookie:**
```ts
// session/route.ts — the backend verifies the token with Admin SDK
const decodedToken = await getAdminAuth().verifyIdToken(body.idToken)

// Creates a session cookie signed by Firebase (valid for 5 days)
const sessionCookie = await createSessionCookie(body.idToken)

// The cookie is set as httpOnly — client-side JavaScript can never read it
response.cookies.set('__onemore_session', sessionCookie, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
})
```

**3. On every subsequent request, the browser sends the cookie automatically:**
```ts
// api-client.ts — all requests include credentials
const response = await fetch(`${API_BASE}${path}`, {
  method,
  credentials: 'include', // <- sends the httpOnly cookie without the code touching it
  headers: { 'Content-Type': 'application/json' },
})
```

The cookie is never accessible from JavaScript — it cannot be stolen by an XSS attack. That is the advantage of `httpOnly`.

---

### Repositories: the data access layer

The backend has a `repositories/` folder that separates Firestore access logic from the rest of the application. Here is what the product repository looks like:

```ts
// product.repository.ts
export async function listProducts(category?: ProductCategory): Promise<Product[]> {
  const db = getAdminFirestore()
  const col = db.collection('products')

  // If there is a category filter, Firestore applies it in the cloud
  // Otherwise, it fetches all ordered by creation date
  const snapshot = category
    ? await col.where('category', '==', category).get()
    : await col.orderBy('createdAt', 'desc').get()

  return snapshot.docs.map((doc) => docToProduct(doc.id, doc.data()))
}
```

This pattern — separating the query from the business logic — was directly extrapolated from the class project. If Firestore is swapped for a different database tomorrow, only the repository changes, not the handlers or the components.

---

### The cart: local state with persistence

The cart is not saved on the server — it is saved in the browser's `localStorage`. This means that if someone adds products to the cart and closes the browser, the products are still there when they return. `CartContext` handles this transparently:

```ts
// CartContext.tsx
useEffect(() => {
  // When the app loads, restore the cart from localStorage
  const storedCart = localStorage.getItem('cart')
  if (storedCart) setCart(JSON.parse(storedCart))
}, [])

useEffect(() => {
  // Every time the cart changes, save it
  localStorage.setItem('cart', JSON.stringify(cart))
}, [cart])
```

---

### Protected routes on the frontend

Route protection is not only in the backend. On the frontend there are guards too: if someone tries to navigate to `/checkout` without being authenticated, React Router automatically redirects them to the login page.

```tsx
// App.tsx — routes that require a session
<Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <PageTransition><Checkout /></PageTransition>
    </ProtectedRoute>
  }
/>

// The admin route also checks the role
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user || !isAdmin()) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
```

---

## 6. Firebase: authentication and database

### Firebase Authentication — what it does in the app

Firebase Authentication manages the user account lifecycle: registration, login, and password reset. In the store, when someone clicks "Create account", `createUserWithEmailAndPassword` is called. When logging in, `signInWithEmailAndPassword`. Firebase validates credentials, manages password security, and issues a JWT — the `idToken` — that the backend can verify cryptographically.

There is one key listener that keeps the session alive across page reloads:

```ts
// AuthContext.tsx
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) { setUser(null); return }

  // If Firebase detects the user is still logged in,
  // try to restore the session by querying the profile from the backend
  const profileRes = await apiClient.get('/api/auth/profile')
  if (profileRes.ok) setUser(profileRes.data)
})
```

This means that on page reload, the user does not have to log in again.

---

### Firestore — the database

Firestore is a NoSQL cloud database organized in document collections. The project has three main collections:

- **`users/`** — one document per user, with their email, name, role (`cliente` or `admin`), and saved addresses
- **`products/`** — the complete catalog: name, brand, category, price, stock, images, nutritional information
- **`orders/`** — every created order: which products, what total, current status, which user it belongs to

The frontend **never accesses Firestore directly**. Every operation goes through the backend, which uses the **Firebase Admin SDK** — an SDK version with administrator privileges that can read and write any document without client-side security rule restrictions. This is what allows the admin panel to update order statuses or delete products securely.

---

## 7. MVP — what works in production today

An MVP is the simplest version of a product that delivers real value. OneMore meets that definition.

The purchase flow is complete end-to-end. A user can enter the store without an account, browse the catalog, filter by category, view a product's detail, add it to the cart, create an account, complete their shipping address, pay with PayPal, and receive their order confirmation — all of that works today, in production, without manual intervention.

The admin panel allows managing that business in real time: create new products, update prices and stock, view all incoming orders and change their status. An administrator can operate the store completely from that panel.

What would grow this MVP in a next version: email notifications on order confirmation, credit card payments via Stripe, and a product review system.

---

## 8. Deployment on Vercel

### Why Vercel

Vercel is the platform behind Next.js — deploying there is the natural path. It offers free hosting for academic projects, automatic CI/CD from GitHub (every push to `main` generates a new deployment), and native support for both Vite apps and Next.js.

### Two projects in Vercel, one system

The frontend (Vite) and the backend (Next.js) are two separate projects in Vercel. They point to different folders in the same repository.

For the **frontend**, the critical environment variables are the Firebase credentials (so the client SDK can connect), the deployed backend URL, and the PayPal Client ID:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_API_URL=https://onemore-api.vercel.app
VITE_PAYPAL_CLIENT_ID=...
```

For the **backend**, the most sensitive part is the Firebase service account private key, which enables the Admin SDK:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
SESSION_SECRET=...
```

### The cookie problem in production

In production, the frontend and backend have different domains (for example, `onemore.vercel.app` and `onemore-api.vercel.app`). The cookies that worked in development through Vite's proxy now need to cross domains under real HTTPS.

The solution was to configure the cookies with `Secure: true` and `SameSite: 'none'` — the combination that browsers allow for cross-site cookies under HTTPS. This way the browser accepts the cookie from the backend and sends it on every request to that same backend, even though the origin is different from the frontend's.

---

## 9. Full system walkthrough

> *Everything below is shown on the deployed system while being explained.*

### What a first-time user sees

On entering the store, the hero carousel rotates automatically through background images. Below are featured products with their price, a "Best Seller" badge when applicable, and an add-to-cart button that works without an account. The categories take users directly to a filtered catalog.

In the catalog, users can filter by supplement type and by sports goal (muscle gain, fat loss, endurance). The real-time search filters products as the user types — it does not make a new server request, it filters over data already loaded in the context.

The product detail shows the image, description, nutritional information, a quantity selector that respects available stock, and the cart button. If stock is zero, the button is disabled.

The cart shows an updatable summary, the total in the selected currency — the currency selector in the header converts prices in real time — and the checkout button, which redirects to login if the user has no session.

Checkout asks for the shipping address and shows the PayPal button. Clicking the button opens the PayPal window, the user approves the payment, and the app captures the order and saves it to Firestore. It redirects to the confirmation screen with the order number.

From the profile, the user can change their name, photo, and saved addresses. In "My Orders" they see the complete history with each order's current status.

---

### The admin panel

Access is through `/admin/login`, with admin credentials. The difference from a regular user is not only visual — the `admin` role is stored in Firestore and the backend verifies it on every request to admin-protected routes.

The main dashboard shows the business metrics: total sales, active orders, low-stock products. The sales chart uses **Recharts** to display the evolution over time.

In the products section, a new product can be created by filling out a form in a modal: name, brand, category, price, stock, description, nutritional information, image URL. On saving, the backend writes the document to Firestore and the frontend updates the list immediately. Editing or deleting works the same way.

In orders, all purchases are displayed with their current status. Changing the status from `processing` to `shipped`, for example, updates the document in Firestore, and the user will see it reflected in their order history the next time they check.

---

## Closing

OneMore is the practical demonstration that the concepts covered during the semester — client-server architecture, token-based authentication, cloud databases, route protection, deployment — can be combined into a real system that actually works.

It is not an academic demo with fake data. It is a store that accepts payments, saves data to the cloud, and can be operated by a real administrator from a web panel. That is what sets this project apart.


---

## 1. Project Introduction

**OneMore** is a full e-commerce platform specialized in sports supplements — proteins, creatine, pre-workouts, and fitness accessories.

### What is it?
A complete online store featuring:
- Product catalog with filters and search
- Shopping cart and checkout flow
- Integrated **PayPal** payments
- User authentication system
- Admin panel to manage the business in real time

### What is it for?
It enables any sports supplement business to have a digital presence with a professional purchasing flow and a control panel to manage products, inventory, orders, and users — all from the browser.

### Academic Purpose
The project was born as an integration exercise for modern web development technologies: connecting a SPA frontend with a backend API, cloud database, real authentication, and production deployment — replicating the architecture of a real commercial application.

---

## 2. Tools & Technologies

### Design — Figma AI
The project's starting point was **Figma** using its AI tool (*Make*). From the prompt "online supplement store," the tool automatically generated the initial visual structure of the interface: color palette, base components, typography, and spacing. This produced the initial frontend scaffolding in Vite + React, which was then extended and adapted throughout development.

### Languages
| Language | Use |
|----------|-----|
| **TypeScript 5.8** | Primary language — static typing across the entire project |
| **TSX** | React components with typed JSX syntax |
| **CSS** | Design variables (tokens), custom fonts |

### Frontend
| Technology | Version | Role |
|-----------|---------|------|
| **React** | 18.3.1 | UI framework with functional components and hooks |
| **Vite** | 6.3.5 | Ultra-fast bundler — replaces Create React App |
| **React Router DOM** | v6 | SPA navigation with protected routes |
| **Tailwind CSS** | 4.1.12 | Utility styles natively integrated with Vite |
| **shadcn/ui** (Radix UI) | — | Accessible, unstyled component library |
| **Material UI (MUI)** | 7.3.5 | Additional components and icon system |
| **Lucide React** | 0.487 | Consistent SVG iconography |
| **Framer Motion** | — | Page transition animations |
| **Recharts** | — | Admin panel charts and graphs |
| **Sonner** | — | Toast notifications |
| **PayPal React SDK** | 8.6.0 | Real payment integration |

### Backend
| Technology | Version | Role |
|-----------|---------|------|
| **Next.js** | 15.3.1 | REST API — App Router, route handlers, middleware |
| **Firebase Admin SDK** | 12.3.0 | Token verification and privileged Firestore access |
| **Node.js** | — | Backend server runtime |

### Database & Services
| Service | Provider |
|---------|---------|
| **Firestore** | Google Firebase — NoSQL cloud database |
| **Firebase Authentication** | User authentication with email/password |

---

## 3. AI as an Engineering Tool

### The Approach: AI-assisted Reverse Engineering

During the Web Programming course, the base project was built entirely in **Next.js** (full-stack). For OneMore, the challenge was different: AI was used as a tool for **reverse engineering and architecture translation**.

### What does this mean in practice?

1. **Extrapolating ideas from the class project (Next.js) → this project (Vite + Next.js separated)**
   - In the class project, frontend and API coexist in the same Next.js application.
   - With AI assistance, the underlying patterns (protected routes, sessions, data repositories) were identified and re-implemented in a **decoupled architecture**: frontend in Vite, backend in Next.js as a pure API.

2. **Adapting architectural concepts**
   - The `httpOnly` cookie session system was designed with AI assistance, translating the session management concept from Next.js Auth into the project's own pattern.
   - The Firestore repositories (`product.repository.ts`, `order.repository.ts`) were modeled from patterns learned in class and adapted to the new structure.

3. **Generating complex components**
   - Components like `AdminDashboard` (with tables, charts, full CRUD) were AI-assisted, starting from wireframes and functional specifications.

4. **Debugging and refactoring**
   - AI was used to detect CORS issues with `httpOnly` cookies in development and propose the solution using Vite's proxy to the backend.

> **Conclusion:** AI did not replace technical understanding — it was an acceleration layer that allowed taking concepts from the base project and building something more complex in less time.

---

## 4. Code & Architecture

### General Architecture

```
┌─────────────────────────────────────────────┐
│             USER BROWSER                    │
│                                             │
│  Vite SPA (React) — port 5173               │
│  Proxy /api → localhost:3002                │
└──────────────────┬──────────────────────────┘
                   │ HTTP + httpOnly Cookie
┌──────────────────▼──────────────────────────┐
│           BACKEND API (Next.js)             │
│                                             │
│  Edge Middleware → validates session cookie │
│  Route Handlers  → business logic           │
│  Firebase Admin SDK → verifies tokens       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        GOOGLE FIREBASE / FIRESTORE          │
│                                             │
│  users · products · orders                  │
└─────────────────────────────────────────────┘
```

### Authentication Flow
1. User logs in → Firebase issues an `idToken`
2. Frontend sends the `idToken` to the backend (`POST /api/auth/session`)
3. Backend verifies the token with Firebase Admin and creates an **`httpOnly` session cookie**
4. On every protected request, the **Next.js middleware** validates the cookie's presence
5. Route handlers cryptographically verify the token before responding

### Frontend Routes
| Route | Component | Access |
|-------|-----------|--------|
| `/` | `Home` | Public |
| `/productos` | `ProductCatalog` | Public |
| `/producto/:id` | `ProductDetail` | Public |
| `/buscar` | `SearchPage` | Public |
| `/carrito` | `Cart` | Public |
| `/checkout` | `Checkout` | Requires auth |
| `/perfil` | `UserProfile` | Requires auth |
| `/mis-pedidos` | `OrderHistory` | Requires auth |
| `/confirmacion` | `OrderConfirmation` | Requires auth |
| `/admin` | `AdminDashboard` | Admin only |
| `/admin/login` | `AdminLogin` | Public |

### Backend Routes (Next.js API)
| Endpoint | Method | Function |
|----------|--------|----------|
| `/api/auth/session` | POST / DELETE | Create / close session |
| `/api/auth/profile` | GET | Get authenticated profile |
| `/api/products` | GET | Public catalog |
| `/api/admin/products` | GET / POST | Product management (admin) |
| `/api/admin/products/[id]` | PUT / DELETE | Edit / delete product |
| `/api/admin/orders` | GET | View all orders |
| `/api/admin/orders/[id]` | PUT | Update order status |
| `/api/admin/users` | GET | List users |
| `/api/orders` | GET / POST | Authenticated user orders |

### State Management (React Contexts)
| Context | Responsibility |
|---------|---------------|
| `AuthContext` | Authenticated user, roles, login/logout/register |
| `CartContext` | Shopping cart, totals, persistence |
| `ProductContext` | Catalog, product CRUD, orders |
| `ThemeContext` | Light/dark mode |
| `CurrencyContext` | Currency conversion and formatting |
| `NotificationContext` | Real-time notification system |

### Key Folder Structure
```
OneMore-/
├── src/                        # Frontend (Vite + React)
│   ├── app/
│   │   ├── components/         # All UI components
│   │   ├── contexts/           # Global state (React Context)
│   │   ├── types/              # Shared TypeScript types
│   │   └── App.tsx             # Main router
│   └── lib/
│       ├── firebase.ts         # Firebase client SDK
│       └── api-client.ts       # HTTP client to backend
│
└── onemore-api/                # Backend (pure Next.js)
    ├── app/api/                # Route Handlers
    ├── lib/                    # Firebase Admin, auth helpers, session
    ├── repositories/           # Firestore access layer
    ├── types/                  # Server-side types
    └── middleware.ts           # Auth guard (Edge runtime)
```

---

## 5. Firebase Services

### Firebase Authentication
- User registration and login with **email and password**
- The client SDK (`firebase/auth`) manages user state in the browser
- The Firebase JWT `idToken` is the bridge between client and server
- On login, the token is exchanged for an **`httpOnly` session cookie** signed by the server — more secure than storing the token in `localStorage`
- `onAuthStateChanged` listens for auth state changes and automatically restores the session on page reload

### Firestore (Database)
- NoSQL cloud database with three main collections:

```
Firestore
├── users/      uid → { email, name, role, addresses, createdAt }
├── products/   id  → { name, brand, category, price, stock, image, description }
└── orders/     id  → { userId, items, total, status, createdAt, updatedAt }
```

- All queries from the frontend go through the backend — **Firestore is never accessed directly from the client** (stronger security)
- The backend uses **Firebase Admin SDK** for privileged operations: creating, updating, and deleting documents without client-side security rule restrictions

### Combined Security Model
```
Firebase Auth (idToken)
    ↓
Backend verifies with Admin SDK
    ↓
httpOnly session cookie (signed)
    ↓
Edge Middleware → protects /api/admin and /api/orders
    ↓
Route handlers → verify role (client vs admin)
```

---

## 6. MVP — Did We Make It?

### What is an MVP?
A **Minimum Viable Product** is the simplest version of a product that delivers real value to the end user and allows validating the business model.

### OneMore **is an MVP** — here is why:

| MVP Criterion | Met? | Evidence |
|--------------|------|----------|
| Complete purchase flow | ✅ | Catalog → Cart → Checkout → Confirmation |
| Real payments | ✅ | Functional PayPal integration |
| Real authentication | ✅ | Firebase Auth + session cookies |
| Functional admin panel | ✅ | Full CRUD for products, orders, and users |
| Persistent cloud data | ✅ | Firestore — data survives page reloads |
| Production deployment | ✅ | Accessible from any browser on the internet |
| Light/dark mode | ✅ | Persistent preference per user |
| Multi-currency | ✅ | Real-time price conversion |

### What would grow this MVP?
- Additional payment methods (real credit card with Stripe)
- Email notifications (Firebase Cloud Messaging or SendGrid)
- Product reviews and ratings
- Discount and coupon system
- Inventory management with automatic low-stock alerts

---

## 7. Deployment on Vercel

### Why Vercel?
Vercel is the official deployment platform for Next.js projects and offers native support for React applications with Vite. Deployment is free for personal and academic projects.

### What Was Needed

#### For the frontend (Vite + React)
- GitHub repository connected to Vercel
- Environment variables configured in the Vercel dashboard:
  ```
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_APP_ID
  VITE_ADMIN_EMAILS
  VITE_API_URL          ← deployed backend URL
  VITE_PAYPAL_CLIENT_ID
  ```
- Build command: `vite build`
- Output directory: `dist/`

#### For the backend (Next.js API)
- Second Vercel project pointing to the `onemore-api/` folder
- Server-side environment variables:
  ```
  FIREBASE_PROJECT_ID
  FIREBASE_CLIENT_EMAIL
  FIREBASE_PRIVATE_KEY   ← service account key
  SESSION_SECRET         ← cookie signing secret
  FRONTEND_URL           ← frontend domain for CORS
  ```
- Next.js is automatically deployed as **Serverless Functions** on Vercel — each route handler is an independent function

### The `httpOnly` Cookie Challenge in Production
In development, Vite's proxy solves the cross-origin problem. In production:
- The backend domain is set in `VITE_API_URL` so the frontend points to the correct server
- Cookies are configured with `Secure` and `SameSite=None` attributes to work across different domains under HTTPS

---

## 8. Live System Walkthrough

> *Show the deployed system while describing the features*

### 8.1 — Customer User View (3 min)

**Home page (`/`)**
- Hero section with call to action
- Featured products with carousel
- Quick navigation categories

**Product catalog (`/productos`)**
- Product grid with category and goal filters
- Real-time search
- Cards showing price, stock, and quick-add button

**Product detail (`/producto/:id`)**
- Images, full description, nutritional information
- Quantity selector
- Add to cart button with visual feedback

**Shopping cart (`/carrito`)**
- Product list, quantity updates
- Dynamic total calculation
- Currency selector (CurrencyContext)

**Checkout (`/checkout`)**
- Shipping address form
- **PayPal** integration — real payment button
- Redirect to order confirmation

**Profile & history (`/perfil`, `/mis-pedidos`)**
- Edit name, photo, and saved addresses
- Order history with updated status

---

### 8.2 — Admin Panel (`/admin`) (1.5 min)

**Main Dashboard**
- Key metrics: total sales, daily orders, active products
- Sales chart with `Recharts`
- Low stock alerts

**Product Management**
- Table with search and filters
- Create/edit modal with full form
- Deletion with confirmation dialog
- Everything connected in real time to Firestore

**Order Management**
- List of all system orders
- Status updates: pending → processing → shipped → delivered

**User Management**
- View all registered users
- Role and activity information

---

## Closing

### Technical Summary of What Was Built

| Aspect | Detail |
|--------|--------|
| **Application type** | SPA + decoupled REST API |
| **Frontend** | Vite 6 + React 18 + TypeScript |
| **Backend** | Next.js 15 (API only) |
| **Database** | Firestore (NoSQL, cloud) |
| **Authentication** | Firebase Auth + `httpOnly` session cookies |
| **Payments** | PayPal SDK |
| **Deployment** | Vercel (frontend + backend) |
| **Initial design** | Figma AI (Make) |
| **UI components** | shadcn/ui + Radix UI + MUI |
| **Animations** | Framer Motion |

> **OneMore demonstrates that it is possible to build a functional, secure, and production-deployed e-commerce application using modern technologies, AI as a development accelerator, and the best practices learned throughout the semester.**
