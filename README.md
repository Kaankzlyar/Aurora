# Aurora

Aurora is a full-stack **luxury e-commerce platform** built around a premium gold-on-black aesthetic. It ships as three coordinated applications that talk to a single REST API:

| App | What it is | Audience |
| --- | --- | --- |
| **EcommerceAPI** | .NET 9 REST API + SQL Server database | — |
| **frontend** | Expo / React Native mobile app ("Aurora") | Customers |
| **adminFrontend1** | Vite + React admin dashboard | Store administrators |

The customer app lets shoppers browse curated collections (New Arrivals, Iconic Selections, Special for Today), manage a cart, save addresses & cards, and place orders. The admin dashboard manages products, orders, and administrator accounts. Both clients are backed by the same JWT-secured API.

> The product UI is primarily in **Turkish**. Code comments are a mix of Turkish and English.

---

## Table of contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
  - [1. Backend — EcommerceAPI](#1-backend--ecommerceapi)
  - [2. Admin dashboard — adminFrontend1](#2-admin-dashboard--adminfrontend1)
  - [3. Mobile app — frontend](#3-mobile-app--frontend)
- [Configuration](#configuration)
- [Domain model](#domain-model)
- [API reference](#api-reference)
- [Authentication & roles](#authentication--roles)
- [Known issues & notes](#known-issues--notes)

---

## Architecture

```
                           ┌─────────────────────────────┐
   Mobile (Expo/RN)        │                             │
  ┌──────────────────┐     │      EcommerceAPI           │
  │   frontend       │────▶│      (.NET 9 Web API)       │
  │  "Aurora" app    │     │                             │       ┌──────────────┐
  └──────────────────┘     │  • JWT auth (Bearer)        │──────▶│  SQL Server  │
                           │  • EF Core 9                │  EF   │  EcommerceDb2│
  ┌──────────────────┐     │  • Static images /wwwroot   │       └──────────────┘
  │  adminFrontend1  │────▶│  • Swagger / OpenAPI        │
  │  (Vite + React)  │     │                             │
  └──────────────────┘     │   http://0.0.0.0:5270       │
   Admin dashboard         └─────────────────────────────┘
```

All three apps communicate over HTTP with the API on **port 5270**. The API serves product images as static files from `wwwroot/images`.

---

## Repository layout

```
Aurora/
├── EcommerceAPI/
│   └── EcommerceAPI/               # ← the actual .NET 9 project (Program.cs, controllers…)
│       ├── Controllers/            # REST endpoints (Auth, Products, Orders, Cart, Admin…)
│       ├── Models/                 # EF Core entities (User, Product, Order, Cart…)
│       ├── Dtos/                   # Request/response DTOs
│       ├── Data/AppDbContext.cs    # EF Core DbContext
│       ├── Migrations/             # EF Core migrations
│       ├── wwwroot/images/         # Uploaded product images (served statically)
│       ├── appsettings.json        # Connection string, JWT key
│       └── Program.cs              # App startup, CORS, JWT, super-admin seeding
│
├── frontend/
│   └── frontend/                   # ← the Expo / React Native app
│       ├── app/                    # expo-router screens
│       │   ├── (auth)/             #   login, register, forgot-password
│       │   ├── (tabs)/             #   home, collection, favorites, profile, new-arrivals…
│       │   ├── checkout.tsx, orders.tsx, my-cards.tsx, my-addresses.tsx, settings.tsx…
│       ├── services/               # API clients (cart, orders, catalog, addresses, cards…)
│       ├── api/                    # http helper, auth, navigation
│       ├── contexts/               # AuthContext, CartContext
│       ├── constants/              # config (BASE_URL), Colors
│       └── app.json                # Expo config
│
├── adminFrontend1/
│   └── adminFrontend/              # ← the Vite + React admin dashboard
│       ├── src/
│       │   ├── pages/              # Dashboard, ProductManagement, OrderManagement, AdminManagement…
│       │   ├── components/         # UI components (shadcn/radix based)
│       │   ├── context/            # AuthProvider
│       │   ├── lib/api.ts          # axios instance (API base URL)
│       │   └── app/routes.tsx      # React Router routes
│       └── vite.config.ts
│
└── .env.example                    # template for root .env (VITE_API_URL); copy to .env (git-ignored)
```

> **Note:** `EcommerceAPI/` is the standard .NET solution layout — the solution file (`EcommerceAPI.sln`) sits alongside the project folder of the same name (`EcommerceAPI/EcommerceAPI/`, which holds `Program.cs`, `appsettings.json`, and all controllers). Open the `.sln` in Visual Studio, or `cd EcommerceAPI/EcommerceAPI` to run the project directly.

---

## Tech stack

### Backend — EcommerceAPI
- **.NET 9** ASP.NET Core Web API
- **Entity Framework Core 9** with **SQL Server**
- **JWT Bearer** authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **BCrypt.Net** password hashing
- **Swashbuckle / Swagger** for API docs
- AngleSharp

### Mobile app — frontend
- **Expo SDK 53** / **React Native 0.79** / **React 19**
- **expo-router** (file-based routing)
- **TypeScript**
- expo-linear-gradient, expo-blur, moti, react-native-reanimated (premium gold-gradient UI)
- Google Fonts: Cinzel, Cormorant Garamond, Playfair Display, Montserrat
- AsyncStorage for token/session persistence

### Admin dashboard — adminFrontend1
- **Vite 7** + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Radix UI** primitives / shadcn-style components
- **React Router 7**
- **axios**, **Recharts** (analytics), **Three.js / @react-three/fiber** (visuals), **@dnd-kit** (drag & drop), **zod**

---

## Prerequisites

- **.NET SDK 9.0+**
- **SQL Server** (LocalDB, Express, or full) reachable at `localhost`
- **Node.js 18+** and **npm**
- **dotnet-ef** CLI tool for migrations: `dotnet tool install --global dotnet-ef`
- For the mobile app: the **Expo Go** app (iOS/Android) or an emulator/simulator

---

## Getting started

Clone the repo, then start each part. The **backend must be running first** — both clients depend on it.

### 1. Backend — EcommerceAPI

```bash
cd EcommerceAPI/EcommerceAPI

# Provide local secrets (JWT key + optional super-admin seed).
# This file is git-ignored — it never gets committed.
cp appsettings.Development.json.example appsettings.Development.json
#   → then edit it and set a real Jwt:Key (and SuperAdmin:Email / SuperAdmin:Password)

# Restore & build
dotnet restore

# Create/update the database from EF Core migrations
dotnet ef database update

# Run the API (listens on http://0.0.0.0:5270)
dotnet run
```

- API base URL: **http://localhost:5270**
- Swagger UI (Development only): **http://localhost:5270/swagger**
- If `SuperAdmin:Email` / `SuperAdmin:Password` are configured, the app **seeds a super-admin account** on first run; otherwise seeding is skipped (see [Authentication & roles](#authentication--roles)).

**Secrets are never committed.** The API refuses to start unless `Jwt:Key` is configured. Provide secrets in any of these (each overrides the previous):

- `appsettings.Development.json` (git-ignored, easiest for local dev), or
- User-secrets: `dotnet user-secrets set "Jwt:Key" "<a-long-random-string>"`, or
- Environment variables: `Jwt__Key`, `SuperAdmin__Email`, `SuperAdmin__Password` (double-underscore maps to the config `:` separator).

Make sure the connection string in `appsettings.json` points at your SQL Server instance (no credentials are stored there — it uses a trusted connection):

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=EcommerceDb2;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 2. Admin dashboard — adminFrontend1

```bash
cd adminFrontend1/adminFrontend

npm install
npm run dev        # Vite dev server, default http://localhost:5173
```

The admin dashboard calls the API via the base URL configured in **`src/lib/api.ts`** (`http://localhost:5270`). Update it there if your API runs elsewhere. Log in with an admin or super-admin account.

Other scripts: `npm run build` (typecheck + production build), `npm run preview`, `npm run lint`.

### 3. Mobile app — frontend

```bash
cd frontend/frontend

npm install
npm start          # or: npx expo start
```

Then scan the QR code with **Expo Go**, or press `a` (Android), `i` (iOS), or `w` (web).

**Important — API host:** a phone or emulator cannot reach `localhost` on your dev machine. Set the API URL to your machine's LAN IP:

- Edit `app.json` → `expo.extra.API_URL` (e.g. `http://192.168.1.x:5270`), **or**
- Adjust the fallback IP in `constants/config.ts`.

The app auto-selects a URL per platform (Android/iOS/web) unless `extra.API_URL` is set.

---

## Configuration

| Setting | Where | Default |
| --- | --- | --- |
| **JWT signing key** 🔑 | `Jwt:Key` — via `appsettings.Development.json` / user-secrets / `Jwt__Key` env var | none (**required** — app won't start without it) |
| **Super-admin seed** 🔑 | `SuperAdmin:Email` / `SuperAdmin:Password` — same sources as above | none (seeding skipped if unset) |
| DB connection string | `EcommerceAPI/EcommerceAPI/appsettings.json` → `ConnectionStrings:DefaultConnection` | `Server=localhost;Database=EcommerceDb2;…` (trusted connection, no credentials) |
| API listen URL | `Program.cs` (`UseUrls`) / `appsettings.json` (`Kestrel`) | `http://0.0.0.0:5270` |
| CORS | `Program.cs` | Allows any origin by default; a `WebPolicy` whitelists localhost:8081/8082/3000 |
| Admin API base URL | `adminFrontend1/adminFrontend/src/lib/api.ts` | `http://localhost:5270` |
| Mobile API base URL | `frontend/frontend/app.json` → `extra.API_URL`, fallback in `constants/config.ts` | LAN IP + `:5270` |

🔑 = secret; provided only through git-ignored local config, user-secrets, or environment variables — never committed. Tracked `*.example` files (`appsettings.Development.json.example`, `.env.example`) document the expected shape.

---

## Domain model

Core EF Core entities (see `EcommerceAPI/EcommerceAPI/Models/`):

- **User** — account with `IsAdmin` / `IsSuperAdmin` flags and an admin-request workflow (`AdminRequested`, `AdminRequestPending`, `AdminRequestReason`). Passwords stored as BCrypt hashes.
- **Product** — name, price, optional `OriginalPrice` + `DiscountPercentage` (drives "Special for Today"), `ImagePath`, `Gender` (Men/Women/Unisex), `CreatedAt` (drives "New Arrival", last 5 days). Belongs to a **Category** and a **Brand**.
- **Category** / **Brand** — product taxonomy.
- **CartItem** — a user's cart line (product + quantity).
- **Order** / **OrderItem** — an order with `Subtotal`, `ShippingFee`, `GrandTotal`, a shipping-address **snapshot**, and a status lifecycle: `Pending → Paid → Preparing → Shipped → Delivered` (or `Canceled`). Order items store price/name at purchase time.
- **Address** — saved delivery addresses.
- **CardOnFile** — saved payment cards.
- **UserFavorite** — wishlist (many-to-many between users and products).

---

## API reference

All routes are prefixed with `/api`. 🔒 = requires a JWT Bearer token; 🛡️ = admin-only.

### Auth — `/api/auth`
| Method | Path | Description |
| --- | --- | --- |
| POST | `/login` | Log in, returns JWT |
| POST | `/register` | Register a new user |

### Products — `/api/products`
| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List products (filterable) |
| GET | `/special-today` | Deterministic daily discounted products |
| GET | `/iconic-selections` | Curated "iconic" products |
| GET | `/new-arrivals` | Products from the last 5 days |
| GET | `/{id}` | Product detail |
| POST | `/` 🛡️ | Create product |
| PUT | `/{id}` 🛡️ | Update product |
| DELETE | `/{id}` 🛡️ | Delete product |

### Categories — `/api/categories` &nbsp;·&nbsp; Brands — `/api/brand`
| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List |
| GET | `/{id}` | Detail |
| GET | `/{id}/products` | Products in category/brand |
| POST · PUT · DELETE | `/…` | Manage (create/update/delete) |

### Cart — `/api/cart` 🔒
| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Get current cart |
| POST | `/items` | Add item |
| PUT | `/items/{productId}` | Update quantity |
| DELETE | `/items/{productId}` | Remove item |
| DELETE | `/` | Clear cart |

### Orders — `/api/orders` 🔒
| Method | Path | Description |
| --- | --- | --- |
| POST | `/checkout` | Place an order from the cart |
| GET | `/` | Current user's orders |
| GET | `/{id}` | Order detail |
| POST | `/{id}/cancel` | Cancel an order |
| GET | `/admin/all` 🛡️ | All orders (admin) |
| POST | `/{id}/status` 🛡️ | Update order status |

### User — `/api/user` 🔒
| Method | Path | Description |
| --- | --- | --- |
| GET | `/profile` | Current user profile |
| GET | `/favorites` | List favorites |
| POST | `/favorites/{productId}` | Add favorite |
| DELETE | `/favorites/{productId}` | Remove favorite |
| DELETE | `/favorites` | Clear favorites |

### Addresses — `/api/addresses` 🔒 &nbsp;·&nbsp; Cards — `/api/cards` 🔒
| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

### Admin — `/api/admin` 🔒🛡️
| Method | Path | Description |
| --- | --- | --- |
| POST | `/request-admin` | Request admin privileges |
| GET | `/pending-requests` | List pending admin requests |
| POST | `/approve-request` | Approve an admin request |
| GET | `/list-admins` | List administrators |
| POST | `/remove-admin/{userId}` | Revoke admin |

### Dashboard — `/api/dashboard` 🔒🛡️
| Method | Path | Description |
| --- | --- | --- |
| GET | `/stats` | Aggregate store stats |
| GET | `/recent-users` | Recently registered users |
| GET | `/register-chart` | Registrations per day (last N days) |

### Files — `/api/files`
| Method | Path | Description |
| --- | --- | --- |
| POST | `/upload` | Upload an image (stored under `wwwroot/images`) |

> The full, always-up-to-date contract is available in **Swagger** at `/swagger` while the API runs in Development.

---

## Authentication & roles

- Auth is **JWT Bearer**. Clients call `POST /api/auth/login`, then send `Authorization: Bearer <token>` on protected requests.
- Passwords are hashed with **BCrypt**.
- Three privilege levels:
  - **User** — shop, cart, orders, favorites, addresses, cards.
  - **Admin** (`IsAdmin`) — product/order management, dashboard.
  - **Super Admin** (`IsSuperAdmin`) — approves admin requests and manages administrators.
- Users can request admin access (`/api/admin/request-admin`); a super-admin approves via the admin dashboard.

### Bootstrapping the first super-admin

The super-admin is **seeded from configuration**, not hardcoded. Set the following (in git-ignored `appsettings.Development.json`, user-secrets, or env vars) and start the API:

```json
"SuperAdmin": {
  "Email": "you@example.com",
  "Password": "<a-strong-password>"
}
```

On startup the app creates that account (or promotes an existing user with that email) as super-admin, then logs a reminder to change the password. If these values are omitted, seeding is skipped and you can grant `IsSuperAdmin` manually in the database.

> ⚠️ Change the seeded password after first login. Never commit real values — put them only in git-ignored config, user-secrets, or environment variables.

---

## Known issues & notes

- **HTTPS redirection** is enabled in `Program.cs`; when running HTTP-only on `:5270` you may see redirect warnings — use the `http` launch profile or the mobile `extra.API_URL` accordingly.
- **`node_modules` were historically committed** under `frontend/node_modules/`. They are now git-ignored but remain in Git history; a maintainer may want to `git rm -r --cached frontend/node_modules` in a dedicated cleanup commit.
- **Rotate previously-committed secrets.** Earlier commits contained a JWT key and super-admin password. They have been removed from the working tree and are now git-ignored, but they still exist in Git history — rotate the JWT key and change the super-admin password so the old values are worthless.
```
