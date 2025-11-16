'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CouponCarousel from '@/components/layout/CouponCarousel';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          <CouponCarousel />
          <Header />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}