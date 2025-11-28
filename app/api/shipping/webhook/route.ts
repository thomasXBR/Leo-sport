import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature, MelhorEnvioWebhookEvent, getShippingById } from '@/lib/melhorEnvioClient';
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
export async function POST(request: NextRequest) {
  try {
    // Ler o corpo da requisição como texto para validação da assinatura
    const bodyText = await request.text();
    const body = JSON.parse(bodyText) as MelhorEnvioWebhookEvent;

    // Validar assinatura do webhook
    const signature = request.headers.get('x-me-signature') || '';
    if (!validateWebhookSignature(signature, bodyText)) {
      console.error('[Webhook Melhor Envio] Assinatura inválida');
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    // Validar estrutura da notificação
    if (!body.event || !body.data || !body.data.id) {
      return NextResponse.json(
        { error: 'Notificação inválida' },
        { status: 400 }
      );
    }

    const event = body.event;
    const shippingId = body.data.id;
    const shippingStatus = body.data.status || '';

    console.log('[Webhook Melhor Envio]', {
      event,
      shipping_id: shippingId,
      status: shippingStatus,
    });

    // Buscar dados completos do envio se necessário
    let shippingData = body.data;
    try {
      const fullShippingData = await getShippingById(shippingId);
      if (fullShippingData) {
        shippingData = { ...shippingData, ...fullShippingData };
      }
    } catch (error) {
      console.warn('[Webhook] Não foi possível buscar dados completos do envio:', error);
      // Continuar com os dados do webhook
    }

    // Processar evento baseado no tipo
    switch (event) {
      case 'order.created':
        await handleOrderCreated(shippingId, shippingData);
        break;
      case 'order.paid':
        await handleOrderPaid(shippingId, shippingData);
        break;
      case 'order.cancelled':
        await handleOrderCancelled(shippingId, shippingData);
        break;
      case 'order.shipped':
        await handleOrderShipped(shippingId, shippingData);
        break;
      case 'order.delivered':
        await handleOrderDelivered(shippingId, shippingData);
        break;
      case 'order.returned':
        await handleOrderReturned(shippingId, shippingData);
        break;
      default:
        console.log('[Webhook] Evento não processado:', event);
    }

    // Sempre retornar 200 para o Melhor Envio para evitar reenvios
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    
    // Sempre retornar 200 para evitar que o Melhor Envio fique reenviando
    // O erro foi logado para investigação
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}

/**
 * Handler para evento order.created
 */
async function handleOrderCreated(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio criado:', shippingId);
  
  // Atualizar status do pedido no banco de dados
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_protocol: shippingData.protocol,
    shipping_status: shippingData.status || 'created',
  });
}

/**
 * Handler para evento order.paid
 */
async function handleOrderPaid(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio pago:', shippingId);
  
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_status: 'paid',
    shipping_protocol: shippingData.protocol,
  });
}

/**
 * Handler para evento order.cancelled
 */
async function handleOrderCancelled(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio cancelado:', shippingId);
  
  await updateOrderShippingStatus(shippingId, 'Cancelado', {
    shipping_id: shippingId,
    shipping_status: 'cancelled',
  });
}

/**
 * Handler para evento order.shipped
 */
async function handleOrderShipped(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio enviado:', shippingId);
  
  await updateOrderShippingStatus(shippingId, 'Enviado', {
    shipping_id: shippingId,
    shipping_status: 'shipped',
    tracking_code: shippingData.tracking || shippingData.protocol,
  });
}

/**
 * Handler para evento order.delivered
 */
async function handleOrderDelivered(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio entregue:', shippingId);
  
  await updateOrderShippingStatus(shippingId, 'Entregue', {
    shipping_id: shippingId,
    shipping_status: 'delivered',
    tracking_code: shippingData.tracking || shippingData.protocol,
  });
}

/**
 * Handler para evento order.returned
 */
async function handleOrderReturned(shippingId: string, shippingData: any) {
  console.log('[Webhook] Envio retornado:', shippingId);
  
  await updateOrderShippingStatus(shippingId, 'Em Processamento', {
    shipping_id: shippingId,
    shipping_status: 'returned',
  });
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
  }
) {
  try {
    // Buscar pedido pelo shipping_id
    // Assumindo que há uma coluna shipping_id na tabela sales
    const { data: orders, error: searchError } = await supabase
      .from('sales')
      .select('id, order_number')
      .or(`shipping_id.eq.${shippingId},shipping_protocol.eq.${shippingInfo.shipping_protocol}`)
      .limit(1);

    if (searchError) {
      console.error('[Webhook] Erro ao buscar pedido:', searchError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.warn('[Webhook] Pedido não encontrado para shipping_id:', shippingId);
      return;
    }

    const order = orders[0];

    // Atualizar pedido
    const updateData: any = {
      status: orderStatus,
      updated_at: new Date().toISOString(),
    };

    // Adicionar informações de envio se disponíveis
    if (shippingInfo.shipping_id) {
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
      console.error('[Webhook] Erro ao atualizar pedido:', updateError);
    } else {
      console.log('[Webhook] Pedido atualizado com sucesso:', order.order_number);
    }
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar atualização do pedido:', error);
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}

