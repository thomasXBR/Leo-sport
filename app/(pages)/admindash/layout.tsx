'use client';

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
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          {/* Sem Footer, Header ou CouponCarousel */}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

