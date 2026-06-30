import type {
  AppNotification,
  Coupon,
  Inventory,
  Quotation,
  Warehouse,
} from '@/types'
import { products } from './products'

export const coupons: Coupon[] = [
  {
    id: 'cp_first10',
    code: 'FIRST10',
    type: 'percent',
    value: 10,
    minOrder: 2000,
    maxDiscount: 5000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    id: 'cp_tile5',
    code: 'TILE5',
    type: 'percent',
    value: 5,
    minOrder: 1000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    id: 'cp_flat500',
    code: 'BUILD500',
    type: 'flat',
    value: 500,
    minOrder: 10000,
    active: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    id: 'cp_expired',
    code: 'MONSOON20',
    type: 'percent',
    value: 20,
    minOrder: 5000,
    maxDiscount: 3000,
    active: false,
    expiresAt: '2025-09-30T23:59:59.000Z',
  },
]

export const warehouses: Warehouse[] = [
  { id: 'wh_acc_ggn', name: 'ACC Gurugram Depot', city: 'Gurugram', state: 'Haryana', sellerProfileId: 'sp_acc' },
  { id: 'wh_tata_jsr', name: 'Tata Jamshedpur Yard', city: 'Jamshedpur', state: 'Jharkhand', sellerProfileId: 'sp_tata' },
  { id: 'wh_buildhub_chd', name: 'BuildHub Chandigarh', city: 'Chandigarh', state: 'Punjab', sellerProfileId: 'sp_buildhub' },
  { id: 'wh_asian_mum', name: 'Asian Paints Mumbai', city: 'Mumbai', state: 'Maharashtra', sellerProfileId: 'sp_asian' },
  { id: 'wh_kajaria_noida', name: 'Kajaria Noida Hub', city: 'Noida', state: 'Uttar Pradesh', sellerProfileId: 'sp_kajaria' },
]

// One inventory row per product, mapped to its seller's primary warehouse.
const warehouseBySeller: Record<string, string> = {
  sp_acc: 'wh_acc_ggn',
  sp_tata: 'wh_tata_jsr',
  sp_buildhub: 'wh_buildhub_chd',
  sp_asian: 'wh_asian_mum',
  sp_kajaria: 'wh_kajaria_noida',
}

export const inventory: Inventory[] = products.map((p, i) => ({
  id: `inv_${p.id}`,
  productId: p.id,
  warehouseId: warehouseBySeller[p.sellerProfileId],
  quantity: p.stock,
  reorderLevel: [15, 20, 25, 50][i % 4],
}))

export const quotations: Quotation[] = [
  {
    id: 'q_1',
    code: 'RFQ-2041',
    buyerId: 'u_buyer',
    sellerProfileId: 'sp_tata',
    items: [
      { productId: 'p_steel_tata_fe550_12', name: 'Tata Tiscon Fe-550 TMT Bar 12mm', quantity: 25, unit: 'ton' },
    ],
    note: 'Bulk requirement for a 12-storey project. Need best rate + GST invoice.',
    status: 'quoted',
    quotedPrice: 1420000,
    createdAt: '2024-06-14T08:00:00.000Z',
  },
  {
    id: 'q_2',
    code: 'RFQ-2042',
    buyerId: 'u_buyer3',
    sellerProfileId: 'sp_acc',
    items: [
      { productId: 'p_cement_acc_opc53', name: 'ACC Gold OPC 53 Grade Cement', quantity: 500, unit: 'bag' },
    ],
    note: 'Monthly supply contract enquiry.',
    status: 'open',
    createdAt: '2024-06-20T08:00:00.000Z',
  },
  {
    id: 'q_3',
    code: 'RFQ-2043',
    buyerId: 'u_buyer2',
    sellerProfileId: 'sp_kajaria',
    items: [
      { productId: 'p_tile_vitrified', name: 'Kajaria Vitrified Floor Tile 600x600', quantity: 200, unit: 'box' },
    ],
    note: 'Villa project, need matching dye-lot.',
    status: 'accepted',
    quotedPrice: 132000,
    createdAt: '2024-06-10T08:00:00.000Z',
  },
]

export const notifications: AppNotification[] = [
  {
    id: 'n_1',
    userId: 'u_buyer',
    kind: 'order',
    title: 'Order out for delivery',
    body: 'BM-10242 is out for delivery and arriving today.',
    link: '/orders/o_2',
    read: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'n_2',
    userId: 'u_admin',
    kind: 'stock',
    title: 'Low stock alert',
    body: 'Ambuja Cool White Cement is below reorder level (15 left).',
    link: '/erp/inventory',
    read: false,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 'n_3',
    userId: 'u_admin',
    kind: 'order',
    title: 'New order placed',
    body: 'BM-10288 placed by Deepak Yadav — ₹10,750.',
    link: '/erp/orders',
    read: true,
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: 'n_4',
    userId: 'u_buyer',
    kind: 'chat',
    title: 'New message',
    body: 'Tata Steel Depot replied to your enquiry.',
    link: '/chat',
    read: false,
    createdAt: new Date(Date.now() - 5400_000).toISOString(),
  },
]
