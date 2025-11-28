'use client';

import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de Erro */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-red-600 mb-2">
          Pagamento Falhou
        </h1>
        <p className="text-gray-600 mb-6">
          Desculpe, não conseguimos processar seu pagamento. Tente novamente.
        </p>

        {/* Razões Comuns */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <p className="font-semibold text-yellow-800 mb-3">
            Possíveis razões:
          </p>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>✗ Saldo insuficiente no cartão</li>
            <li>✗ Dados do cartão incorretos</li>
            <li>✗ Cartão expirado</li>
            <li>✗ Limite de transações excedido</li>
            <li>✗ Cartão bloqueado pela instituição</li>
          </ul>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Verifique os dados do seu cartão e tente
            novamente. Se o problema persistir, entre em contato com seu banco.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3">
          <Link
            href="/exemplo-produtos"
            className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Tentar Novamente
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Voltar para Início
          </Link>
        </div>

        {/* Suporte */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Precisa de ajuda? Entre em contato com nosso
            <a href="mailto:support@leosport.com" className="text-blue-600 hover:underline ml-1">
              suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
