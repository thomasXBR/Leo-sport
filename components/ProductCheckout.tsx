'use client';

import React, { useState } from 'react';
import { useMercadoPago, WebCheckoutParams } from '@/hooks/useMercadoPago';

interface ProductCheckoutProps {
  productId: string;
  productName: string;
  productDescription?: string;
  price: number;
  customerEmail: string;
  customerName?: string;
  imageUrl?: string;
  integrationType?: 'web' | 'mobile';
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
}

export function ProductCheckout({
  productId,
  productName,
  productDescription,
  price,
  customerEmail,
  customerName = 'Cliente',
  imageUrl,
  integrationType = 'web',
  onSuccess,
  onError,
}: ProductCheckoutProps) {
  const { createWebCheckout, createMobileCheckout, loading, error } =
    useMercadoPago();
  const [installments, setInstallments] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const orderId = `ORD-${productId}-${Date.now()}`;
      const items = [
        {
          id: productId,
          title: productName,
          description: productDescription || '',
          quantity: 1,
          unit_price: price,
          picture_url: imageUrl,
        },
      ];

      if (integrationType === 'web') {
        const preference = await createWebCheckout({
          items,
          payerEmail: customerEmail,
          orderId,
          payerName: customerName,
          installments,
        });

        // Usar init_point sempre que disponível (produção ou teste)
        const checkoutUrl = preference?.init_point || preference?.sandbox_init_point;
        if (checkoutUrl) {
          onSuccess?.(preference.preference_id);
          window.location.href = checkoutUrl;
        }
      } else {
        const preference = await createMobileCheckout({
          items,
          payerEmail: customerEmail,
          orderId,
          payerName: customerName,
          installments,
        });

        if (preference?.init_point) {
          onSuccess?.(preference.preference_id);
          window.location.href = preference.init_point;
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar pagamento';
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border border-gray-200 rounded-lg shadow-lg">
      {/* Imagem do Produto */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      {/* Detalhes do Produto */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{productName}</h2>
        {productDescription && (
          <p className="text-gray-600 text-sm mb-4">{productDescription}</p>
        )}

        {/* Preço */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p className="text-gray-600 text-sm mb-1">Preço:</p>
          <p className="text-3xl font-bold text-blue-600">
            R$ {price.toFixed(2)}
          </p>
        </div>

        {/* Seletor de Parcelamento */}
        {integrationType === 'web' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Parcelamento:
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {[1, 2, 3, 4, 6, 9, 12].map((num) => {
                const installmentPrice = price / num;
                return (
                  <option key={num} value={num}>
                    {num}x de R$ {installmentPrice.toFixed(2)}
                    {num > 1 && ' (com juros)'}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {(error || isProcessing) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || 'Processando...'}
        </div>
      )}

      {/* Botão de Checkout */}
      <button
        onClick={handleCheckout}
        disabled={loading || isProcessing}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
      >
        {loading || isProcessing ? (
          <span className="flex items-center justify-center">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Processando...
          </span>
        ) : (
          `Pagar com ${integrationType === 'web' ? 'Mercado Pago' : 'Mercado Pago'}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Você será redirecionado para o Mercado Pago para completar o pagamento
      </p>

      {/* Badges de Segurança */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center items-center space-x-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">🔒 Seguro</p>
          <p className="text-xs font-semibold">SSL Protegido</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">💳 Pagamento</p>
          <p className="text-xs font-semibold">Mercado Pago</p>
        </div>
      </div>
    </div>
  );
}
