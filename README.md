# 🏗️ BuildMart — Construction Materials Marketplace + ERP

A **production-grade, frontend-only** construction materials marketplace combined with an ERP,
built in **TypeScript + React + Vite + Tailwind CSS**. There is **no backend, no API server and no
database** — all data is seeded as typed dummy data, managed in an in-memory store, and persisted to
`localStorage`. Every screen works fully offline.

> Cement, steel/TMT, bricks, sand, tiles, paint, plumbing & electrical — browse, buy, track,
> and manage. Buyers shop & track orders; sellers and admins run the ERP; everyone can chat
> (in-app + WhatsApp).

---

## ✨ Highlights

- **3 roles, one app** — `admin`, `seller`, `buyer`. A single user can be **both buyer and seller**
  and switch context with a role switcher.
- **Marketplace** — storefront, category browse, search + filters (price/brand/category), product
  detail with specs & reviews, wishlist, cart, checkout, GST-style invoice & coupons.
- **Order tracking** — buyer-facing status stepper (Placed → Confirmed → Packed → Shipped → Out for
  Delivery → Delivered) with a full event timeline.
- **ERP dashboards** — revenue trend, top products, order funnel, category split, low-stock alerts
  (Recharts).
- **Admin acts on behalf of users** — admin can place/modify an order for any customer.
- **WhatsApp integration** — a `WhatsAppProvider` abstraction with a **mock provider** (works offline)
  and a real **`wa.me` click-to-chat deep link**. Swap in the Cloud API with a one-line change.
- **Fully responsive** — mobile-first; collapsible sidebar, mobile bottom-nav, card↔table layouts,
  responsive charts. Light **and** dark mode.
- **Strict TypeScript** — no `any`, shared models, a single seed-data source.

---

## 🚀 Getting started

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

Then open the printed URL (default `http://localhost:5173`). On the login screen, pick any demo
account — **no password needed**.

### 🔑 Demo accounts

| Account | Role(s) | What to explore |
|---|---|---|
| **Ravi Sharma** | `admin` | Full ERP — analytics, all orders/products/customers, place order for a customer, coupons |
| **Vikram Singh** | `seller` | Seller console — own products, stock, incoming orders, quotations |
| **Sunita Rao** | `buyer` | Shop, cart, checkout, live order tracking, RFQ, chat |
| **Amit Verma** | `buyer` + `seller` | Role switcher — shop as a buyer **and** manage a storefront |

> All data is dummy and stored in your browser. Use **Account → Reset data** to restore the seed
> state at any time.

---

## 🧱 Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite 5 (SPA, frontend-only) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + custom industrial theme (amber/slate) |
| State | Zustand + `persist` middleware (localStorage) |
| Routing | React Router 6 |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | lucide-react |

---

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — folder structure, data flow, store design.
- [`docs/DATA_MODELS.md`](docs/DATA_MODELS.md) — every TypeScript model and how they relate.
- [`docs/FEATURES.md`](docs/FEATURES.md) — feature-by-feature walkthrough per role.
- [`docs/WHATSAPP.md`](docs/WHATSAPP.md) — how the WhatsApp abstraction works & how to go live.

---

## 🔌 Wiring a real backend later

The app is intentionally structured so a backend can be dropped in with minimal churn:

1. **Models already exist** in `src/types` — mirror them in your API / Prisma schema.
2. **The store (`src/store/useStore.ts`) is the single integration seam.** Replace the synchronous
   array mutations inside each action with `fetch` calls to your API; component code does not change.
3. **WhatsApp** — implement `CloudApiWhatsAppProvider` in `src/lib/whatsapp.ts` and swap the export.

---

## 📦 Project scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Typecheck (`tsc --noEmit`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Typecheck only |

---

Built as a frontend-only demo — TypeScript · React · Tailwind · Zustand · data persisted to localStorage.
