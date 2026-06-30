import type { OrderStatus, PaymentStatus, QuotationStatus } from '@/types'

type Tone = 'gray' | 'amber' | 'green' | 'red' | 'blue' | 'purple'

export const orderStatusTone: Record<OrderStatus, Tone> = {
  placed: 'blue',
  confirmed: 'purple',
  packed: 'amber',
  shipped: 'amber',
  out_for_delivery: 'amber',
  delivered: 'green',
  cancelled: 'red',
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const paymentTone: Record<PaymentStatus, Tone> = {
  pending: 'amber',
  paid: 'green',
  refunded: 'blue',
  failed: 'red',
}

export const quotationTone: Record<QuotationStatus, Tone> = {
  open: 'blue',
  quoted: 'amber',
  accepted: 'green',
  rejected: 'red',
}
