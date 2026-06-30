# Data Models

All models live in [`src/types/index.ts`](../src/types/index.ts) and are the single source of truth.
Dummy data in `src/data/` conforms to these types. There are **24 interfaces/types** across 6 domains.

## Entity relationship (overview)

```
User ──< Address
User ──1:1?─ SellerProfile ──< Product >── Category
                   │              │
                   │              ├──1:1 Inventory ──> Warehouse
SellerProfile ──< Warehouse      │
                                  │
Buyer(User) ──< Cart(item)  ─────┘
Buyer(User) ──< Order ──< OrderItem
                  │  └──< TrackingEvent
                  │  └──1 Payment
                  └── Address (snapshot)
Buyer ──< Review >── Product
Buyer ──< Quotation >── SellerProfile
User  ──< ChatThread ──< ChatMessage   (channel: in_app | whatsapp)
User  ──< Notification
Coupon (standalone, applied to Order)
```

## 1. Users, roles & sellers

| Model | Key fields | Notes |
|---|---|---|
| **`User`** | `id, name, email, phone, roles[], addresses[], sellerProfileId?` | `roles` may contain `buyer` + `seller`. `phone` is used for WhatsApp deep links. |
| **`Role`** | `'admin' \| 'seller' \| 'buyer'` | Drives layout + permissions. |
| **`SellerProfile`** | `businessName, gstin, license, rating, verified` | Linked to a `User` via `userId`. |
| **`Address`** | `label, line1, city, state, pincode, isDefault` | Embedded in `User`; snapshotted onto `Order`. |

## 2. Catalog

| Model | Key fields | Notes |
|---|---|---|
| **`Category`** | `name, slug, icon, parentId?` | 8 seeded categories; `icon` maps to a lucide icon. |
| **`Product`** | `name, brand, unit, price, mrp, images[], specs, stock, rating, featured` | `unit` is a `MaterialUnit`. `stock` is a denormalised quick figure. |
| **`MaterialUnit`** | `bag \| ton \| sqft \| piece \| litre \| kg \| box \| roll` | Construction-specific units. |
| **`Warehouse`** | `name, city, state, sellerProfileId` | Per-seller stock location. |
| **`Inventory`** | `productId, warehouseId, quantity, reorderLevel` | Authoritative stock + low-stock threshold. |

## 3. Cart, orders, tracking, payments

| Model | Key fields | Notes |
|---|---|---|
| **`CartItem`** | `productId, quantity` | Buyer's working cart (in store). |
| **`Order`** | `code, buyerId, placedByAdminId?, items[], status, tracking[], address, payment, subtotal, discount, gst, shipping, total` | `placedByAdminId` set when an admin orders on a buyer's behalf. |
| **`OrderItem`** | `productId, name, brand, unit, price, quantity, sellerProfileId` | Denormalised so orders are self-contained. |
| **`OrderStatus`** | `placed \| confirmed \| packed \| shipped \| out_for_delivery \| delivered \| cancelled` | `ORDER_FLOW` defines the happy-path sequence used by the tracker. |
| **`TrackingEvent`** | `status, note, location?, timestamp` | One per status transition; drives the timeline. |
| **`Payment`** | `method, status, amount, transactionRef` | `method`: cod/upi/card/credit. |

## 4. Reviews, coupons, wishlist, RFQ

| Model | Key fields | Notes |
|---|---|---|
| **`Review`** | `productId, userId, rating, title, body` | Adding a review recomputes the product's average rating. |
| **`Coupon`** | `code, type(percent\|flat), value, minOrder, maxDiscount?, active, expiresAt` | Applied at cart/checkout; admin-managed. |
| **`Quotation`** | `code, buyerId, sellerProfileId, items[], note, status, quotedPrice?` | RFQ flow: open → quoted → accepted/rejected. |
| **Wishlist** | `string[]` of product ids | Stored on the session in the store. |

## 5. Chat & notifications

| Model | Key fields | Notes |
|---|---|---|
| **`ChatThread`** | `participantIds[], subject, channel, whatsappPhone?` | `channel`: `in_app` or `whatsapp`. |
| **`ChatMessage`** | `threadId, senderId, body, channel, read` | WhatsApp messages route through the provider on send. |
| **`AppNotification`** | `userId, kind(order\|stock\|chat\|system), title, body, link?, read` | Surfaced in the notification bell. |
| **`AuditLogEntry`** | `actorId, action, target` | Reserved for admin audit trails. |

## Totals calculation

Order/cart totals are computed centrally (see `computeTotals` in `useStore.ts`):

```
subtotal  = Σ price × quantity
discount  = coupon applied to subtotal (respecting minOrder & maxDiscount)
gst       = 18% of (subtotal − discount)
shipping  = FREE if subtotal ≥ ₹50,000, else ₹250
total     = subtotal − discount + gst + shipping
```

## Seed data volume

- **10 users** (admin, 4 sellers, buyers — incl. 1 buyer+seller).
- **5 seller profiles**, **5 warehouses**, inventory row per product.
- **8 categories**, **34 products**, **10 reviews**.
- **15 orders** across every status (incl. cancelled & admin-placed).
- **4 coupons**, **3 quotations**, **4 chat threads / 9 messages**, **4 notifications**.
