'use client';

import Header from '@/components/layout/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col overflow-x-hidden bg-gray-50">
          {/* Header sem CouponCarousel */}
          <Header />
          <main className="flex-1 overflow-x-hidden" style={{ paddingTop: '64px' }}>
            {children}
          </main>
          {/* Sem Footer */}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

