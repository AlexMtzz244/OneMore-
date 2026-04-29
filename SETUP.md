# 🚀 Guía de Instalación - OneMore! E-commerce

Esta guía te ayudará a configurar y ejecutar el proyecto en tu máquina local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
  - Descarga desde: https://nodejs.org/
  - Verifica la instalación: `node --version`
- **npm** (viene incluido con Node.js)
  - Verifica la instalación: `npm --version`
- **Git** (para clonar el repositorio)
  - Descarga desde: https://git-scm.com/

## 📥 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd OneMore-
```

### 2. Instalar dependencias

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

Este comando instalará todas las dependencias necesarias, incluyendo:
- React 18.3.1
- React Router DOM
- Radix UI (componentes)
- Tailwind CSS
- Vite
- TypeScript
- Y muchas más...

## 🎮 Comandos Disponibles

### Modo Desarrollo

Inicia el servidor de desarrollo con hot-reload:

```bash
npm run dev
```

El proyecto estará disponible en: **http://localhost:5173/**

> **Nota**: Vite usa el puerto 5173 por defecto. Si este puerto está ocupado, automáticamente usará el siguiente disponible (5174, 5175, etc.). La URL correcta se mostrará en la terminal cuando inicies el servidor.

### Compilar para Producción

Genera los archivos optimizados para producción:

```bash
npm run build
```

Los archivos compilados se guardarán en la carpeta `/dist`.

## 🏗️ Estructura del Proyecto

```
OneMore-/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes de React
│   │   ├── contexts/          # Context API (Auth, Cart, etc.)
│   │   ├── data/              # Datos iniciales
│   │   └── types/             # Definiciones de TypeScript
│   ├── styles/                # Estilos CSS
│   └── main.tsx              # Punto de entrada
├── public/                    # Archivos estáticos
├── index.html                # HTML principal
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración de TypeScript
└── vite.config.ts            # Configuración de Vite
```

## 🔧 Configuración del Editor

### VS Code (Recomendado)

Extensiones recomendadas:
- **ESLint** - Linting de código
- **Prettier** - Formato de código
- **Tailwind CSS IntelliSense** - Autocompletado de clases
- **TypeScript Vue Plugin (Volar)** - Soporte TypeScript mejorado

## 🐛 Solución de Problemas

### Error: "Cannot find module 'react'"

Si encuentras este error, ejecuta:

```bash
npm install
```

### El servidor no inicia

1. Verifica que el puerto 5173 no esté en uso (o usa otro puerto con `npm run dev -- --port 3000`)
2. Intenta eliminar `node_modules` y reinstalar:

```bash
rm -rf node_modules
npm install
```

### Errores de TypeScript

Si ves errores de TypeScript, asegúrate de que los archivos de configuración estén presentes:
- `tsconfig.json`
- `tsconfig.node.json`

### Error 404 de favicon

Ya está solucionado en el proyecto. Si lo ves, asegúrate de tener la última versión del código.

## 📦 Tecnologías Principales

- **React 18** - Biblioteca UI
- **TypeScript** - Superset de JavaScript con tipado
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes UI accesibles
- **Motion** - Animaciones
- **Lucide React** - Iconos

## 👥 Funcionalidades

- ✅ Autenticación de usuarios
- ✅ Carrito de compras
- ✅ Catálogo de productos
- ✅ Sistema de búsqueda
- ✅ Panel de administración
- ✅ Historial de pedidos
- ✅ Notificaciones toast
- ✅ Tema oscuro/claro
- ✅ Responsive design

## 📝 Notas Adicionales

- El proyecto usa datos almacenados en localStorage para catalogo y pedidos
- Los cambios en el código se reflejan automáticamente (HMR)
- Los estilos se compilan con Tailwind CSS v4
- Las rutas están protegidas según el tipo de usuario

## 💳 Pagos (PayPal + Tarjeta)

El checkout usa PayPal Smart Buttons (incluye pago con tarjeta como Mastercard) con API routes serverless.

Nota: las rutas `/api/*` funcionan en Vercel. Para probar pagos en local, usa `vercel dev` (o prueba directamente en el despliegue).

Variables de entorno:

```
VITE_APP_URL=https://tu-dominio.com

# Cliente (público)
VITE_PAYPAL_CLIENT_ID=

# Servidor (secreto)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# sandbox | live
PAYPAL_ENV=sandbox
```

## 🔒 Acceso al Panel Admin

El acceso a `/admin` se controla por lista de correos (allowlist). Puedes inicializarla con:

```
VITE_ADMIN_EMAILS=admin@tudominio.com,otro@tudominio.com
```

Luego, dentro del panel (Usuarios) puedes agregar/quitar correos administradores.

## 🤝 Colaboración

1. Crea una rama para tu feature: `git checkout -b feature/nombre-feature`
2. Haz commits descriptivos: `git commit -m "Agrega nueva funcionalidad"`
3. Push a tu rama: `git push origin feature/nombre-feature`
4. Crea un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa esta guía primero
2. Busca en los issues del repositorio
3. Contacta al equipo de desarrollo

---

¡Listo! Ahora puedes empezar a desarrollar 🎉
