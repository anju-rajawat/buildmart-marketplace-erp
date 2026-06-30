/**
 * Domain models for the Construction Materials Marketplace + ERP.
 * Frontend-only — these types describe the dummy data and the in-memory store.
 */

// ---------------------------------------------------------------------------
// Users, roles, sellers
// ---------------------------------------------------------------------------

export type Role = 'admin' | 'seller' | 'buyer'

export interface User {
  id: string
  name: string
  email: string
  phone: string // E.164-ish, used for WhatsApp deep links
  avatar: string
  /** A user may hold several roles; `buyer` + `seller` is allowed. */
  roles: Role[]
  addresses: Address[]
  /** Linked seller profile id when the user sells materials. */
  sellerProfileId?: string
  createdAt: string
  isActive: boolean
}

export interface SellerProfile {
  id: string
  userId: string
  businessName: string
  gstin: string
  license: string
  logo: string
  city: string
  state: string
  rating: number
  ratingCount: number
  joinedAt: string
  verified: boolean
}

export interface Address {
  id: string
  label: string // Home, Site, Warehouse
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export interface Category {
  id: string
  name: string
  slug: string
  icon: string // lucide icon name
  parentId?: string
  description: string
}

export type MaterialUnit = 'bag' | 'ton' | 'sqft' | 'piece' | 'litre' | 'kg' | 'box' | 'roll'

export interface Product {
  id: string
  name: string
  slug: string
  categoryId: string
  sellerProfileId: string
  brand: string
  unit: MaterialUnit
  price: number
  mrp: number
  images: string[]
  shortDescription: string
  description: string
  specs: Record<string, string>
  rating: number
  ratingCount: number
  /** Denormalised quick stock figure; authoritative count lives in Inventory. */
  stock: number
  tags: string[]
  featured: boolean
  createdAt: string
}

export interface Warehouse {
  id: string
  name: string
  city: string
  state: string
  sellerProfileId: string
}

export interface Inventory {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  reorderLevel: number
}

// ---------------------------------------------------------------------------
// Cart, orders, tracking, payments
// ---------------------------------------------------------------------------

export interface CartItem {
  productId: string
  quantity: number
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export const ORDER_FLOW: OrderStatus[] = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
]

export interface OrderItem {
  productId: string
  name: string
  brand: string
  unit: MaterialUnit
  price: number
  quantity: number
  image: string
  sellerProfileId: string
}

export interface TrackingEvent {
  status: OrderStatus
  note: string
  location?: string
  timestamp: string
}

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'credit'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Payment {
  id: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  transactionRef: string
  paidAt?: string
}

export interface Order {
  id: string
  code: string // human friendly e.g. BM-10231
  buyerId: string
  /** Set when an admin places/edits the order for the buyer. */
  placedByAdminId?: string
  items: OrderItem[]
  status: OrderStatus
  tracking: TrackingEvent[]
  address: Address
  payment: Payment
  subtotal: number
  discount: number
  gst: number
  shipping: number
  total: number
  couponCode?: string
  createdAt: string
  expectedDelivery: string
}

// ---------------------------------------------------------------------------
// Reviews, coupons, wishlist, RFQ
// ---------------------------------------------------------------------------

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percent' | 'flat'
  value: number
  minOrder: number
  maxDiscount?: number
  active: boolean
  expiresAt: string
}

export type QuotationStatus = 'open' | 'quoted' | 'accepted' | 'rejected'

export interface QuotationItem {
  productId: string
  name: string
  quantity: number
  unit: MaterialUnit
}

export interface Quotation {
  id: string
  code: string
  buyerId: string
  sellerProfileId: string
  items: QuotationItem[]
  note: string
  status: QuotationStatus
  quotedPrice?: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Chat & notifications
// ---------------------------------------------------------------------------

export type ChatChannel = 'in_app' | 'whatsapp'

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  body: string
  channel: ChatChannel
  createdAt: string
  read: boolean
}

export interface ChatThread {
  id: string
  /** Participant user ids (buyer & seller/admin). */
  participantIds: string[]
  subject: string
  channel: ChatChannel
  /** Phone used for WhatsApp deep-link / Cloud API. */
  whatsappPhone?: string
  lastMessageAt: string
}

export type NotificationKind = 'order' | 'stock' | 'chat' | 'system'

export interface AppNotification {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  actorId: string
  action: string
  target: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Procurement & support (ERP)
// ---------------------------------------------------------------------------

export type POStatus = 'draft' | 'sent' | 'received' | 'cancelled'

export interface PurchaseOrderItem {
  name: string
  quantity: number
  unit: MaterialUnit
  rate: number
}

export interface PurchaseOrder {
  id: string
  code: string
  vendorId: string // sellerProfileId of the supplier
  items: PurchaseOrderItem[]
  status: POStatus
  total: number
  createdAt: string
  expectedDate: string
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface SupportTicket {
  id: string
  code: string
  subject: string
  userId: string
  body: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
}
