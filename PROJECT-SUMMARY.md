# 🏗️ BuildMart — Project Summary (Easy Explain Guide)

> Yeh file pura project simple Hinglish me samjhati hai — taki aap kisi ko bhi
> (interview, teacher, client) aasani se explain kar sako.

---

## 1. Project kya hai? (One line)

**BuildMart** ek **Construction Materials Marketplace + ERP** hai —
yaani ek website jahan se log **cement, sariya (steel), eet (bricks), balu (sand),
gitti, tiles, paint, pipe, wire** etc. **online order** kar sakte hain, aur
**admin/seller** apna **business manage** (products, stock, orders, payments,
reports) kar sakte hain.

Isme **2 side** hain:
1. **User side (Marketplace)** — customer materials kharidta hai.
2. **Admin side (ERP)** — business manage hota hai.

---

## 2. Sabse important baat (yaad rakhna)

> **Yeh "Frontend-only" project hai. Koi backend ya database nahi hai.**

- Saara data **dummy data** hai jo code ke andar `.ts` files me likha hai.
- Data **browser ki localStorage** me save hota hai (refresh karne par bhi rehta hai).
- Isliye **internet ke bina bhi** logic chalta hai (sirf images ke liye net chahiye).
- Matlab: poora app **React se hi bana hai**, server ki zaroorat nahi.

Interview me bolna: *"It's a frontend-only SPA built in React + TypeScript,
data is seeded as typed dummy data and persisted in localStorage via Zustand."*

---

## 3. Technology Stack (kaunsi cheez use ki)

| Cheez | Use |
|---|---|
| **React 18 + Vite** | Frontend framework + fast build tool |
| **TypeScript** | Type-safe code (no `any`) |
| **Tailwind CSS** | Styling (responsive design) |
| **Zustand** | State management + localStorage persist |
| **React Router** | Page navigation (routing) |
| **Recharts** | Dashboard ke graphs/charts |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Icons |

Hosting: **GitHub** (code) + **Vercel** (live website).

---

## 4. Login kaise hota hai? (Demo credentials)

Login page par **2 tab** hain — User aur Admin. Static credentials:

| Panel | ID | Password | Kahan jata hai |
|---|---|---|---|
| **User** (kharidne wala) | `user` | `user123` | Marketplace |
| **Admin** (bechne/manage) | `admin` | `admin123` | ERP Dashboard |

(Credentials code me `src/data/auth.ts` me static likhe hain.)

---

## 5. USER PANEL — kya kya hai?

Customer ke liye marketplace:

1. **Home** — banner, "Building a new home? Start here" section (cement, sariya,
   eet, balu, gitti images ke saath), categories, featured products.
2. **Catalog** — saare products, search + filter (category, brand, price), sort.
3. **Product detail** — photo gallery, specifications, reviews, "Add to cart",
   "Buy now", WhatsApp par chat, bulk quote (RFQ).
4. **Cart** — quantity change, coupon lagao, GST ke saath total.
5. **Checkout** — address chuno, payment method, order place karo.
6. **Orders** — apne orders + **live tracking** (Placed → Confirmed → Packed →
   Shipped → Out for Delivery → Delivered).
7. **Order detail** — tracking timeline, **Print Invoice (PDF)**, **Reorder**.
8. **Material Calculator** — ghar banane ke liye cement/balu/gitti/eet ki
   quantity calculate karo (concrete + brickwork), seedha cart me add karo.
9. **Quotations (RFQ)** — bulk price request + **Print/Download PDF**.
10. **Wishlist**, **Chat (WhatsApp + in-app)**, **Account**.

---

## 6. ADMIN PANEL (ERP) — kya kya hai?

Business manage karne ke liye (18 sections):

| Section | Kaam |
|---|---|
| **Dashboard** | Revenue, orders, low-stock — charts ke saath |
| **Products** | Product add / edit / delete |
| **Inventory** | Stock update, reorder alert, warehouse |
| **Orders** | Status badlo, **customer ke liye order place** karo |
| **Quotations** | Quote bhejo, **PDF print** |
| **Customers** | Order count, kitna kharcha, block/activate |
| **Vendors** | Suppliers ki list, rating, contact |
| **Purchase Orders** | Vendor ko stock ka order (PO), CSV export |
| **Warehouse** | Stock locations, SKU count, units |
| **Analytics** | Revenue trend, category, top products (graphs) |
| **Payments** | Saare transactions, collected/pending, CSV |
| **Invoices** | GST invoices list + **Print** + CSV |
| **Delivery Tracking** | Active deliveries + tracker + advance |
| **Support Tickets** | Customer complaints, priority, WhatsApp reply |
| **Messages** | Chat (buyer ↔ seller ↔ admin) |
| **Coupons** | Discount codes banao/edit |
| **Reports** | Sales/GST/Customer/Low-stock report → CSV download |
| **Settings** | Store details, theme, reset data |

---

## 7. Special Features (highlight karne layak)

- 🧾 **GST Invoice PDF** — order ka professional bill print/download.
- 📋 **Quotation PDF** — bulk quote ka estimate document.
- 🧮 **Material Calculator** — construction ke liye material estimate (best feature).
- 🛡️ **Admin places order for customer** — admin kisi bhi user ke liye order bana sakta hai.
- 💬 **WhatsApp integration** — `wa.me` deep link se real WhatsApp khulta hai.
- 📊 **CSV export** — orders, products, payments, reports sab download ho sakte.
- 🌗 **Dark / Light mode** + **fully responsive** (mobile, tablet, desktop).
- 🔁 **Reorder** — purana order ek click me dobara cart me.

---

## 8. Project structure (folders)

```
src/
├── types/        → saare data models (TypeScript interfaces)
├── data/         → dummy data (products, users, orders, etc.)
├── store/        → useStore.ts (Zustand — saara data + actions yahan)
├── lib/          → helpers (utils, print PDF, csv, images, whatsapp)
├── components/   → ui (button, card...), layout (navbar, sidebar), shared
└── pages/
    ├── buyer/    → Home, Catalog, Cart, Checkout, Orders, Calculator...
    └── erp/      → Dashboard, Products, Vendors, Reports, Settings... (18)
```

**Sabse important file: `src/store/useStore.ts`** — yahan saara data aur logic
(add to cart, place order, update stock, chat) hai. Backend lagana ho to
yahin `fetch` calls daal do, baaki code same rahega.

---

## 9. App kaise chalaye? (Run karna)

```bash
npm install      # ek baar (dependencies install)
npm run dev      # development server (localhost:5173)
npm run build    # production build banane ke liye
```

Live website (hosted on Vercel):
**https://buildmart-marketplace-erp.vercel.app**

GitHub code:
**https://github.com/anju-rajawat/buildmart-marketplace-erp**

---

## 10. Interview / Demo me kya bolna (short script)

> "Maine **BuildMart** banaya — ek **construction materials marketplace with a
> full ERP**, **React + TypeScript + Tailwind** me, **frontend-only** with dummy
> data persisted in localStorage using Zustand.
>
> User side me: product browse, search/filter, cart, checkout with GST, **live
> order tracking**, **material calculator**, aur **PDF invoice download**.
>
> Admin side me 18 ERP modules hain — products, inventory, orders, vendors,
> purchase orders, payments, invoices, analytics with charts, reports CSV export,
> delivery tracking, support tickets, aur settings.
>
> Special features: admin **customer ke behalf par order** place kar sakta hai,
> **WhatsApp chat integration**, aur sab kuch **fully responsive + dark mode**.
>
> Code GitHub par hai aur **Vercel par live hosted** hai, har push par
> auto-deploy hota hai."

---

## 11. Future me kya add kar sakte (agar pucha jaye)

- Real **backend** (Node.js + MongoDB / .NET + SQL) — store layer se connect.
- Real **payment gateway** (Razorpay) + real **WhatsApp Business API**.
- User **authentication** (real login/JWT).
- Real product images (brand-licensed).

---

*Yeh ek learning/demo project hai. Saara data dummy hai. ✅*
