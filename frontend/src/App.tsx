import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from '@/layout/app/AppShell'
import { RequireAuth } from '@/layout/app/RequireAuth'
import { PageTransition } from '@/components/motion/PageTransition'
import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ProductsPage = lazy(() => import('@/features/products/ProductsPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const SuppliersPage = lazy(() => import('@/features/suppliers/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('@/features/suppliers/SupplierDetailPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  // Coarse grouping: only the landing <-> app-shell boundary transitions here.
  // In-app navigation (dashboard/products/categories/suppliers) is already
  // handled per-route by AppShell's own PageTransition — keying on the exact
  // pathname here too would double-animate every in-app route change.
  const section = location.pathname === '/' ? 'landing' : 'app'

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={section}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="/products"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ProductsPage />
                </Suspense>
              }
            />
            <Route
              path="/categories"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <CategoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/suppliers"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SuppliersPage />
                </Suspense>
              }
            />
            <Route
              path="/suppliers/:id"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SupplierDetailPage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  )
}
