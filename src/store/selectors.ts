import { useStore } from './useStore'
import type { Product, Order } from '@/types'

/** The currently logged-in user (or null). */
export function useCurrentUser() {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
}

/** Resolve a product by id. */
export function useProduct(productId?: string): Product | undefined {
  return useStore((s) => s.products.find((p) => p.id === productId))
}

/** Seller profile lookup helper (non-hook). */
export function sellerName(sellerProfileId: string): string {
  const sp = useStore.getState().sellerProfiles.find((s) => s.id === sellerProfileId)
  return sp?.businessName ?? 'Unknown Seller'
}

/** Category name lookup helper (non-hook). */
export function categoryName(categoryId: string): string {
  const c = useStore.getState().categories.find((x) => x.id === categoryId)
  return c?.name ?? 'Uncategorised'
}

/** Orders that belong to a buyer. */
export function ordersForBuyer(buyerId: string): Order[] {
  return useStore.getState().orders.filter((o) => o.buyerId === buyerId)
}

/** Orders that contain at least one item from a seller. */
export function ordersForSeller(sellerProfileId: string): Order[] {
  return useStore
    .getState()
    .orders.filter((o) => o.items.some((i) => i.sellerProfileId === sellerProfileId))
}

/** Unread notification count for a user. */
export function useUnreadNotifications(userId?: string): number {
  return useStore((s) =>
    s.notifications.filter((n) => n.userId === userId && !n.read).length,
  )
}

/** Number of distinct items in cart. */
export function useCartCount(): number {
  return useStore((s) => s.cart.reduce((sum, c) => sum + c.quantity, 0))
}
