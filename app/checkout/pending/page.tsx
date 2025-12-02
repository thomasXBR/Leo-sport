'use client';

import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de Pendente */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
            <svg
              className="w-8 h-8 text-amber-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-amber-600 mb-2">
          Pagamento Pendente
        </h1>
        <p className="text-gray-600 mb-6">
          Seu pagamento está sendo processado. Isso pode levar alguns minutos.
        </p>

        {/* Informações */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 mb-3">
            <strong>⏳ Status:</strong> Aguardando confirmação
          </p>
          <p className="text-xs text-amber-700">
            Você receberá um email assim que o pagamento for confirmado.
          </p>
        </div>

        {/* O que Fazer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="font-semibold text-blue-800 mb-3">
            O que fazer agora:
          </p>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Não feche esta página</li>
            <li>✓ Aguarde a confirmação por email</li>
            <li>✓ Verifique sua caixa de spam</li>
            <li>✓ Seu acesso será liberado em breve</li>
          </ul>
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

        {/* Estimativa */}
        <div className="mt-6 pt-6 border-t text-sm text-gray-600">
          <p>
            <strong>Tempo estimado:</strong> 5 a 10 minutos para confirmação
          </p>
        </div>

        {/* Suporte */}
        <div className="mt-4">
          <p className="text-xs text-gray-500">
            Algo errado? Entre em contato com
            <a href="mailto:support@leosport.com" className="text-blue-600 hover:underline ml-1">
              nosso suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
