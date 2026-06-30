import type { Order, OrderItem, OrderStatus, TrackingEvent } from '@/types'
import { ORDER_FLOW } from '@/types'
import { products } from './products'
import { users } from './users'

function itemFor(productId: string, quantity: number): OrderItem {
  const p = products.find((x) => x.id === productId)!
  return {
    productId: p.id,
    name: p.name,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    quantity,
    image: p.images[0],
    sellerProfileId: p.sellerProfileId,
  }
}

/** Build a tracking timeline up to (and including) the current status. */
function trackingFor(status: OrderStatus, baseISO: string): TrackingEvent[] {
  if (status === 'cancelled') {
    return [
      { status: 'placed', note: 'Order placed', timestamp: baseISO },
      {
        status: 'cancelled',
        note: 'Order cancelled by buyer',
        timestamp: new Date(new Date(baseISO).getTime() + 3600_000).toISOString(),
      },
    ]
  }
  const notes: Record<OrderStatus, { note: string; location?: string }> = {
    placed: { note: 'Order placed successfully' },
    confirmed: { note: 'Seller confirmed the order', location: 'Seller Warehouse' },
    packed: { note: 'Items packed & invoiced', location: 'Dispatch Hub' },
    shipped: { note: 'Shipped via BuildMart Logistics', location: 'In Transit' },
    out_for_delivery: { note: 'Out for delivery', location: 'Local Hub' },
    delivered: { note: 'Delivered — thank you!', location: 'Delivery Address' },
    cancelled: { note: 'Cancelled' },
  }
  const upto = ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1)
  return upto.map((s, i) => ({
    status: s,
    note: notes[s].note,
    location: notes[s].location,
    timestamp: new Date(new Date(baseISO).getTime() + i * 6 * 3600_000).toISOString(),
  }))
}

interface OrderSeed {
  id: string
  code: string
  buyerId: string
  placedByAdminId?: string
  items: [string, number][]
  status: OrderStatus
  addressFromUser: string
  method: Order['payment']['method']
  paymentStatus: Order['payment']['status']
  couponCode?: string
  daysAgo: number
}

const seeds: OrderSeed[] = [
  {
    id: 'o_1',
    code: 'BM-10231',
    buyerId: 'u_buyer',
    items: [
      ['p_cement_acc_opc53', 50],
      ['p_steel_tata_fe550_12', 2],
    ],
    status: 'delivered',
    addressFromUser: 'u_buyer',
    method: 'upi',
    paymentStatus: 'paid',
    daysAgo: 18,
  },
  {
    id: 'o_2',
    code: 'BM-10242',
    buyerId: 'u_buyer',
    items: [['p_tile_vitrified', 30]],
    status: 'out_for_delivery',
    addressFromUser: 'u_buyer',
    method: 'card',
    paymentStatus: 'paid',
    couponCode: 'FIRST10',
    daysAgo: 3,
  },
  {
    id: 'o_3',
    code: 'BM-10255',
    buyerId: 'u_buyer2',
    items: [
      ['p_paint_apex', 4],
      ['p_paint_primer', 2],
    ],
    status: 'shipped',
    addressFromUser: 'u_buyer2',
    method: 'upi',
    paymentStatus: 'paid',
    daysAgo: 4,
  },
  {
    id: 'o_4',
    code: 'BM-10268',
    buyerId: 'u_buyer3',
    items: [['p_brick_red', 5000]],
    status: 'packed',
    addressFromUser: 'u_buyer3',
    method: 'cod',
    paymentStatus: 'pending',
    daysAgo: 2,
  },
  {
    id: 'o_5',
    code: 'BM-10279',
    buyerId: 'u_buyer',
    placedByAdminId: 'u_admin',
    items: [
      ['p_agg_msand', 10],
      ['p_cement_acc_ppc', 40],
    ],
    status: 'confirmed',
    addressFromUser: 'u_buyer',
    method: 'credit',
    paymentStatus: 'pending',
    daysAgo: 1,
  },
  {
    id: 'o_6',
    code: 'BM-10288',
    buyerId: 'u_buyer4',
    items: [['p_elec_wire', 5]],
    status: 'placed',
    addressFromUser: 'u_buyer4',
    method: 'upi',
    paymentStatus: 'paid',
    daysAgo: 0,
  },
  {
    id: 'o_7',
    code: 'BM-10291',
    buyerId: 'u_amit',
    items: [
      ['p_plumb_cpvc', 20],
      ['p_plumb_fittings', 4],
    ],
    status: 'delivered',
    addressFromUser: 'u_amit',
    method: 'card',
    paymentStatus: 'paid',
    daysAgo: 25,
  },
  {
    id: 'o_8',
    code: 'BM-10303',
    buyerId: 'u_buyer2',
    items: [['p_steel_jsw_16', 3]],
    status: 'cancelled',
    addressFromUser: 'u_buyer2',
    method: 'upi',
    paymentStatus: 'refunded',
    daysAgo: 9,
  },
  {
    id: 'o_9',
    code: 'BM-10314',
    buyerId: 'u_buyer3',
    items: [
      ['p_tile_wall', 12],
      ['p_tile_anti_skid', 8],
    ],
    status: 'delivered',
    addressFromUser: 'u_buyer3',
    method: 'upi',
    paymentStatus: 'paid',
    couponCode: 'TILE5',
    daysAgo: 30,
  },
  {
    id: 'o_10',
    code: 'BM-10325',
    buyerId: 'u_buyer',
    items: [['p_paint_royale', 6]],
    status: 'shipped',
    addressFromUser: 'u_buyer',
    method: 'card',
    paymentStatus: 'paid',
    daysAgo: 5,
  },
  {
    id: 'o_11',
    code: 'BM-10336',
    buyerId: 'u_buyer4',
    placedByAdminId: 'u_admin',
    items: [['p_plumb_tank', 2]],
    status: 'confirmed',
    addressFromUser: 'u_buyer4',
    method: 'credit',
    paymentStatus: 'pending',
    daysAgo: 1,
  },
  {
    id: 'o_12',
    code: 'BM-10347',
    buyerId: 'u_buyer2',
    items: [
      ['p_cement_ultratech_opc', 60],
      ['p_agg_20mm', 8],
    ],
    status: 'out_for_delivery',
    addressFromUser: 'u_buyer2',
    method: 'upi',
    paymentStatus: 'paid',
    daysAgo: 2,
  },
  {
    id: 'o_13',
    code: 'BM-10358',
    buyerId: 'u_buyer3',
    items: [['p_elec_switch', 100]],
    status: 'delivered',
    addressFromUser: 'u_buyer3',
    method: 'cod',
    paymentStatus: 'paid',
    daysAgo: 14,
  },
  {
    id: 'o_14',
    code: 'BM-10369',
    buyerId: 'u_amit',
    items: [['p_brick_aac', 800]],
    status: 'placed',
    addressFromUser: 'u_amit',
    method: 'upi',
    paymentStatus: 'paid',
    daysAgo: 0,
  },
  {
    id: 'o_15',
    code: 'BM-10370',
    buyerId: 'u_buyer',
    items: [
      ['p_paint_putty', 10],
      ['p_paint_primer', 3],
    ],
    status: 'packed',
    addressFromUser: 'u_buyer',
    method: 'card',
    paymentStatus: 'paid',
    daysAgo: 1,
  },
]

const GST_RATE = 0.18
const SHIPPING_FLAT = 250

function buildOrder(s: OrderSeed): Order {
  const items = s.items.map(([id, qty]) => itemFor(id, qty))
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = s.couponCode
    ? Math.round(subtotal * (s.couponCode === 'FIRST10' ? 0.1 : 0.05))
    : 0
  const taxable = subtotal - discount
  const gst = Math.round(taxable * GST_RATE)
  const shipping = subtotal > 50000 ? 0 : SHIPPING_FLAT
  const total = taxable + gst + shipping
  const buyer = users.find((u) => u.id === s.buyerId)!
  const fromUser = users.find((u) => u.id === s.addressFromUser)!
  const address = fromUser.addresses.find((a) => a.isDefault) ??
    fromUser.addresses[0] ?? {
      id: 'addr_fallback',
      label: 'Default',
      line1: '—',
      city: '—',
      state: '—',
      pincode: '000000',
      isDefault: true,
    }
  const base = new Date()
  base.setDate(base.getDate() - s.daysAgo)
  const baseISO = base.toISOString()
  const expected = new Date(base.getTime() + 5 * 86400_000).toISOString()

  return {
    id: s.id,
    code: s.code,
    buyerId: buyer.id,
    placedByAdminId: s.placedByAdminId,
    items,
    status: s.status,
    tracking: trackingFor(s.status, baseISO),
    address,
    payment: {
      id: `pay_${s.id}`,
      method: s.method,
      status: s.paymentStatus,
      amount: total,
      transactionRef: `TXN${s.code.replace('BM-', '')}`,
      paidAt: s.paymentStatus === 'paid' ? baseISO : undefined,
    },
    subtotal,
    discount,
    gst,
    shipping,
    total,
    couponCode: s.couponCode,
    createdAt: baseISO,
    expectedDelivery: expected,
  }
}

export const orders: Order[] = seeds.map(buildOrder)
