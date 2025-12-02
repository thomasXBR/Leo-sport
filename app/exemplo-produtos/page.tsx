'use client';

import React, { useState } from 'react';
import { ProductCheckout } from '@/components/ProductCheckout';

/**
 * Exemplo de Implementação - Página de Produtos
 * 
 * Este componente demonstra como usar a integração Mercado Pago
 * em uma página real com produtos e opções de pagamento.
 */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'premium-yearly',
    name: 'Plano Premium - Anual',
    description: '12 meses de acesso completo com suporte prioritário',
    price: 299.99,
    image: 'https://via.placeholder.com/300x200?text=Premium+Plan',
  },
  {
    id: 'professional-yearly',
    name: 'Plano Profissional - Anual',
    description: '12 meses com recursos avançados e API access',
    price: 599.99,
    image: 'https://via.placeholder.com/300x200?text=Professional+Plan',
  },
  {
    id: 'enterprise-yearly',
    name: 'Plano Enterprise - Anual',
    description: 'Suporte dedicado, SLA e customizações',
    price: 1299.99,
    image: 'https://via.placeholder.com/300x200?text=Enterprise+Plan',
  },
];

export default function ProductsPage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [integrationType, setIntegrationType] = useState<'web' | 'mobile'>('web');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId);

  const handleSuccess = (preferenceId: string) => {
    setSuccessMessage(
      `Preferência criada com sucesso! ID: ${preferenceId}`
    );
    // Aqui você pode salvar o preferenceId no banco de dados
    console.log('Preferência criada:', preferenceId);
  };

  const handleError = (error: string) => {
    setErrorMessage(`Erro: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos Planos
          </h1>
          <p className="text-lg text-gray-600">
            Escolha o plano perfeito para suas necessidades
          </p>
        </div>

        {/* Mensagens */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de Produtos */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer ${
                    selectedProductId === product.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <button
                        className={`px-4 py-2 rounded ${
                          selectedProductId === product.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedProductId === product.id
                          ? '✓ Selecionado'
                          : 'Selecionar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna de Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">Checkout</h2>

              {!selectedProductId ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Selecione um plano para começar</p>
                </div>
              ) : (
                <>
                  {/* Informações do Cliente */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Nome:
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                    />

                    <label className="block text-sm font-medium mb-2">
                      Email:
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                    />

                    <label className="block text-sm font-medium mb-2">
                      Tipo de Integração:
                    </label>
                    <select
                      value={integrationType}
                      onChange={(e) =>
                        setIntegrationType(e.target.value as 'web' | 'mobile')
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="web">Web (Checkout Pro)</option>
                      <option value="mobile">Mobile (App)</option>
                    </select>
                  </div>

                  {/* Resumo do Pedido */}
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      Produto Selecionado:
                    </p>
                    <p className="font-bold mb-4">{selectedProduct?.name}</p>
                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>R$ {selectedProduct?.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          R$ {selectedProduct?.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Componente de Checkout */}
                  {customerEmail && selectedProduct && (
                    <ProductCheckout
                      productId={selectedProduct.id}
                      productName={selectedProduct.name}
                      productDescription={selectedProduct.description}
                      price={selectedProduct.price}
                      customerEmail={customerEmail}
                      customerName={customerName}
                      imageUrl={selectedProduct.image}
                      integrationType={integrationType}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  )}

                  {!customerEmail && (
                    <div className="text-center text-gray-500 text-sm">
                      <p>Preencha seus dados para continuar</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold mb-4">ℹ️ Informações sobre Pagamento</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ Pagamento seguro via Mercado Pago</li>
            <li>✓ Múltiplas opções de parcelamento</li>
            <li>✓ Pix, Boleto, Cartão de Crédito/Débito</li>
            <li>✓ Notificações em tempo real</li>
            <li>✓ Reembolso 100% garantido se necessário</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
