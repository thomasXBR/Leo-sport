'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProductRegistrationForm from '@/components/forms/ProductRegistrationForm';
import { Loader2 } from 'lucide-react';

export default function RegisterProductPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    );
  }

  // Show form to authenticated admin users
  if (user && profile?.user_type === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <ProductRegistrationForm
          onSuccess={() => {
            // Optionally handle success (e.g., show toast, redirect, etc.)
          }}
          onError={(error) => {
            // Optionally handle errors
            console.error('Product registration error:', error);
          }}
        />
      </div>
    );
  }

  // Show login message for non-authenticated users
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Você precisa fazer login como administrador para acessar esta página.</p>
          <button
            onClick={() => router.push('/inicio')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página. Apenas administradores podem registrar produtos.</p>
        <button
          onClick={() => router.push('/inicio')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Início
        </button>
      </div>
    </div>
  );
}
