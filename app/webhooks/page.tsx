/**
 * Página de Monitoramento de Webhooks
 * Monitore eventos em tempo real do Mercado Pago
 */

'use client';

import React, { useState, useEffect } from 'react';
import { WebhookMonitor } from '@/components/WebhookMonitor';

interface WebhookTest {
  status: 'healthy' | 'unhealthy';
  url: string;
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
  tips?: string[];
}

export default function WebhooksPage() {
  const [testResult, setTestResult] = useState<WebhookTest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/webhooks/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔔 Webhooks</h1>
          <p className="text-lg text-gray-600">
            Configuração e monitoramento de notificações do Mercado Pago
          </p>
        </div>

        {/* Quick Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">⚡ Teste Rápido</h2>
          <button
            onClick={handleTestWebhook}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '⏳ Testando...' : '🧪 Testar Webhook'}
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              testResult.status === 'healthy'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {testResult.status === 'healthy' ? '✅' : '❌'}
                </span>
                <span className="font-semibold text-lg">
                  {testResult.status === 'healthy'
                    ? 'Webhook Ativo'
                    : 'Webhook Inativo'}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div>URL: {testResult.url}</div>
                <div>Tempo de resposta: {testResult.responseTime}ms</div>
                {testResult.statusCode && <div>Status HTTP: {testResult.statusCode}</div>}
                {testResult.error && <div className="text-red-700">Erro: {testResult.error}</div>}
              </div>
              {testResult.tips && testResult.tips.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="font-semibold mb-2">Dicas:</div>
                  <ul className="text-sm space-y-1">
                    {testResult.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monitor */}
        <div className="mb-8">
          <WebhookMonitor />
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📚 Documentação</h2>
          
          <div className="space-y-6">
            {/* O que são Webhooks */}
            <div>
              <h3 className="text-lg font-semibold mb-2">O que são Webhooks?</h3>
              <p className="text-gray-700 mb-4">
                Webhooks são notificações em tempo real enviadas pelo Mercado Pago para seu servidor
                sempre que ocorrem eventos importantes como pagamentos aprovados, rejeitados ou reembolsados.
              </p>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <strong>Benefícios:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>✅ Notificações instantâneas sobre mudanças de pagamento</li>
                  <li>✅ Atualização automática do banco de dados</li>
                  <li>✅ Não precisa fazer polling (consultar constantemente)</li>
                  <li>✅ Melhora experiência do usuário</li>
                </ul>
              </div>
            </div>

            {/* Configuração */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Como Configurar?</h3>
              <ol className="space-y-3 text-gray-700">
                <li>
                  <strong>1. Acessar Painel do Mercado Pago:</strong>
                  <div className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    https://www.mercadopago.com.br/developers/panel
                  </div>
                </li>
                <li>
                  <strong>2. Ir até Webhooks:</strong>
                  <div className="mt-1 text-sm">Procure por "Webhooks" ou "Notificações" no menu</div>
                </li>
                <li>
                  <strong>3. Adicionar URL:</strong>
                  <div className="mt-1 text-sm bg-gray-50 p-3 rounded font-mono">
                    https://leo-sport-git-main-thomasxbrs-projects.vercel.app/api/payments/webhook
                  </div>
                </li>
                <li>
                  <strong>4. Selecionar Eventos:</strong>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>✅ payment.created - Um novo pagamento foi criado</div>
                    <div>✅ payment.updated - Um pagamento foi atualizado</div>
                  </div>
                </li>
                <li>
                  <strong>5. Salvar:</strong>
                  <div className="mt-1 text-sm">Clique em Salvar e pronto!</div>
                </li>
              </ol>
            </div>

            {/* Eventos */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Eventos Suportados</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <strong className="text-green-700">payment.created</strong>
                  <p className="text-sm text-gray-600">Um novo pagamento foi iniciado</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <strong className="text-blue-700">payment.updated</strong>
                  <p className="text-sm text-gray-600">Um pagamento foi atualizado (aprovado, rejeitado, etc)</p>
                </div>
              </div>
            </div>

            {/* Status de Pagamento */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Status de Pagamento</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <strong className="text-yellow-700">pending</strong>
                  <p>Aguardando confirmação</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <strong className="text-green-700">approved</strong>
                  <p>Pagamento aprovado</p>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <strong className="text-red-700">rejected</strong>
                  <p>Pagamento rejeitado</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <strong className="text-orange-700">refunded</strong>
                  <p>Pagamento reembolsado</p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Resolvendo Problemas</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-orange-700">❌ Webhook não está recebendo</strong>
                  <ol className="mt-1 ml-4 list-decimal space-y-1">
                    <li>Verifique se servidor está rodando</li>
                    <li>Clique em "Testar Webhook" acima</li>
                    <li>Verifique URL no Painel do Mercado Pago</li>
                    <li>Use HTTPS em produção</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-orange-700">❌ Dados não estão atualizando</strong>
                  <ol className="mt-1 ml-4 list-decimal space-y-1">
                    <li>Verifique logs do servidor</li>
                    <li>Verifique se tabela de vendas existe</li>
                    <li>Verifique permissões do Supabase</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commands Reference */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">🔧 Comandos Úteis</h3>
          <div className="space-y-2">
            <div>
              <span className="text-green-400"># Verificar configuração</span>
              <div className="bg-gray-800 p-2 rounded mt-1">npm run webhook:setup -- --check</div>
            </div>
            <div>
              <span className="text-green-400"># Gerar novo token</span>
              <div className="bg-gray-800 p-2 rounded mt-1">npm run webhook:setup -- --generate-token</div>
            </div>
            <div>
              <span className="text-green-400"># Testar webhook</span>
              <div className="bg-gray-800 p-2 rounded mt-1">npm run webhook:setup -- --test</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
