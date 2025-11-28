'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const preferenceId = searchParams.get('preference_id');
  const paymentId = searchParams.get('payment_id');
  const merchantOrderId = searchParams.get('merchant_order_id');
  
  const { getPaymentStatus, loading } = useMercadoPago();
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (paymentId) {
        try {
          const paymentData = await getPaymentStatus(paymentId);
          setPayment(paymentData);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    fetchPaymentStatus();
  }, [paymentId, getPaymentStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de Sucesso */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Pagamento Realizado!
        </h1>
        <p className="text-gray-600 mb-6">
          Obrigado por sua compra. Seu pedido foi processado com sucesso.
        </p>

        {/* Detalhes do Pagamento */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">ID do Pagamento</p>
              <p className="font-mono text-sm font-semibold break-all">
                {payment.id}
              </p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600 capitalize">
                {payment.status}
              </p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">Valor</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {payment.transaction_amount?.toFixed(2)}
              </p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">Método de Pagamento</p>
              <p className="font-semibold capitalize">
                {payment.payment_method_id}
              </p>
            </div>

            {payment.date_approved && (
              <div>
                <p className="text-sm text-gray-600">Data de Aprovação</p>
                <p className="font-semibold">
                  {new Date(payment.date_approved).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-gray-600 mb-6">
            <p>Carregando detalhes do pagamento...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Importante:</strong> Você receberá um email de confirmação
            com os detalhes do seu pedido. Verifique sua caixa de entrada ou spam.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Voltar para Início
          </Link>
          <Link
            href="/exemplo-produtos"
            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Ver Mais Produtos
          </Link>
        </div>

        {/* Reference IDs */}
        {(preferenceId || merchantOrderId) && (
          <div className="mt-6 pt-6 border-t text-xs text-gray-500">
            {preferenceId && (
              <p className="mb-1">Preference ID: {preferenceId}</p>
            )}
            {merchantOrderId && (
              <p>Order ID: {merchantOrderId}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
