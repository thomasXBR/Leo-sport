'use client';

import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admindash');

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          {!isAdminPage && (
            <>
              <CouponCarousel />
              <Header />
            </>
          )}
          <main className="flex-1 overflow-x-hidden" style={{ paddingTop: isAdminPage ? '0' : '104px' }}>
            {children}
          </main>
          {!isAdminPage && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}