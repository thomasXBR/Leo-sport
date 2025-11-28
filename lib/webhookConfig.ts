/**
 * Configuração de Webhooks para Mercado Pago
 * Gerencia registros, validação e processamento de notificações
 */

export interface WebhookConfig {
  url: string;
  events: string[];
  secretToken: string;
  maxRetries: number;
  retryDelay: number;
  enabled: boolean;
}

export interface WebhookEvent {
  id: string;
  type: 'payment.created' | 'payment.updated' | 'payment.expired' | 'charge.created' | 'charge.updated';
  resource: {
    id: string;
    amount?: number;
    status?: string;
    currency_id?: string;
    external_reference?: string;
  };
  timestamp: string;
  received_at?: string;
}

export interface WebhookNotification {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  topic: string;
  resource: {
    id: string;
  };
  data?: {
    id: string;
  };
}

export interface WebhookLog {
  id: string;
  event_type: string;
  payment_id: string;
  status: 'received' | 'processed' | 'failed' | 'retry';
  http_status: number;
  request_body: Record<string, any>;
  response_body: Record<string, any>;
  error_message?: string;
  attempt: number;
  created_at: string;
  updated_at: string;
}

/**
 * Configuração padrão de webhooks
 */
export const defaultWebhookConfig: WebhookConfig = {
  url: process.env.MERCADO_PAGO_WEBHOOK_URL || 'http://localhost:3000/api/payments/webhook',
  events: (process.env.WEBHOOK_EVENTS || 'payment.created,payment.updated').split(','),
  secretToken: process.env.WEBHOOK_SECRET_TOKEN || 'dev_webhook_secret_token',
  maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '5000'),
  enabled: true,
};

/**
 * Tipos de eventos suportados pelo Mercado Pago
 */
export const SUPPORTED_WEBHOOK_EVENTS = {
  'payment.created': {
    description: 'Um novo pagamento foi criado',
    topic: 'payment',
  },
  'payment.updated': {
    description: 'Um pagamento foi atualizado (status, reembolso, etc)',
    topic: 'payment',
  },
  'payment.expired': {
    description: 'Um pagamento expirou',
    topic: 'payment',
  },
  'charge.created': {
    description: 'Uma cobrança foi criada (parcelamento)',
    topic: 'charge',
  },
  'charge.updated': {
    description: 'Uma cobrança foi atualizada',
    topic: 'charge',
  },
  'invoice.created': {
    description: 'Uma fatura foi criada',
    topic: 'invoice',
  },
  'invoice.updated': {
    description: 'Uma fatura foi atualizada',
    topic: 'invoice',
  },
};

/**
 * Mapear status de pagamento Mercado Pago para status do sistema
 */
export const PAYMENT_STATUS_MAP: Record<string, string> = {
  'pending': 'pending',
  'approved': 'approved',
  'authorized': 'authorized',
  'in_process': 'processing',
  'in_mediation': 'mediation',
  'rejected': 'rejected',
  'cancelled': 'cancelled',
  'refunded': 'refunded',
  'charged_back': 'chargeback',
};

/**
 * Validar se uma notificação é válida
 */
export function validateWebhookNotification(notification: any): boolean {
  // Verificar campos obrigatórios
  if (!notification || !notification.data || !notification.data.id) {
    return false;
  }

  // Verificar se tem type ou topic
  if (!notification.type && !notification.topic) {
    return false;
  }

  return true;
}

/**
 * Validar se um webhook é válido
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Apenas HTTPS em produção, HTTP em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return parsed.protocol === 'https:';
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Gerar token de segurança para webhook
 */
export function generateWebhookToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extrair informações relevantes da notificação
 */
export function extractPaymentInfo(notification: WebhookNotification) {
  const paymentId = notification.resource?.id || notification.data?.id;
  const topic = notification.topic || extractTopicFromType(notification.type);
  
  return {
    paymentId,
    topic,
    isLiveMode: notification.live_mode,
    userId: notification.user_id,
    dateCreated: notification.date_created,
  };
}

/**
 * Extrair tópico do tipo de notificação
 */
function extractTopicFromType(type: string): string {
  if (type.startsWith('payment.')) return 'payment';
  if (type.startsWith('charge.')) return 'charge';
  if (type.startsWith('invoice.')) return 'invoice';
  return 'unknown';
}

/**
 * Formatar URL do webhook para exibição
 */
export function formatWebhookUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

/**
 * Verificar saúde do webhook (teste de conectividade)
 */
export async function testWebhookHealth(webhookUrl: string, timeout: number = 5000): Promise<{
  healthy: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(webhookUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'MercadoPago-WebhookValidator/1.0',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return {
      healthy: response.status === 405 || response.status === 404 || response.status === 200,
      statusCode: response.status,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: false,
      responseTime,
      error: error.message || 'Erro ao conectar ao webhook',
    };
  }
}
