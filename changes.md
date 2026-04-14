# 📋 PROMPT LISTO PARA COPIAR Y PEGAR

Copia y pega esto completo en ChatGPT/Claude/Copilot para implementar autenticación en otro proyecto:

---

```
PROYECTO: Implementar Autenticación Firebase + Session Cookies en Next.js

OBJETIVO GENERAL:
Implementar un sistema de autenticación con Firebase Authentication (Email/Password + Google OAuth) que mantenga 
sesiones seguras en servidor mediante httpOnly cookies, protejiendo rutas privadas con middleware 
y verificación en Server Components.

=== REQUISITOS FUNCIONALES ===

1. AUTENTICACIÓN DE USUARIO:
   - Registro de nuevos usuarios con email y contraseña
   - Login con email y contraseña
   - Opción "Recordarme" (checkbox persistencia)
   - Google Sign-In (OAuth) - OPCIONAL
   - Logout con limpieza de sesión

2. GESTIÓN DE SESIONES:
   - Crear session cookie httpOnly después de login exitoso
   - Almacenar cookie en servidor (no JavaScript)
   - Tiempo de vida configurable (8 horas si "recuerdame", 2 horas si no)
   - Revocar sesión en logout

3. PROTECCIÓN DE RUTAS:
   - Middleware que valida cookie antes de acceder a rutas protegidas
   - Redirect automático a /login si no autenticado
   - Preservar URL destino en redirects (?redirectTo=/ruta)
   - Validación en Server Components con getServerUser()

4. ATOMICITY:
   - No exponer tokens a JavaScript (XSS protection)
   - No exponer credenciales privadas en frontend
   - Configuración de persistencia inteligente (localStorage vs sessionStorage)

=== ARQUITECTURA TÉCNICA ===

STACK:
- Framework: Next.js 16+ con App Router
- Auth Cliente: firebase@^12
- Auth Servidor: firebase-admin@^13
- Lenguaje: TypeScript
- Styling: Tailwind CSS (opcional)

SEPARACIÓN DE RESPONSABILIDADES:
- firebase-admin.ts (SERVIDOR): Firebase Admin SDK, credenciales privadas
- firebase-client.ts (CLIENTE): Firebase Client SDK, configuración pública
- auth-server.ts (SERVIDOR): Helper getServerUser() para SSR
- middleware.ts (SERVIDOR): Protección de rutas en nivel de framework
- API routes: sessionLogin (crear cookie), sessionLogout (eliminar cookie)
- Pages: login (Client Component), signup (Client Component), dashboard (Server Component)

=== VARIABLES DE ENTORNO ===

# Públicas (en cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Privadas (solo servidor)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Personalizables
SESSION_COOKIE_NAME=__session
SESSION_COOKIE_MAX_AGE=28800

=== FLUJO DETALLADO DE LOGIN ===

ENTRADA: usuario@email.com + password + remember=true

1. [Cliente] Formulario captura email/password
2. [Cliente] Click "Iniciar sesión"
3. [Cliente] Ejecuta configureAuthPersistence(remember)
   - Si remember=true → localStorage persistence
   - Si remember=false → sessionStorage persistence
4. [Cliente] Ejecuta signInWithEmailAndPassword(email, password)
5. [Firebase] Valida credenciales, retorna User object
6. [Cliente] Obtiene idToken = currentUser.getIdToken()
7. [Cliente] POST /api/sessionLogin { idToken, remember }

---

8. [Servidor /api/sessionLogin] Recibe POST
9. [Servidor] Valida idToken con adminAuth SDK
10. [Servidor] Calcula expiración:
    - Si remember=true: 8 horas
    - Si remember=false: 2 horas
11. [Servidor] adminAuth.createSessionCookie(idToken, {expiresIn})
12. [Servidor] Crea cookie HTTP con atributos:
    - httpOnly: true (NO accesible desde JS)
    - secure: true (HTTPS en producción)
    - sameSite: "lax" (CSRF protection)
    - path: "/"
    - maxAge: expiración en segundos
13. [Servidor] Retorna 200 { ok: true }

---

14. [Cliente] Recibe respuesta 200
15. [Cliente] router.push("/dashboard")
16. [Cliente] router.refresh() (refetch Server Components)

---

17. [Servidor Middleware] Next.js intercepta request a /dashboard
18. [Middleware] Valida que cookie __session existe
19. [Middleware] Si existe → NextResponse.next()
20. [Middleware] Si NO existe → Redirect a /login?redirectTo=/dashboard

---

21. [Servidor] Renderiza Dashboard Server Component
22. [Dashboard] Llama getServerUser()
23. [getServerUser] Lee cookie __session del servidor
24. [getServerUser] Ejecuta adminAuth.verifySessionCookie(token, true)
    - true = verificar revocación en tiempo real
25. [Servidor Firebase] Valida firmeza y revocación
26. [getServerUser] Retorna { uid, email, name, picture, ... }
27. [Dashboard] Renderiza con datos del usuario

SALIDA: Dashboard renderizado con "Bienvenido usuario@email.com"

=== FLUJO DETALLADO DE LOGOUT ===

1. [Cliente] Click en botón "Cerrar sesión"
2. [Cliente] Ejecuta: <form action="/api/sessionLogout" method="POST">
3. [Servidor /api/sessionLogout] POST sin cuerpo
4. [Servidor] Verifica getServerUser() (usuario autenticado)
5. [Servidor] Si NO autenticado → 401 Unauthorized
6. [Servidor] If autenticado → crea cookie vacía:
   - res.cookies.set(__session, "", { maxAge: 0 })
   - maxAge=0 indica al navegador: eliminar cookie
7. [Servidor] Retorna 200 { ok: true }
8. [Cliente] Navegador elimina cookie automáticamente
9. [Cliente] router.refresh() o redirect a /login

SALIDA: Cookie eliminada, usuario desautenticado

=== FLUJO ACCESO A RUTA PROTEGIDA SIN AUTENTICACIÓN ===

1. Usuario intenta /dashboard sin cookie
2. Middleware valida: ¿Cookie existe? NO
3. Middleware crea URL: /login?redirectTo=/dashboard
4. Middleware retorna: NextResponse.redirect(url)
5. Navegador redirige a /login
6. Usuario ve formulario de login
7. (Usuario completa login)
8. Tras éxito, router.push(redirectTo) lleva a /dashboard

=== IMPLEMENTACIÓN PASO A PASO ===

PASO 1: DEPENDENCIAS
```bash
npm install firebase firebase-admin
npm install --save-dev @types/node
```

PASO 2: firebase-admin.ts (admin SDK, solo servidor)
- Ubicación: lib/firebase-admin.ts
- Importa: getApps, initializeApp, cert, getAuth
- Lee env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
- Inicializa: adminApp con cert() usando credenciales privadas
- Exporta: adminApp, adminAuth
- NOTA: privateKey contiene saltos de línea escapados que deben convertirse ("/\\n/g" → "\n")

PASO 3: firebase-client.ts (client SDK, navegador)
- Ubicación: lib/firebase-client.ts
- Importa: getApps, initializeApp, getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence
- Lee env vars: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
- Inicializa: app con firebaseConfig usando env vars públicas
- Exporta: app, auth
- Función: configureAuthPersistence(remember: boolean)
  - Si remember → browserLocalPersistence
  - Si NO remember → browserSessionPersistence

PASO 4: auth-server.ts (validación SSR)
- Ubicación: lib/auth-server.ts
- Exporta: runtime = "nodejs"
- Función: getServerUser()
  - Lee cookies desde servidor
  - Obtiene valor de cookie (SESSION_COOKIE_NAME)
  - Si NO existe → retorna null
  - Si existe → adminAuth.verifySessionCookie(token, true)
    - true = revocation check
  - Si válido → retorna decoded token ({ uid, email, name, picture })
  - Si invalido → retorna null

PASO 5: middleware.ts (proteger rutas)
- Ubicación: middleware.ts (raíz del proyecto, no en app/)
- Exporta: función middleware(req: NextRequest)
  - Obtiene pathname de req.nextUrl
  - Define array PROTECTED_ROUTES = ["/dashboard", ...]
  - Para cada ruta protegida:
    - Si pathname NO empieza con ruta protegida → NextResponse.next()
    - Si NO existe cookie SESSION_COOKIE_NAME → redirect a /login?redirectTo=pathname
    - Si existe cookie → NextResponse.next()
- Exporta: config = { matcher: ["/dashboard/:path*", "/admin/:path*", ...] }

PASO 6: API sessionLogin (crear cookie)
- Ubicación: app/api/sessionLogin/route.ts
- Exporta: runtime = "nodejs"
- Función: POST(req: Request)
  - Lee body: { idToken, remember }
  - Verifica que idToken existe (si no → 400)
  - Calcula expiresIn:
    - Si remember → MAX_AGE (por defecto 28800 = 8 horas)
    - Si NO remember → 2 * 60 * 60 = 7200 (2 horas)
    - Convertir a milisegundos (* 1000)
  - Genera sessionCookie = adminAuth.createSessionCookie(idToken, { expiresIn })
  - Crea response: NextResponse.json({ ok: true })
  - Configura cookie en response:
    - res.cookies.set(COOKIE, sessionCookie, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn / 1000 (en segundos)
      })
  - Retorna response (200)
  - Error handling: try/catch → 401 con { error: "..." }

PASO 7: API sessionLogout (eliminar cookie)
- Ubicación: app/api/sessionLogout/route.ts
- Exporta: runtime = "nodejs"
- Función: POST(req: Request)
  - Verifica autenticación: const user = await getServerUser()
  - Si NO autenticado → 401 { error: "Unauthorized" }
  - Si autenticado → crea nueva response
  - res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
  - Retorna 200 { ok: true }

PASO 8: Página login (Client Component)
- Ubicación: app/login/page.tsx
- Directiva: "use client"
- Estados: email, password, remember, loading, error
- Funciones:
  - handleLogin(e: FormEvent):
    1. preventDefault()
    2. await configureAuthPersistence(remember)
    3. await signInWithEmailAndPassword(auth, email, password)
    4. idToken = currentUser.getIdToken(true)
    5. POST /api/sessionLogin { idToken, remember }
    6. Si OK → router.push(redirectTo); router.refresh()
    7. Si Error → setErr(error.message)
  - obtener redirectTo de useSearchParams: "?redirectTo=/dashboard" → default "/dashboard"
- Rendering:
  - Form con onSubmit={handleLogin}
  - Input email (type="email", required)
  - Input password (type="password", minLength=8, required)
  - Checkbox "Recordarme"
  - Mostrar errores si existen
  - Button disabled si loading

PASO 9: Página signup (Client Component, OPCIONAL)
- Ubicación: app/signup/page.tsx
- Similar a login pero:
  - Inputs adicionales: name, confirm password
  - Validar password === confirm password
  - createUserWithEmailAndPassword en lugar de signInWithEmailAndPassword
  - updateProfile(user, { displayName: name })
  - Después: sessionLogin() (flujo idéntico a login)

PASO 10: Página dashboard (Server Component, PROTEGIDA)
- Ubicación: app/dashboard/page.tsx
- NO "use client"
- Función default:
  1. const user = await getServerUser()
  2. if (!user) redirect("/login")
  3. Renderiza contenido protegido con user.email
  4. Form logout con action="/api/sessionLogout" method="POST"

PASO 11: Configurar .env.local
- Copiar credenciales Firebase desde Console
- Asegurarse de escapar \n en FIREBASE_PRIVATE_KEY
- Configurar SESSION_COOKIE_MAX_AGE según necesidad (default 28800 = 8 horas)

PASO 12: Testing
- npm run dev
- http://localhost:3000/login
- Intentar login
- DevTools: Application → Cookies → verificar __session (httpOnly)
- Acceder a http://localhost:3000/dashboard
- Verificar datos de usuario renderizados
- Logout
- Verificar redirect a login
- Intento acceso /dashboard sin autenticarse → redirect a /login

=== MEJORES PRÁCTICAS A IMPLEMENTAR ===

SEGURIDAD:
✅ httpOnly: true en cookies (previene XSS)
✅ secure: true en production (HTTPS only)
✅ sameSite: "lax" (CSRF protection)
✅ Separación: credenciales públicas en cliente, privadas en servidor
✅ Validación: middleware verifica existencia, getServerUser() valida integridad
✅ Revocation check: true al verifySessionCookie para detectar logout

UX:
✅ Persistencia inteligente: localStorage si recuerdame, timeout si no
✅ Redirect preservando URL original
✅ Error messages granulares (no genéricos)
✅ Loading states en botones

PERFORMANCE:
✅ Evitar requests innecesarios a Firebase
✅ Cache de configuración Firebase
✅ Minimizar validaciones en middleware (solo existencia cookie)

MANTENIBILIDAD:
✅ Archivos separados por responsabilidad
✅ Usar variables de entorno para toda configuración
✅ Logging de eventos de autenticación
✅ Documentación de flujos

=== LIMITACIONES ACTUALES + MEJORAS FUTURAS ===

LIMITACIÓN 1: Logout sin validación
- ACTUAL: Cualquiera puede POST a /api/sessionLogout
- MEJORAR: Verificar getServerUser() antes de logout

LIMITACIÓN 2: Redirect URL no validada
- ACTUAL: ?redirectTo=https://malicious.com es posible
- MEJORAR: Whitelist de URLs o validar que comience con /

LIMITACIÓN 3: Sin rate limiting
- ACTUAL: Fuerza bruta posible
- MEJORAR: npm install ratelimit o similar

LIMITACIÓN 4: Error messages informativos
- ACTUAL: "There is no user record matching this email"
- MEJORAR: "Email o contraseña incorrectos" (genérico)

LIMITACIÓN 5: Sin verificación de email
- ACTUAL: Emails no verificados crean sesiones
- MEJORAR: sendEmailVerification() y checkActionCode()

LIMITACIÓN 6: Validación de contraseña débil
- ACTUAL: Solo minLength HTML
- MEJORAR: Regex fuerte (mayúsculas, números, símbolos)

LIMITACIÓN 7: Sin refresh explícito de tokens
- ACTUAL: Firebase rehace automáticamente
- MEJORAR: Lógica explícita para sesiones largas

LIMITACIÓN 8: Middleware solo verifica existencia
- ACTUAL: Revocation check es lento, no se hace en middleware
- MEJORAR: Redis cache de revocaciones para rapidez

LIMITACIÓN 9: Sin Google Auth
- ACTUAL: Solo Email/Password
- MEJORAR: GoogleAuthProvider + signInWithPopup

LIMITACIÓN 10: Sin logging/auditing
- ACTUAL: No hay registro de eventos
- MEJORAR: Firebase Analytics + Custom logs

=== TESTING Y VALIDACIÓN ===

AMBIENTE DE DESARROLLO:
1. npm run dev
2. Testing manual de todas rutas públicas/privadas
3. DevTools para inspeccionar cookies
4. Intentos de acceso sin autenticación
5. Logout y verificación de limpieza

AMBIENTE DE PRODUCCIÓN:
1. npm run build && npm start
2. Verificar que secure=true (HTTPS)
3. Verificar que sameSite está configurado
4. Testing de CSRF (form desde otro dominio)
5. Testing de XSS (intento script en inputs)
6. Monitoreo de logs de sesión

=== REFERENCIAS ===

Firebase Authentication:
https://firebase.google.com/docs/auth

Next.js Middleware:
https://nextjs.org/docs/app/building-your-application/routing/middleware

Session Cookies (OWASP):
https://owasp.org/www-community/controls/Cookie_Security

HTTP Security Headers:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

=== ENTREGABLES ESPERADOS ===

✅ lib/firebase-admin.ts - Admin SDK configurado
✅ lib/firebase-client.ts - Client SDK configurado
✅ lib/auth-server.ts - getServerUser() helper
✅ middleware.ts - Protección de rutas
✅ app/api/sessionLogin/route.ts - Crear cookie
✅ app/api/sessionLogout/route.ts - Eliminar cookie
✅ app/login/page.tsx - Formulario login
✅ app/signup/page.tsx - Formulario signup (OPCIONAL)
✅ app/dashboard/page.tsx - Ruta protegida ejemplo
✅ .env.local - Variables de entorno
✅ Sistema funcionando end-to-end

Por favor, implementa EXACTAMENTE como se especifica, incluyendo todos los atributos de seguridad 
en cookies, validaciones en servidor, y manejo de errores. 

Importante: Usa TypeScript estrictamente, manejo de tipos completo.
```

---

## 📌 Notas de Uso

1. **Copia el bloque anterior completo** (desde `PROYECTO:` hasta el final)
2. Pégalo en tu herramienta de IA favorita (ChatGPT, Claude, Copilot)
3. Especifica el nombre de tu proyecto al pedir la implementación
4. La IA generará código lisbon para copiar y pegar

---

## 🎯 Comandos Rápidos para After Implementación

```bash
# Instalar dependencias
npm install firebase firebase-admin

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Start producción
npm start

# Linting
npm run lint
```

---

## 🔍 Debugging Rápido

**Login no funciona:**
- [ ] ¿Email/Password enabled en Firebase Console?
- [ ] ¿POST /api/sessionLogin retorna 200?
- [ ] ¿Cookie __session visible en DevTools?

**Middleware no protege:**
- [ ] ¿matcher configurado en middleware.ts?
- [ ] ¿COOKIE constante tiene el nombre correcto?
- [ ] ¿Rutas protegidas comienzan con /dashboard?

**getServerUser() retorna null:**
- [ ] ¿Session cookie existe en navegador?
- [ ] ¿Firebase Admin SDK credenciales correctas?
- [ ] ¿tokenExpiration no pasó?