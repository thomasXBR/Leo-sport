/**
 * Componente para monitorar webhooks em tempo real
 * Exibe eventos recebidos e status das notificações
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface WebhookEvent {
  id: string;
  timestamp: string;
  eventType: string;
  paymentId: string;
  status: 'received' | 'processed' | 'failed';
  statusCode: number;
  message?: string;
}

interface WebhookStats {
  totalReceived: number;
  totalProcessed: number;
  totalFailed: number;
  lastEvent?: WebhookEvent;
  averageResponseTime: number;
}

export function WebhookMonitor() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    totalReceived: 0,
    totalProcessed: 0,
    totalFailed: 0,
    averageResponseTime: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  // Verificar saúde do webhook
  const checkWebhookHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/webhooks/test');
      const data = await response.json();
      setWebhookStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
    } catch {
      setWebhookStatus('unhealthy');
    }
  }, []);

  // Testar webhook
  const testWebhook = useCallback(async () => {
    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'payment.updated',
          paymentId: `test_${Date.now()}`,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        const newEvent: WebhookEvent = {
          id: `test_${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'payment.updated',
          paymentId: data.testNotification?.data?.id || 'test',
          status: 'received',
          statusCode: data.statusCode,
          message: data.message,
        };
        
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
        setStats(prev => ({
          ...prev,
          totalReceived: prev.totalReceived + 1,
          lastEvent: newEvent,
        }));
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
    }
  }, []);

  // Inicializar monitoramento
  useEffect(() => {
    checkWebhookHealth();
    setIsMonitoring(true);

    // Verificar saúde a cada 30 segundos
    const interval = setInterval(checkWebhookHealth, 30000);
    return () => clearInterval(interval);
  }, [checkWebhookHealth]);

  const statusColor = {
    healthy: 'text-green-600',
    unhealthy: 'text-red-600',
    checking: 'text-yellow-600',
  }[webhookStatus];

  const statusBg = {
    healthy: 'bg-green-50',
    unhealthy: 'bg-red-50',
    checking: 'bg-yellow-50',
  }[webhookStatus];

  return (
    <div className={`w-full ${statusBg} p-6 rounded-lg border-2`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">🔔 Monitor de Webhooks</h2>
          <p className="text-gray-600">Acompanhe eventos em tempo real do Mercado Pago</p>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full font-semibold ${statusColor}`}>
          {webhookStatus === 'checking' && '⏳ Verificando...'}
          {webhookStatus === 'healthy' && '✅ Webhook Ativo'}
          {webhookStatus === 'unhealthy' && '❌ Webhook Inativo'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded border">
          <div className="text-2xl font-bold text-blue-600">{stats.totalReceived}</div>
          <div className="text-sm text-gray-600">Notificações Recebidas</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-2xl font-bold text-green-600">{stats.totalProcessed}</div>
          <div className="text-sm text-gray-600">Processadas com Sucesso</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
          <div className="text-sm text-gray-600">Com Erro</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={checkWebhookHealth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🔍 Verificar Status
        </button>
        <button
          onClick={testWebhook}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          🧪 Enviar Notificação Teste
        </button>
      </div>

      {/* Events Log */}
      <div className="bg-white rounded border">
        <div className="p-4 border-b font-semibold">📋 Últimas Notificações</div>
        
        <div className="divide-y max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              Nenhuma notificação recebida ainda...
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-lg">{event.eventType}</div>
                    <div className="text-sm text-gray-600">ID: {event.paymentId}</div>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${
                    event.status === 'processed' ? 'bg-green-100 text-green-800' :
                    event.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status === 'processed' && '✅ Processado'}
                    {event.status === 'failed' && '❌ Erro'}
                    {event.status === 'received' && '📨 Recebido'}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString('pt-BR')}
                  {event.statusCode && ` • HTTP ${event.statusCode}`}
                </div>
                
                {event.message && (
                  <div className="mt-2 text-sm text-gray-700">{event.message}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clique em "Enviar Notificação Teste" para testar se o webhook está funcionando</li>
          <li>• As notificações aparecem aqui em tempo real</li>
          <li>• Em produção, use o Painel do Mercado Pago para monitorar eventos</li>
          <li>• O status do webhook é verificado a cada 30 segundos</li>
        </ul>
      </div>
    </div>
  );
}
