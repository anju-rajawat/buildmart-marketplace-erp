# Features

A walkthrough of what each role can do. All actions mutate the persisted store, so changes survive a
page refresh.

## 🛒 Buyer (marketplace)

| Feature | Where | Notes |
|---|---|---|
| Storefront | `/` | Hero, trust strip, category grid, featured & top-rated rails. |
| Browse & filter | `/catalog` | Search (`?q=`), category (`?category=`), price slider, brand filters, sort. Responsive filter drawer on mobile. |
| Product detail | `/product/:slug` | Image gallery, specs table, reviews, related products, quantity picker. |
| Reviews | product page | Write a review → product rating recomputes live. |
| Wishlist | `/wishlist` | Heart any product; persisted. |
| Cart | `/cart` | Quantity edit, remove, coupon apply (`FIRST10`, `BUILD500`, `TILE5`), live totals. |
| Checkout | `/checkout` | Address select, payment method, GST-style summary → places order & decrements stock. |
| Orders | `/orders` | All your orders with status badges & item thumbnails. |
| **Order tracking** | `/orders/:id` | Status **stepper** + event **timeline**, expected delivery, invoice breakdown, cancel (while early). |
| Quotations (RFQ) | `/quotations` | Track bulk-price requests and seller quotes. |
| Chat | `/chat` | In-app + WhatsApp threads (see WhatsApp below). |
| Account | `/account` | Profile, roles, addresses, reset demo data, sign out, jump to ERP (if seller/admin). |

## 🏪 Seller (ERP console)

| Feature | Where | Notes |
|---|---|---|
| Dashboard | `/erp` | Revenue (own line items), orders, products, low-stock — scoped to the seller. |
| Products | `/erp/products` | Add / edit / delete own products (modal form). Table on desktop, cards on mobile. |
| Inventory | `/erp/inventory` | Inline stock edit, reorder-level status, warehouse mapping. |
| Orders | `/erp/orders` | Incoming orders containing the seller's items; **advance** or **set** status; view tracker. |
| Quotations | `/erp/quotations` | Respond to RFQs with a quoted price; accept/decline. |
| Messages | `/erp/chat` | Same unified chat. |
| Role switch | sidebar | If also a buyer, jump back to the marketplace. |

## 🛡️ Admin (full ERP)

Everything the seller sees, **platform-wide**, plus:

| Feature | Where | Notes |
|---|---|---|
| Global dashboard | `/erp` | All revenue, orders, catalog split, order funnel, low stock. |
| All products | `/erp/products` | Manage any seller's products; seller column shown. |
| All orders | `/erp/orders` | Filter by status/customer; advance/set status on any order. |
| **Place order for a customer** | `/erp/orders` → "Place order for customer" | Pick a buyer, add products, choose payment → order is tagged `placedByAdminId` and shows a **"Placed by admin"** badge for the buyer. |
| Customers | `/erp/customers` | Order counts, lifetime spend, block/activate, WhatsApp the customer. |
| Coupons | `/erp/coupons` | Create / edit / delete promo codes (percent or flat, min order, max discount, expiry, active). |

## 💬 WhatsApp & in-app chat

- The **Chat** page (`/chat`, `/erp/chat`) lists all conversations for the logged-in user, mixing
  **in-app** and **WhatsApp** threads.
- Sending on a WhatsApp thread routes the message through the `WhatsAppProvider` (mock by default).
- Each WhatsApp thread exposes a real **`wa.me` deep link** that opens WhatsApp on any device.
- From a product page, **"Chat on WhatsApp"** opens the seller's WhatsApp **and** records the thread
  in-app.
- See [`WHATSAPP.md`](WHATSAPP.md) for going live.

## 🔔 Cross-cutting

- **Notifications** — bell in both shells; order/stock/chat/system kinds; mark-all-read.
- **Theme** — light/dark toggle, persisted, respects system preference on first load.
- **Toasts** — lightweight feedback on every action.
- **Role switcher** — for buyer+seller accounts (e.g. *Amit Verma*).
- **Reset data** — restore the full seed state from *Account*.
