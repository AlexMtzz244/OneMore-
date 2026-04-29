# 🔐 Firebase Authentication Setup - OneMore!

## Descripción

Este documento describe la implementación de autenticación Firebase en el proyecto OneMore! con Vite + React + TypeScript.

## ✅ Requisitos Completados

- ✅ **Registro con email y contraseña** - Usuarios pueden crear nuevas cuentas
- ✅ **Login con email y contraseña** - Autenticación segura con Firebase
- ✅ **Persistencia de sesión** - Usuarios permanecen autenticados entre sesiones
- ✅ **Gestión de errores** - Mensajes claros en español para cada escenario
- ✅ **Integración con AuthContext** - Sistema de contexto React aplicado a Firebase
- ✅ **Estados de carga** - Indicadores visuales durante autenticación

## 📦 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

La dependencia `firebase@^10.7.0` ya está agregada a `package.json`.

### 2. Verificar Estructura de Archivos

Después de instalar, verifica que tengas:

```
src/
├── lib/
│   └── firebase.ts                 # ← Nuevo: Configuración Firebase
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx        # ← Actualizado: Ahora usa Firebase
│   ├── components/
│   │   └── Login.tsx              # ← Actualizado: Métodos async
│   └── types/
│       └── index.ts               # ← Actualizado: Sin password en User
```

## 🚀 Uso

### Autenticación en Componentes

```typescript
import { useAuth } from '../contexts/AuthContext';

export const MyComponent = () => {
  const { user, login, logout, register, loading } = useAuth();

  // Acceder a usuario actual
  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No autenticado</p>;
  
  return <p>Hola {user.name}</p>;
};
```

### Métodos Disponibles

#### `login(email: string, password: string): Promise<void>`
Inicia sesión con email y contraseña.

```typescript
try {
  await login('usuario@email.com', 'contraseña');
  // Usuario logged in - redirigir
} catch (error) {
  // Error manejado automáticamente
}
```

#### `register(email: string, password: string, name: string): Promise<void>`
Registra un nuevo usuario.

```typescript
try {
  await register('nuevo@email.com', 'contraseña', 'Juan Pérez');
  // Usuario creado y logged in
} catch (error) {
  // Error manejado automáticamente
}
```

#### `logout(): Promise<void>`
Cierra la sesión del usuario actual.

```typescript
await logout();
// Usuario logged out
```

#### `isAdmin(): boolean`
Verifica si el usuario actual es administrador.

```typescript
if (isAdmin()) {
  // Mostrar opciones de admin
}
```

### Propiedades Disponibles

- `user: User | null` - Usuario actual o null
- `loading: boolean` - Estado de carga global
- `authError: string | null` - Último error de autenticación

## 🔒 Seguridad

### Credenciales Firebase
Las credenciales están **públicas a propósito** en `src/lib/firebase.ts` (esto es seguro para Client SDK):
- `apiKey`, `authDomain`, `projectId`, etc. son públicas
- El registro se hace solo desde cliente con Firebase Auth
- Las contraseñas jamás se almacenan en localStorage

### Persistencia
- Usa `browserLocalPersistence` de Firebase
- El usuario permanece autenticado entre sesiones
- Sesión se sincroniza automáticamente con Firebase

### Errores de Autenticación
Mensajes genéricos para máxima seguridad:
- "Email o contraseña incorrectos" (en lugar de indicar qué es incorrecto)
- "Este email ya está registrado"
- "Demasiados intentos. Intenta más tarde"

## ✅ Validacion Local

### 1. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 2. Acceder a login

```
http://localhost:5173/login
```

### 3. Crear una cuenta

- Registra un usuario desde la pantalla de login

### 4. Verificar autenticación

- DevTools → Application → Local Storage → verifica datos de usuario
- Recarga la página → Usuario debe permanecer autenticado
- Accede a rutas protegidas (ej: dashboard)

### 5. Logout

- Cierra sesión
- Verifica que se limpie localStorage
- Intenta acceder a ruta protegida → debe redirigir a login

## 📝 Estructura del Usuario (User Type)

```typescript
interface User {
  id: string;              // UID de Firebase
  email: string;           // Email registrado
  name: string;            // Nombre mostrado
  role: UserRole;          // 'cliente' | 'administrador'
  addresses: Address[];    // Direcciones guardadas
  createdAt: string;       // Fecha de creación ISO
  photoURL?: string;       // URL de foto (opcional)
}
```

> **Nota:** NO se almacena `password` en el cliente. Firebase maneja la seguridad de contraseñas.

## 🔄 Flujo de Login

```
Usuario escribe email/contraseña
         ↓
handleLogin valida inputs
         ↓
login() envia a Firebase
         ↓
Firebase valida credenciales
         ↓
onAuthStateChanged dispara
         ↓
User state se actualiza
         ↓
Componente re-renderiza
         ↓
navigate() redirige a destino
```

## 🔄 Flujo de Registro

```
Usuario completa formulario
         ↓
handleRegister valida campos
         ↓
register() envia a Firebase
         ↓
Firebase crea usuario + perfil
         ↓
onAuthStateChanged dispara
         ↓
User state se actualiza
         ↓
Componente re-renderiza
         ↓
navigate() redirige a destino
```

## 🚫 Errores Comunes

### "Error connecting to Firebase"
- Verifica que tengas internet
- Verifica que las credenciales en `firebase.ts` sean correctas
- Revisa la consola del navegador para más detalles

### "Email o contraseña incorrectos"
- Verifica que el email exista en Firebase
- Firebase es case-sensitive con emails
- Verifica que la contraseña sea correcta

### "Este email ya está registrado"
- El email ya tiene una cuenta en Firebase
- Usa login en lugar de register
- O usa otro email

### "Demasiados intentos"
- Firebase bloqueó intentos por intento masivo
- Espera unos minutos
- Esta es una protección automática contra fuerza bruta

### Usuario no persiste después de reload
- Verifica que localStorage no esté deshabilitado
- Verifica que las cookies no estén bloqueadas
- Revisa que `browserLocalPersistence` esté configurado

## 📱 Datos Almacenados en localStorage

Además de la sesión de Firebase, se guardan datos adicionales:

```javascript
// Datos de usuario específicos de la app
localStorage.getItem('user_<UID>')
// {
//   id, email, name, role, addresses, createdAt
// }
```

## 🔐 Variables de Entorno

Actualmente, las credenciales de Firebase están en `src/lib/firebase.ts`.

Para mayor seguridad en un futuro, puedes moverlas a `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyB381DMu-0XKvFvHA-_of80BuNXkTndUws
VITE_FIREBASE_AUTH_DOMAIN=onemore-843b8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onemore-843b8
VITE_FIREBASE_STORAGE_BUCKET=onemore-843b8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=487770302561
VITE_FIREBASE_APP_ID=1:487770302561:web:c841ad0ea78cfc12fae220
```

Y en `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... resto de variables
};
```

## 📚 Documentación Relacionada

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [React Context API](https://react.dev/reference/react/useContext)

## ✨ Próximas Mejoras Sugeridas

- [ ] Google Sign-In (OAuth)
- [ ] GitHub Sign-In (OAuth)
- [ ] Email verification
- [ ] Recuperación de contraseña
- [ ] 2FA (Two-factor authentication)
- [ ] Social login buttons
- [ ] Profile picture upload
- [ ] Session timeout warnings

## 📞 Soporte

Para problemas con Firebase:
1. Revisa la consola del navegador (F12)
2. Verifica credenciales en Firebase Console
3. Verifica que Email/Password esté habilitado en Firebase
4. Revisa logs de Firebase en el console del navegador

---

**Implementado:** Abril 2026
**Versión Firebase:** 10.7.0
**Status:** ✅ Funcional
