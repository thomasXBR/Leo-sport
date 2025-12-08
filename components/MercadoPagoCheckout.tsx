'use client';

import React, { useState } from 'react';
import { useMercadoPago } from '@/hooks/useMercadoPago';

interface MercadoPagoCheckoutProps {
  orderId: string;
  customerEmail: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    description?: string;
  }>;
  onError?: (error: string) => void;
  onSuccess?: (preferenceId: string) => void;
}

export function MercadoPagoCheckout({
  orderId,
  customerEmail,
  items,
  onError,
  onSuccess,
}: MercadoPagoCheckoutProps) {
  const { createPreference, loading, error } = useMercadoPago();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const totalAmount = items.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0
      );

      const preference = await createPreference({
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'BRL',
        })),
        payer: {
          email: customerEmail,
        },
        external_reference: orderId,
        statement_descriptor: 'LEOSPORT',
        metadata: {
          order_id: orderId,
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
        },
      });

      // Usar init_point sempre que disponível (produção ou teste)
      const checkoutUrl = preference?.init_point || preference?.sandbox_init_point;
      if (checkoutUrl) {
        onSuccess?.(preference.preference_id);
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não disponível');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar pagamento';
      onError?.(errorMessage);
      console.error('Erro no checkout:', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  return (
    <div className="w-full max-w-md mx-auto p-6 border border-gray-200 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>

      {/* Items */}
      <div className="mb-4 border-b pb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between mb-2">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
            </div>
            <p className="font-medium">
              R$ {(item.unit_price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between mb-6">
        <p className="text-lg font-bold">Total:</p>
        <p className="text-lg font-bold">R$ {total.toFixed(2)}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || isProcessing}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading || isProcessing ? (
          <span className="flex items-center justify-center">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Processando...
          </span>
        ) : (
          'Ir para Checkout'
        )}
      </button>

      <p className="text-sm text-gray-600 text-center mt-4">
        Você será redirecionado para o Mercado Pago
      </p>
    </div>
  );
}
