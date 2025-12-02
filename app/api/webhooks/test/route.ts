import { NextRequest, NextResponse } from 'next/server';
import { testWebhookHealth, formatWebhookUrl, defaultWebhookConfig } from '@/lib/webhookConfig';

/**
 * API Route para gerenciar webhooks
 * GET  /api/webhooks/test     - Testar saúde do webhook
 * GET  /api/webhooks/config   - Obter configuração atual
 * POST /api/webhooks/test     - Enviar notificação de teste
 */

interface TestResult {
  status: 'healthy' | 'unhealthy';
  url: string;
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
  tips?: string[];
}

/**
 * GET /api/webhooks/test - Testar conectividade do webhook
 */
async function handleTest(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookUrl = defaultWebhookConfig.url;

    const result = await testWebhookHealth(webhookUrl);

    const testResult: TestResult = {
      status: result.healthy ? 'healthy' : 'unhealthy',
      url: formatWebhookUrl(webhookUrl),
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      error: result.error,
      timestamp: new Date().toISOString(),
      tips: generateTips(result.healthy, result.statusCode, result.error),
    };

    return NextResponse.json(testResult, {
      status: result.healthy ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/config - Obter configuração de webhooks
 */
async function handleConfig(): Promise<NextResponse> {
  const config = {
    url: defaultWebhookConfig.url,
    events: defaultWebhookConfig.events,
    enabled: defaultWebhookConfig.enabled,
    maxRetries: defaultWebhookConfig.maxRetries,
    retryDelay: defaultWebhookConfig.retryDelay,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(config);
}

/**
 * POST /api/webhooks/test - Enviar notificação de teste
 */
async function handleTestNotification(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { eventType = 'payment.updated', paymentId = '12345678' } = body;

    // Criar notificação de teste
    const testNotification = {
      id: `test_${Date.now()}`,
      live_mode: false,
      type: eventType,
      date_created: new Date().toISOString(),
      user_id: 0,
      topic: eventType.split('.')[0],
      resource: {
        id: paymentId,
      },
      data: {
        id: paymentId,
      },
    };

    // Enviar para o webhook
    const webhookUrl = defaultWebhookConfig.url;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago-WebhookValidator/1.0',
        'X-Webhook-Test': 'true',
      },
      body: JSON.stringify(testNotification),
    });

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      message: response.ok
        ? 'Notificação de teste enviada com sucesso'
        : 'Erro ao enviar notificação de teste',
      testNotification,
      response: responseBody,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

/**
 * Gerar dicas de solução de problemas
 */
function generateTips(
  healthy: boolean,
  statusCode?: number,
  error?: string
): string[] {
  const tips: string[] = [];

  if (!healthy) {
    if (!statusCode || statusCode >= 500) {
      tips.push('Verifique se o servidor está rodando');
      tips.push('Verifique a variável NEXT_PUBLIC_APP_URL em .env');
      tips.push('Tente: npm run dev');
    }

    if (statusCode === 404) {
      tips.push('URL do webhook não encontrada');
      tips.push('Verifique se a rota /api/payments/webhook existe');
    }

    if (statusCode === 403) {
      tips.push('Acesso proibido ao webhook');
      tips.push('Verifique se há validação de token bloqueando requisições');
    }

    if (error && error.includes('ECONNREFUSED')) {
      tips.push('Conexão recusada - servidor não está respondendo');
      tips.push('Em produção, use HTTPS');
    }

    if (error && error.includes('ETIMEDOUT')) {
      tips.push('Timeout na conexão - servidor demorando muito');
      tips.push('Verifique a performance do servidor');
    }
  } else {
    tips.push('✓ Webhook está acessível');
    tips.push('✓ Aguardando notificações do Mercado Pago');
  }

  return tips;
}

/**
 * Router principal
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'config') {
    return handleConfig();
  }

  // Padrão: test
  return handleTest(request);
}

export async function POST(request: NextRequest) {
  return handleTestNotification(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
