import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Address,
  AppNotification,
  CartItem,
  ChatMessage,
  ChatThread,
  Coupon,
  Inventory,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Quotation,
  Review,
  Role,
  SellerProfile,
  User,
  Warehouse,
} from '@/types'
import { ORDER_FLOW } from '@/types'
import * as seed from '@/data'
import { uid } from '@/lib/utils'

const GST_RATE = 0.18
const SHIPPING_FLAT = 250
const FREE_SHIP_OVER = 50000

export interface OrderTotals {
  subtotal: number
  discount: number
  gst: number
  shipping: number
  total: number
}

interface StoreState {
  // session
  currentUserId: string | null
  activeRole: Role | null

  // data
  users: User[]
  sellerProfiles: SellerProfile[]
  products: Product[]
  categories: typeof seed.categories
  orders: Order[]
  reviews: Review[]
  coupons: Coupon[]
  warehouses: Warehouse[]
  inventory: Inventory[]
  quotations: Quotation[]
  chatThreads: ChatThread[]
  chatMessages: ChatMessage[]
  notifications: AppNotification[]

  // buyer cart & wishlist (per active session, kept simple)
  cart: CartItem[]
  wishlist: string[]
  appliedCoupon: string | null

  // ---- session actions ----
  login: (userId: string, role: Role) => void
  logout: () => void
  setActiveRole: (role: Role) => void

  // ---- cart ----
  addToCart: (productId: string, quantity?: number) => void
  updateCartQty: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => { ok: boolean; message: string }
  removeCoupon: () => void
  cartTotals: () => OrderTotals

  // ---- wishlist ----
  toggleWishlist: (productId: string) => void

  // ---- orders ----
  placeOrder: (input: {
    buyerId: string
    addressId: string
    method: Order['payment']['method']
    items?: OrderItem[]
    placedByAdminId?: string
  }) => Order
  advanceOrderStatus: (orderId: string) => void
  setOrderStatus: (orderId: string, status: OrderStatus) => void
  cancelOrder: (orderId: string) => void

  // ---- products / inventory (seller & admin) ----
  upsertProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  setStock: (productId: string, quantity: number) => void

  // ---- coupons ----
  upsertCoupon: (coupon: Coupon) => void
  deleteCoupon: (couponId: string) => void

  // ---- users ----
  toggleUserActive: (userId: string) => void

  // ---- reviews ----
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void

  // ---- chat ----
  sendMessage: (threadId: string, senderId: string, body: string) => void
  markThreadRead: (threadId: string, userId: string) => void
  startThread: (input: { participantIds: string[]; subject: string; whatsappPhone?: string }) => string

  // ---- quotations ----
  createQuotation: (q: Omit<Quotation, 'id' | 'code' | 'createdAt' | 'status'>) => void
  setQuotationStatus: (id: string, status: Quotation['status'], quotedPrice?: number) => void

  // ---- notifications ----
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (userId: string) => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void

  // ---- misc ----
  resetData: () => void
}

function computeTotals(
  items: { price: number; quantity: number }[],
  coupon: Coupon | null,
): OrderTotals {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  let discount = 0
  if (coupon && coupon.active && subtotal >= coupon.minOrder) {
    discount =
      coupon.type === 'percent'
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  }
  const taxable = subtotal - discount
  const gst = Math.round(taxable * GST_RATE)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT
  const total = taxable + gst + shipping
  return { subtotal, discount, gst, shipping, total }
}

const seedState = () => ({
  users: seed.users,
  sellerProfiles: seed.sellerProfiles,
  products: seed.products,
  categories: seed.categories,
  orders: seed.orders,
  reviews: seed.reviews,
  coupons: seed.coupons,
  warehouses: seed.warehouses,
  inventory: seed.inventory,
  quotations: seed.quotations,
  chatThreads: seed.chatThreads,
  chatMessages: seed.chatMessages,
  notifications: seed.notifications,
})

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      activeRole: null,
      ...seedState(),
      cart: [],
      wishlist: [],
      appliedCoupon: null,

      // ---- session ----
      login: (userId, role) => set({ currentUserId: userId, activeRole: role }),
      logout: () => set({ currentUserId: null, activeRole: null, cart: [], appliedCoupon: null }),
      setActiveRole: (role) => set({ activeRole: role }),

      // ---- cart ----
      addToCart: (productId, quantity = 1) =>
        set((s) => {
          const existing = s.cart.find((c) => c.productId === productId)
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c,
              ),
            }
          }
          return { cart: [...s.cart, { productId, quantity }] }
        }),
      updateCartQty: (productId, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((c) => c.productId !== productId)
              : s.cart.map((c) => (c.productId === productId ? { ...c, quantity } : c)),
        })),
      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      applyCoupon: (code) => {
        const coupon = get().coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
        if (!coupon) return { ok: false, message: 'Invalid coupon code.' }
        if (!coupon.active || new Date(coupon.expiresAt) < new Date())
          return { ok: false, message: 'This coupon has expired.' }
        const totals = get().cartTotals()
        if (totals.subtotal < coupon.minOrder)
          return {
            ok: false,
            message: `Minimum order ₹${coupon.minOrder.toLocaleString('en-IN')} required.`,
          }
        set({ appliedCoupon: coupon.code })
        return { ok: true, message: `Coupon ${coupon.code} applied!` }
      },
      removeCoupon: () => set({ appliedCoupon: null }),
      cartTotals: () => {
        const s = get()
        const items = s.cart.map((c) => {
          const p = s.products.find((x) => x.id === c.productId)!
          return { price: p?.price ?? 0, quantity: c.quantity }
        })
        const coupon = s.coupons.find((c) => c.code === s.appliedCoupon) ?? null
        return computeTotals(items, coupon)
      },

      // ---- wishlist ----
      toggleWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter((id) => id !== productId)
            : [...s.wishlist, productId],
        })),

      // ---- orders ----
      placeOrder: ({ buyerId, addressId, method, items, placedByAdminId }) => {
        const s = get()
        const buyer = s.users.find((u) => u.id === buyerId)!
        const address =
          buyer.addresses.find((a) => a.id === addressId) ??
          buyer.addresses.find((a) => a.isDefault) ??
          buyer.addresses[0]
        const orderItems: OrderItem[] =
          items ??
          s.cart.map((c) => {
            const p = s.products.find((x) => x.id === c.productId)!
            return {
              productId: p.id,
              name: p.name,
              brand: p.brand,
              unit: p.unit,
              price: p.price,
              quantity: c.quantity,
              image: p.images[0],
              sellerProfileId: p.sellerProfileId,
            }
          })
        const coupon = s.coupons.find((c) => c.code === s.appliedCoupon) ?? null
        const totals = computeTotals(orderItems, coupon)
        const now = new Date().toISOString()
        const code = `BM-${10371 + s.orders.length}`
        const order: Order = {
          id: uid('o'),
          code,
          buyerId,
          placedByAdminId,
          items: orderItems,
          status: 'placed',
          tracking: [{ status: 'placed', note: 'Order placed successfully', timestamp: now }],
          address: address ?? {
            id: 'addr_x',
            label: 'Default',
            line1: '—',
            city: '—',
            state: '—',
            pincode: '000000',
            isDefault: true,
          },
          payment: {
            id: uid('pay'),
            method,
            status: method === 'cod' || method === 'credit' ? 'pending' : 'paid',
            amount: totals.total,
            transactionRef: `TXN${code.replace('BM-', '')}`,
            paidAt: method === 'cod' || method === 'credit' ? undefined : now,
          },
          ...totals,
          couponCode: coupon?.code,
          createdAt: now,
          expectedDelivery: new Date(Date.now() + 5 * 86400_000).toISOString(),
        }
        // decrement stock
        const updatedProducts = s.products.map((p) => {
          const oi = orderItems.find((i) => i.productId === p.id)
          return oi ? { ...p, stock: Math.max(0, p.stock - oi.quantity) } : p
        })
        const updatedInventory = s.inventory.map((inv) => {
          const oi = orderItems.find((i) => i.productId === inv.productId)
          return oi ? { ...inv, quantity: Math.max(0, inv.quantity - oi.quantity) } : inv
        })
        set({
          orders: [order, ...s.orders],
          products: updatedProducts,
          inventory: updatedInventory,
          cart: items ? s.cart : [],
          appliedCoupon: items ? s.appliedCoupon : null,
        })
        // notify buyer + admin
        get().pushNotification({
          userId: buyerId,
          kind: 'order',
          title: 'Order placed',
          body: `${code} placed successfully — ₹${totals.total.toLocaleString('en-IN')}.`,
          link: `/orders/${order.id}`,
        })
        return order
      },
      advanceOrderStatus: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId || o.status === 'cancelled') return o
            const idx = ORDER_FLOW.indexOf(o.status)
            if (idx < 0 || idx >= ORDER_FLOW.length - 1) return o
            const next = ORDER_FLOW[idx + 1]
            return {
              ...o,
              status: next,
              tracking: [
                ...o.tracking,
                {
                  status: next,
                  note: `Status updated to ${next.replace(/_/g, ' ')}`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          }),
        })),
      setOrderStatus: (orderId, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  tracking: [
                    ...o.tracking,
                    {
                      status,
                      note: `Status set to ${status.replace(/_/g, ' ')}`,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : o,
          ),
        })),
      cancelOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'cancelled',
                  tracking: [
                    ...o.tracking,
                    { status: 'cancelled', note: 'Order cancelled', timestamp: new Date().toISOString() },
                  ],
                }
              : o,
          ),
        })),

      // ---- products / inventory ----
      upsertProduct: (product) =>
        set((s) => {
          const exists = s.products.some((p) => p.id === product.id)
          return {
            products: exists
              ? s.products.map((p) => (p.id === product.id ? product : p))
              : [{ ...product }, ...s.products],
          }
        }),
      deleteProduct: (productId) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== productId) })),
      setStock: (productId, quantity) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === productId ? { ...p, stock: quantity } : p)),
          inventory: s.inventory.map((inv) =>
            inv.productId === productId ? { ...inv, quantity } : inv,
          ),
        })),

      // ---- coupons ----
      upsertCoupon: (coupon) =>
        set((s) => ({
          coupons: s.coupons.some((c) => c.id === coupon.id)
            ? s.coupons.map((c) => (c.id === coupon.id ? coupon : c))
            : [coupon, ...s.coupons],
        })),
      deleteCoupon: (couponId) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== couponId) })),

      // ---- users ----
      toggleUserActive: (userId) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
        })),

      // ---- reviews ----
      addReview: (review) =>
        set((s) => {
          const full: Review = { ...review, id: uid('r'), createdAt: new Date().toISOString() }
          // recompute product rating
          const productReviews = [...s.reviews, full].filter((r) => r.productId === review.productId)
          const avg =
            productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          return {
            reviews: [full, ...s.reviews],
            products: s.products.map((p) =>
              p.id === review.productId
                ? { ...p, rating: Math.round(avg * 10) / 10, ratingCount: p.ratingCount + 1 }
                : p,
            ),
          }
        }),

      // ---- chat ----
      sendMessage: (threadId, senderId, body) =>
        set((s) => {
          const now = new Date().toISOString()
          const thread = s.chatThreads.find((t) => t.id === threadId)
          const msg: ChatMessage = {
            id: uid('m'),
            threadId,
            senderId,
            body,
            channel: thread?.channel ?? 'in_app',
            createdAt: now,
            read: false,
          }
          return {
            chatMessages: [...s.chatMessages, msg],
            chatThreads: s.chatThreads.map((t) =>
              t.id === threadId ? { ...t, lastMessageAt: now } : t,
            ),
          }
        }),
      markThreadRead: (threadId, userId) =>
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.threadId === threadId && m.senderId !== userId ? { ...m, read: true } : m,
          ),
        })),
      startThread: ({ participantIds, subject, whatsappPhone }) => {
        const id = uid('t')
        set((s) => ({
          chatThreads: [
            {
              id,
              participantIds,
              subject,
              channel: whatsappPhone ? 'whatsapp' : 'in_app',
              whatsappPhone,
              lastMessageAt: new Date().toISOString(),
            },
            ...s.chatThreads,
          ],
        }))
        return id
      },

      // ---- quotations ----
      createQuotation: (q) =>
        set((s) => ({
          quotations: [
            {
              ...q,
              id: uid('q'),
              code: `RFQ-${2044 + s.quotations.length}`,
              status: 'open',
              createdAt: new Date().toISOString(),
            },
            ...s.quotations,
          ],
        })),
      setQuotationStatus: (id, status, quotedPrice) =>
        set((s) => ({
          quotations: s.quotations.map((q) =>
            q.id === id ? { ...q, status, quotedPrice: quotedPrice ?? q.quotedPrice } : q,
          ),
        })),

      // ---- notifications ----
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: (userId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n,
          ),
        })),
      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid('n'), read: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ],
        })),

      // ---- misc ----
      resetData: () =>
        set({ ...seedState(), cart: [], wishlist: [], appliedCoupon: null }),
    }),
    {
      name: 'buildmart-store-v1',
      // Bump when seed data shape/imagery changes. v2 refreshes catalog to real
      // material photos while keeping the user's session, orders, cart, etc.
      version: 6,
      migrate: (persisted, version) => {
        const state = persisted as Partial<StoreState>
        const next =
          version < 6
            ? { ...state, products: seed.products, inventory: seed.inventory }
            : state
        return next as StoreState
      },
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        activeRole: s.activeRole,
        users: s.users,
        sellerProfiles: s.sellerProfiles,
        products: s.products,
        orders: s.orders,
        reviews: s.reviews,
        coupons: s.coupons,
        inventory: s.inventory,
        quotations: s.quotations,
        chatThreads: s.chatThreads,
        chatMessages: s.chatMessages,
        notifications: s.notifications,
        cart: s.cart,
        wishlist: s.wishlist,
        appliedCoupon: s.appliedCoupon,
      }),
    },
  ),
)
