# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** Read `node_modules/next/dist/docs/` before writing any Next.js code — this project uses Next.js 16 which has breaking changes from earlier versions.

## Commands

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type-check without building
```

No test suite exists in this project.

## Architecture

This is a **single Next.js app serving two completely separate products** in the same codebase:

### 1. Admin/Venue Panel
- **Login:** `/admin/login` — uses `useAuthStore` (store/authStore.ts)
- **Dashboard routes:** `app/admin/(dashboard)/` — protected by `app/admin/(dashboard)/layout.tsx`
- **Auth store keys:** `localStorage: token, user, venueId`
- **Axios instance:** `lib/axios.ts` — reads `token` from localStorage; on 401 clears those keys and does `window.location.href = "/admin/login"`
- **API files that use admin axios:** `lib/api/auth.ts`, `venues.ts`, `venueTypes.ts`, `bookings.ts`, `users.ts`

> There is also a legacy `app/(dashboard)/` route group (no `/admin` prefix) that mirrors the same dashboard — it uses identical auth logic and the same stores.

### 2. Customer Panel
- **Auth pages:** `/signin`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password` — all outside route groups, no layout guard
- **Protected routes:** `app/(customer)/` — protected by `app/(customer)/layout.tsx`
- **Auth store keys:** `localStorage: customer_token, customer_user, customer_customerId`
- **Axios instance:** `lib/customerAxios.ts` — reads `customer_token`; on 401 clears those keys and does `window.location.href = "/signin"`
- **API files that use customer axios:** `lib/api/customerAuth.ts`, `customerVenues.ts`, `customerBookings.ts`, `customersApi.ts`, `ratingsApi.ts`

**Critical rule:** Never use `lib/axios` (admin) for customer-facing API calls and vice versa. Using the wrong axios instance on a protected route causes a 401 that redirects the user to the wrong login page.

### Auth Guard Pattern

Both layout guards use the same pattern — important to replicate exactly when adding new protected layouts:

```tsx
const { token, hydrate } = useAuthStore(); // or useCustomerAuthStore
const [mounted, setMounted] = useState(false);

useEffect(() => { hydrate(); setMounted(true); }, [hydrate]);
useEffect(() => { if (mounted && !token) router.replace("/admin/login"); }, [mounted, token, router]);

if (!mounted || !token) return null;
```

The `mounted` flag prevents SSR/hydration mismatches since both stores read from `localStorage`.

### State Management

Two Zustand stores, both localStorage-backed with a `hydrate()` method that must be called on mount before any auth check:

- `store/authStore.ts` — admin/venue user (`token`, `user`, `venueId`)
- `store/customerAuthStore.ts` — customer user (`token`, `user`, `customerId`)

### Google OAuth

`@react-oauth/google` is installed. `GoogleOAuthProvider` wraps the app in `app/providers.tsx` using `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Customer sign-in/sign-up pages use the `<GoogleLogin>` component (credential flow) — `credentialResponse.credential` is the Google ID token sent to `POST /api/v1/auth/google`.

### API Layer

- Base URL: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8080/api/v1`)
- All API functions live in `lib/api/` and return typed data directly (callers don't touch `axios` or `res.data`)
- Data fetching uses TanStack Query (`@tanstack/react-query`) — mutations via `useMutation`, queries via `useQuery`
- Error messages extracted via `extractErrorMessage()` from `lib/axios.ts`

### Key Conventions

- `@/*` maps to the project root (e.g. `@/lib/api/auth`)
- Tailwind v4 with `@tailwindcss/postcss`
- All pages are `"use client"` — there are no server components with data fetching
- Fonts: `--font-serif` (Noto Serif) and `--font-sans` (Plus Jakarta Sans), set as CSS variables in `app/layout.tsx`
- Shared UI primitives: `components/ui/` (Button, Input, Modal, Toast, Badge, Select, Skeleton)
- Customer-specific components: `components/customer/`
- Admin-specific components: `components/layout/` (Sidebar, MobileNav)

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<web oauth client id>
```
