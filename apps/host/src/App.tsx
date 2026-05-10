import React, { Suspense, useState } from 'react';
import type { ProductSummary } from '@repo/types';
import { ErrorBoundary } from './components/ErrorBoundary';
import DevVitalsPanel from './components/DevVitalsPanel';

const ProductList = React.lazy(() => import('catalog/ProductList'));
const Header = React.lazy(() => import('catalog/Header'));
const CartIcon = React.lazy(() => import('cart/CartIcon'));
const CartDrawer = React.lazy(() => import('cart/CartDrawer'));
const AuthGuard = React.lazy(() => import('auth/AuthGuard'));
const UserMenu = React.lazy(() => import('auth/UserMenu'));

const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: '1',
    name: 'Apple',
    slug: 'apple',
    price: 1.99,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
  {
    id: '2',
    name: 'Banana',
    slug: 'banana',
    price: 0.99,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
  {
    id: '3',
    name: 'Orange',
    slug: 'orange',
    price: 2.49,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
];

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid #eee', background: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <ErrorBoundary name="catalog/Header" fallback={<strong>Scalable Commerce</strong>}>
          <Suspense fallback={<strong>Scalable Commerce</strong>}>
            <Header text="Scalable Commerce" />
          </Suspense>
        </ErrorBoundary>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ErrorBoundary name="auth/UserMenu">
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary name="cart/CartIcon" fallback={<span>Cart</span>}>
            <Suspense fallback={<span>Cart</span>}>
              <CartIcon onOpen={() => setCartOpen(true)} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </nav>

      <main style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <ErrorBoundary name="auth/AuthGuard">
          <Suspense fallback={<div>Loading…</div>}>
            <AuthGuard>
              <ErrorBoundary name="catalog/ProductList">
                <Suspense fallback={<div>Loading products…</div>}>
                  <ProductList products={MOCK_PRODUCTS} />
                </Suspense>
              </ErrorBoundary>
            </AuthGuard>
          </Suspense>
        </ErrorBoundary>
      </main>

      <ErrorBoundary name="cart/CartDrawer">
        <Suspense fallback={null}>
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </Suspense>
      </ErrorBoundary>

      {/* Dev-only: floating Web Vitals panel */}
      {import.meta.env.DEV && <DevVitalsPanel />}
    </div>
  );
}
