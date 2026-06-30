import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/hooks/useTheme'
import { Toaster } from '@/components/ui/toast'

import { MarketplaceShell } from '@/components/layout/MarketplaceShell'
import { DashboardShell } from '@/components/layout/DashboardShell'

import Login from '@/pages/Login'
import Chat from '@/pages/Chat'

import Home from '@/pages/buyer/Home'
import Catalog from '@/pages/buyer/Catalog'
import ProductDetail from '@/pages/buyer/ProductDetail'
import Cart from '@/pages/buyer/Cart'
import Checkout from '@/pages/buyer/Checkout'
import Orders from '@/pages/buyer/Orders'
import OrderDetail from '@/pages/buyer/OrderDetail'
import Wishlist from '@/pages/buyer/Wishlist'
import Quotations from '@/pages/buyer/Quotations'
import Account from '@/pages/buyer/Account'

import ErpDashboard from '@/pages/erp/Dashboard'
import ErpProducts from '@/pages/erp/Products'
import ErpInventory from '@/pages/erp/Inventory'
import ErpOrders from '@/pages/erp/Orders'
import ErpQuotations from '@/pages/erp/Quotations'
import ErpCustomers from '@/pages/erp/Customers'
import ErpCoupons from '@/pages/erp/Coupons'

/** Scroll to top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const userId = useStore((s) => s.currentUserId)
  if (!userId) return <Navigate to="/login" replace />
  return children
}

function RequireErp({ children }: { children: JSX.Element }) {
  const userId = useStore((s) => s.currentUserId)
  const role = useStore((s) => s.activeRole)
  if (!userId) return <Navigate to="/login" replace />
  if (role !== 'admin' && role !== 'seller') return <Navigate to="/" replace />
  return children
}

export default function App() {
  useTheme() // initialise theme class on <html>

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Marketplace (buyer) */}
        <Route
          element={
            <RequireAuth>
              <MarketplaceShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* ERP (admin / seller) */}
        <Route
          path="/erp"
          element={
            <RequireErp>
              <DashboardShell />
            </RequireErp>
          }
        >
          <Route index element={<ErpDashboard />} />
          <Route path="products" element={<ErpProducts />} />
          <Route path="inventory" element={<ErpInventory />} />
          <Route path="orders" element={<ErpOrders />} />
          <Route path="quotations" element={<ErpQuotations />} />
          <Route path="customers" element={<ErpCustomers />} />
          <Route path="coupons" element={<ErpCoupons />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
