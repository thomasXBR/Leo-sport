'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}