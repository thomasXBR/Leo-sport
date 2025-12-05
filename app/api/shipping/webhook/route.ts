import { NextRequest, NextResponse } from 'next/server';
import { 
  validateWebhookSignature, 
  MelhorEnvioWebhookEvent, 
  getShippingById,
  isShippingPaid,
  isShippingShipped,
  isShippingDelivered,
  isShippingCancelled,
} from '@/lib/melhorEnvioClient';
import { supabase } from '@/lib/supabase';

/**
 * API Route para receber webhooks do Melhor Envio
 * POST /api/shipping/webhook
 * 
 * O Melhor Envio enviará notificações sobre mudanças de status de envios
 * 
 * Eventos suportados:
 * - order.created: Envio criado
 * - order.paid: Envio pago
 * - order.cancelled: Envio cancelado
 * - order.shipped: Envio enviado
 * - order.delivered: Envio entregue
 * - order.returned: Envio retornado
 */

const WEBHOOK_LOG_ENABLED = process.env.WEBHOOK_LOG_ENABLED !== 'false';

/**
 * Mapear status do Melhor Envio para status do sistema
 */
function mapShippingStatusToOrderStatus(shippingStatus: string): string {
  switch (shippingStatus) {
    case 'paid':
    case 'released':
      return 'Em Processamento';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregue';
    case 'cancelled':
      return 'Cancelado';
    case 'returned':
      return 'Em Processamento';
    default:
      return 'Em Processamento';
  }
}

export async function POST(request: NextRequest) {
  const requestId = `webhook_me_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const receivedAt = new Date().toISOString();

  try {
    // Ler o corpo da requisição como texto para validação da assinatura
    const bodyText = await request.text();
    const body = JSON.parse(bodyText) as MelhorEnvioWebhookEvent;

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook Melhor Envio] Recebido:', {
        requestId,
        receivedAt,
        event: body.event,
      });
    }

    // Validar assinatura do webhook
    const signature = request.headers.get('x-me-signature') || '';
    if (!validateWebhookSignature(signature, bodyText)) {
      console.error('[Webhook Melhor Envio] Assinatura inválida:', {
        requestId,
        hasSignature: !!signature,
      });
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    // Validar estrutura da notificação
    if (!body.event || !body.data || !body.data.id) {
      console.error('[Webhook] Notificação inválida:', body);
      return NextResponse.json(
        { error: 'Notificação inválida' },
        { status: 400 }
      );
    }

    const event = body.event;
    const shippingId = body.data.id;
    const shippingStatus = body.data.status || '';

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook Melhor Envio] Processando:', {
        requestId,
        event,
        shipping_id: shippingId,
        status: shippingStatus,
      });
    }

    // Buscar dados completos do envio se necessário
    let shippingData = body.data;
    try {
      const fullShippingData = await getShippingById(shippingId);
      if (fullShippingData) {
        shippingData = { ...shippingData, ...fullShippingData };
      }
    } catch (error) {
      console.warn('[Webhook] Não foi possível buscar dados completos do envio:', {
        requestId,
        shippingId,
        error,
      });
      // Continuar com os dados do webhook
    }

    // Processar evento baseado no tipo
    switch (event) {
      case 'order.created':
        await handleOrderCreated(shippingId, shippingData, requestId);
        break;
      case 'order.paid':
        await handleOrderPaid(shippingId, shippingData, requestId);
        break;
      case 'order.cancelled':
        await handleOrderCancelled(shippingId, shippingData, requestId);
        break;
      case 'order.shipped':
        await handleOrderShipped(shippingId, shippingData, requestId);
        break;
      case 'order.delivered':
        await handleOrderDelivered(shippingId, shippingData, requestId);
        break;
      case 'order.returned':
        await handleOrderReturned(shippingId, shippingData, requestId);
        break;
      default:
        if (WEBHOOK_LOG_ENABLED) {
          console.log('[Webhook] Evento não processado:', {
            requestId,
            event,
          });
        }
    }

    // Sempre retornar 200 para o Melhor Envio para evitar reenvios
    return NextResponse.json({ 
      received: true,
      requestId,
      processed: true,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar webhook:', {
      requestId,
      error: error.message,
      stack: error.stack,
    });
    
    // Sempre retornar 200 para evitar que o Melhor Envio fique reenviando
    // O erro foi logado para investigação
    return NextResponse.json(
      { 
        received: true, 
        requestId,
        error: error.message 
      },
      { status: 200 }
    );
  }
}

/**
 * Handler para evento order.created
 */
async function handleOrderCreated(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio criado:', { requestId, shippingId });
  }
  
  // Atualizar status do pedido no banco de dados
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_protocol: shippingData.protocol,
    shipping_status: shippingData.status || 'created',
  }, requestId);
}

/**
 * Handler para evento order.paid
 */
async function handleOrderPaid(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio pago:', { requestId, shippingId });
  }
  
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_status: 'paid',
    shipping_protocol: shippingData.protocol,
  }, requestId);
}

/**
 * Handler para evento order.cancelled
 */
async function handleOrderCancelled(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio cancelado:', { requestId, shippingId });
  }
  
  await updateOrderShippingStatus(shippingId, 'Cancelado', {
    shipping_id: shippingId,
    shipping_status: 'cancelled',
  }, requestId);
}

/**
 * Handler para evento order.shipped
 */
async function handleOrderShipped(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio enviado:', { requestId, shippingId });
  }
  
  await updateOrderShippingStatus(shippingId, 'Enviado', {
    shipping_id: shippingId,
    shipping_status: 'shipped',
    tracking_code: shippingData.tracking || shippingData.protocol,
  }, requestId);
}

/**
 * Handler para evento order.delivered
 */
async function handleOrderDelivered(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio entregue:', { requestId, shippingId });
  }
  
  await updateOrderShippingStatus(shippingId, 'Entregue', {
    shipping_id: shippingId,
    shipping_status: 'delivered',
    tracking_code: shippingData.tracking || shippingData.protocol,
  }, requestId);
}

/**
 * Handler para evento order.returned
 */
async function handleOrderReturned(shippingId: string, shippingData: any, requestId: string) {
  if (WEBHOOK_LOG_ENABLED) {
    console.log('[Webhook] Envio retornado:', { requestId, shippingId });
  }
  
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_status: 'returned',
  }, requestId);
}

/**
 * Atualizar status do envio no pedido
 */
async function updateOrderShippingStatus(
  shippingId: string,
  orderStatus: string,
  shippingInfo: {
    shipping_id?: string;
    shipping_status?: string;
    shipping_protocol?: string;
    tracking_code?: string;
  },
  requestId: string
) {
  try {
    // Buscar pedido pelo shipping_id ou shipping_protocol
    const searchConditions: string[] = [];
    if (shippingId) {
      searchConditions.push(`shipping_id.eq.${shippingId}`);
    }
    if (shippingInfo.shipping_protocol) {
      searchConditions.push(`shipping_protocol.eq.${shippingInfo.shipping_protocol}`);
    }

    if (searchConditions.length === 0) {
      console.warn('[Webhook] Nenhum critério de busca disponível:', {
        requestId,
        shippingId,
        shippingInfo,
      });
      return;
    }

    const { data: orders, error: searchError } = await supabase
      .from('sales')
      .select('id, order_number, status, shipping_id')
      .or(searchConditions.join(','))
      .limit(1);

    if (searchError) {
      console.error('[Webhook] Erro ao buscar pedido:', {
        requestId,
        error: searchError,
        shippingId,
      });
      return;
    }

    if (!orders || orders.length === 0) {
      if (WEBHOOK_LOG_ENABLED) {
        console.warn('[Webhook] Pedido não encontrado para shipping_id:', {
          requestId,
          shippingId,
          shipping_protocol: shippingInfo.shipping_protocol,
        });
      }
      return;
    }

    const order = orders[0];

    // Atualizar pedido
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Atualizar status apenas se mudou
    if (order.status !== orderStatus) {
      updateData.status = orderStatus;
    }

    // Adicionar informações de envio se disponíveis
    if (shippingInfo.shipping_id && order.shipping_id !== shippingInfo.shipping_id) {
      updateData.shipping_id = shippingInfo.shipping_id;
    }
    if (shippingInfo.shipping_status) {
      updateData.shipping_status = shippingInfo.shipping_status;
    }
    if (shippingInfo.shipping_protocol) {
      updateData.shipping_protocol = shippingInfo.shipping_protocol;
    }
    if (shippingInfo.tracking_code) {
      updateData.tracking_code = shippingInfo.tracking_code;
    }

    const { error: updateError } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('[Webhook] Erro ao atualizar pedido:', {
        requestId,
        error: updateError,
        order_id: order.id,
      });
    } else {
      if (WEBHOOK_LOG_ENABLED) {
        console.log('[Webhook] Pedido atualizado com sucesso:', {
          requestId,
          order_number: order.order_number,
          new_status: orderStatus,
        });
      }
    }
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar atualização do pedido:', {
      requestId,
      error: error.message,
      stack: error.stack,
    });
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Webhook do Melhor Envio',
      method: 'Use POST para receber notificações',
      endpoint: '/api/shipping/webhook',
    },
    { status: 405 }
  );
}


