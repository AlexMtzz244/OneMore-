# Análisis Tecnológico — Proyecto OneMore

## Descripción del Proyecto

**OneMore** es una Single Page Application (SPA) de e-commerce orientada a la venta de suplementos deportivos (proteínas, creatina, pre-workouts, accesorios). Cuenta con flujo de compra completo, panel de administración, autenticación de usuarios y soporte para modo oscuro/claro.

---

## Lenguajes

| Lenguaje | Uso |
|---|---|
| **TypeScript 5.8** | Lenguaje principal — tipado estático en toda la aplicación |
| **TSX** | Archivos de componentes React con sintaxis JSX tipada |
| **CSS** | Estilos globales, variables CSS custom (Design Tokens), fuentes |

---

## Framework Principal

| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 18.3.1 | Framework de UI — componentes funcionales con hooks |
| **React DOM** | 18.3.1 | Renderizado en el navegador |

---

## Herramienta de Build

| Herramienta | Versión | Rol |
|---|---|---|
| **Vite** | 6.3.5 | Bundler y servidor de desarrollo (reemplaza Webpack/CRA) |
| **@vitejs/plugin-react** | 4.7.0 | Soporte de React con Fast Refresh en Vite |
| **PostCSS** | — | Pipeline de procesamiento CSS (configurado vacío, gestionado por Tailwind v4) |

---

## Estilado

| Tecnología | Versión | Rol |
|---|---|---|
| **Tailwind CSS** | 4.1.12 | Framework de utilidades CSS — clases atómicas |
| **@tailwindcss/vite** | 4.1.12 | Integración nativa de Tailwind v4 con Vite (sin postcss) |
| **tw-animate-css** | 1.3.8 | Animaciones CSS declarativas para Tailwind |
| **Emotion** (`@emotion/react`, `@emotion/styled`) | 11.14.x | CSS-in-JS (usado por MUI internamente) |
| **CSS Custom Properties** | — | Design tokens para colores, radios, tipografía (tema claro/oscuro en `theme.css`) |
| **tailwind-merge** | 3.2 | Fusión segura de clases Tailwind sin conflictos |
| **clsx** | 2.1.1 | Construcción condicional de clases CSS |
| **class-variance-authority (cva)** | 0.7.1 | Definición de variantes de componentes con Tailwind |

---

## Librería de Componentes UI

### shadcn/ui (patrón Radix UI + Tailwind)
Todos los componentes en `src/app/components/ui/` son implementaciones propias basadas en este patrón:

| Componente Radix UI | Paquete |
|---|---|
| Accordion, Alert Dialog, Aspect Ratio | `@radix-ui/react-accordion`, etc. |
| Avatar, Checkbox, Collapsible | `@radix-ui/react-*` |
| Context Menu, Dialog, Dropdown Menu | `@radix-ui/react-*` |
| Hover Card, Label, Menubar | `@radix-ui/react-*` |
| Navigation Menu, Popover, Progress | `@radix-ui/react-*` |
| Radio Group, Scroll Area, Select | `@radix-ui/react-*` |
| Separator, Slider, Slot | `@radix-ui/react-*` |
| Switch, Tabs, Toggle, Toggle Group, Tooltip | `@radix-ui/react-*` |

### Material UI (MUI)
| Paquete | Versión | Uso |
|---|---|---|
| `@mui/material` | 7.3.5 | Componentes adicionales de Material Design |
| `@mui/icons-material` | 7.3.5 | Iconos de Material Design |

### Iconografía adicional
| Paquete | Versión | Uso |
|---|---|---|
| **Lucide React** | 0.487.0 | Iconos SVG (usados en la mayoría de componentes propios) |

### Notificaciones / Toasts
| Paquete | Versión |
|---|---|
| **Sonner** | 2.0.3 |

### Otros componentes especializados
| Paquete | Versión | Función |
|---|---|---|
| `cmdk` | 1.1.1 | Paleta de comandos (Command Menu) |
| `vaul` | 1.1.2 | Drawer (panel deslizable) |
| `input-otp` | 1.4.2 | Input para códigos OTP |
| `react-resizable-panels` | 2.1.7 | Paneles redimensionables |

---

## Enrutamiento

| Tecnología | Versión | Rol |
|---|---|---|
| **React Router DOM** | 7.13.0 | SPA routing — rutas protegidas para usuario y admin |

Rutas protegidas implementadas con componentes `ProtectedRoute` y `AdminRoute` usando el contexto de autenticación.

---

## Animaciones

| Tecnología | Versión | Uso |
|---|---|---|
| **Motion** (Framer Motion) | 12.23.24 | Animaciones declarativas — `AnimatePresence` para transiciones de página |
| **tw-animate-css** | 1.3.8 | Clases de animación CSS para Tailwind |

---

## Backend y Autenticación

| Servicio | Versión | Módulos usados |
|---|---|---|
| **Firebase** | ^10.7.0 | `firebase/auth` — autenticación con email/password |

Funcionalidades de Firebase integradas:
- `createUserWithEmailAndPassword`
- `signInWithEmailAndPassword`
- `signOut` / `onAuthStateChanged`
- `browserLocalPersistence` (sesión persistente entre recargas)

> **Nota:** Solo se usa Firebase Authentication. No hay Firestore ni Realtime Database — los datos de productos y órdenes son mock data estática (`src/app/data/mockData.ts`).

---

## Gestión de Estado

Patrón: **React Context API** exclusivamente (sin Redux, Zustand, ni similares).

| Contexto | Responsabilidad |
|---|---|
| `AuthContext` | Sesión de usuario, roles, login/logout/registro |
| `CartContext` | Carrito de compras (items, cantidades, totales) |
| `ProductContext` | Catálogo de productos, CRUD para admin |
| `ThemeContext` | Modo oscuro / claro |
| `CurrencyContext` | Moneda seleccionada y conversión |
| `NotificationContext` | Sistema de notificaciones en app |

---

## Formularios

| Tecnología | Versión | Uso |
|---|---|---|
| **React Hook Form** | 7.55.0 | Manejo de formularios con validación |

---

## Visualización de Datos / Gráficas

| Tecnología | Versión | Uso |
|---|---|---|
| **Recharts** | 2.15.2 | Gráficas en el dashboard de administrador (LineChart, AreaChart) |

---

## Manejo de Fechas

| Tecnología | Versión |
|---|---|
| **date-fns** | 3.6.0 |
| **react-day-picker** | 8.10.1 |

---

## Carruseles y Sliders

| Tecnología | Versión |
|---|---|
| **Embla Carousel** + autoplay | 8.6.0 |
| **React Slick** | 0.31.0 |

---

## Layout Especial

| Tecnología | Versión | Uso |
|---|---|---|
| **react-responsive-masonry** | 2.7.1 | Layout tipo mosaico para catálogo de productos |
| **@popperjs/core** + **react-popper** | 2.11.8 / 2.3.0 | Posicionamiento de tooltips y popovers |

---

## Drag & Drop

| Tecnología | Versión |
|---|---|
| **react-dnd** | 16.0.1 |
| **react-dnd-html5-backend** | 16.0.1 |

---

## Temas / Dark Mode

| Tecnología | Versión | Mecanismo |
|---|---|---|
| **next-themes** | 0.4.6 | Gestión del tema (clase `.dark` en `<html>`) |
| CSS Custom Properties | — | Variables de color redefinidas en selector `.dark` en `theme.css` |

---

## Configuración TypeScript

- **Target:** ES2020
- **Module:** ESNext
- **JSX:** react-jsx
- **Modo estricto:** habilitado (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- **Path alias:** `@/*` → `./src/*`

---

## Estructura de la Aplicación

```
src/
├── main.tsx               # Punto de entrada
├── lib/
│   └── firebase.ts        # Configuración Firebase
├── styles/                # CSS global, tema, fuentes
└── app/
    ├── App.tsx            # Router principal + providers anidados
    ├── components/        # Páginas y componentes funcionales
    │   └── ui/            # Design system propio (shadcn/ui pattern)
    ├── contexts/          # Estado global (6 contextos)
    ├── data/              # Mock data estática
    └── types/             # Definiciones TypeScript
```

---

## Resumen Rápido

| Categoría | Tecnología elegida |
|---|---|
| Lenguaje | TypeScript |
| Framework | React 18 |
| Build | Vite 6 |
| Estilado | Tailwind CSS v4 + CSS Variables |
| Componentes UI | shadcn/ui (Radix UI) + MUI |
| Routing | React Router DOM v7 |
| Estado | React Context API |
| Auth / Backend | Firebase Authentication |
| Animaciones | Framer Motion (Motion) |
| Gráficas | Recharts |
| Formularios | React Hook Form |
