# boxful-web

Cliente web para **Boxful**: login, alta de cuenta, crear/editar ordenes, historial con detalle lateral, etc. Lo armamos con **Next.js (App Router)**, React, **Ant Design**, Tailwind donde encaja bien, y Axios contra tu API Nest (o similar).

Si sabés algo de frontend, con esto alcanza.

---

## Primera vez (clonar y levantar)

1. Tenés Node **18+** (ideal **20 LTS**) y npm.
2. En la carpeta del repo:

```bash
npm install
```

3. Duplicá el ejemplo de entorno y ajustá la URL del backend:

```bash
cp .env.example .env.local
```

Abrís `.env.local` y configurás **`NEXT_PUBLIC_API_BASE_URL`** (ej. `http://localhost:3001/api` sin slash final si tu cliente ya arma rutas así).

4. Arrancá en desarrollo:

```bash
npm run dev
```

Abrís **http://localhost:3000** y listo.

---

## Scripts útiles

| Comando                | Para qué                           |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | servidor de desarrollo (Turbopack) |
| `npm run build`        | compilación producción             |
| `npm run start`        | servidor después de `build`        |
| `npm run lint`         | ESLint                             |
| `npm run format`       | Prettier en todo                   |
| `npm run format:check` | solo revisa formato (CI friendly)  |

---

## Cómo está armado el repo (resumen)

- **`app/`** — Rutas y layouts del App Router (`page.tsx`, `layout.tsx`, `loading.tsx`, `globals.css`). Casi todo el “enchufe” a páginas; la lógica gorda está en `src/`.

- **`src/components/`** — Piezas reusables UI (tarjetas, botones, formularios mínimos, providers de tema/Ant).

- **`src/layouts/`** — Shell del dashboard (sidebar + header chrome + zona de contenido), layout de auth, top bar del dashboard.

- **`src/features/`** — Pantallas grandes por dominio: `auth/`, `crear-orden/` (flujo paso a paso + edición por query), `dashboard/` (router del hub `/app`), `historial/` (tabla/detalle/drawer), `login/` y `register/`.

- **`src/services/`** — Llamadas HTTP (Axios client en `services/http/` + `orders`, `users`, `auth`).

- **`src/lib/`** — Helpers que no son “servicio”: env validado (`env.ts`), tema Ant, JWT/token en cliente, drafts en `sessionStorage` para crear orden.

- **`src/hooks/`** — Hooks reusables (`use-dashboard-header`, `use-historial-orders`, navegación con pending, breakpoints Ant).

- **`src/utils/` y `src/validations/`** — Helpers puros + esquemas Zod/formularios.

- **`src/types/`** y **`src/constants/`** — Tipos TS compartidos, rutas públicas (`routes.ts`), textos unificados (`loading-copy`, `form-feedback-copy`, ubicaciones SV, sidebar del menú).

- **`public/`** — Estáticos (logo, etc.). No sube el lock por ignorar `public` solo si lo pusieramos; acá está trackeado.

El alias **`@/*`** apunta a **`src/*`** (ver `tsconfig.json`).

---

## Producción rápida

```bash
npm install
npm run build
npm run start
```

Sirve la app en el puerto que te indica la consola (por defecto 3000). El API sigue configurándose solo con **`NEXT_PUBLIC_*`** en tiempo de build.

---

## Tips si algo rompe al clonar

- Sin **`.env.local`** el front igual arranca pero usa fallback de API definido en `src/lib/env.ts` — si tu backend está en otro puerto/host, configurá **`NEXT_PUBLIC_API_BASE_URL`**.
- Si cambiás dependencias, volvé a **`npm install`**.

---

Licencia privada del proyecto (ajustá si hace falta).
