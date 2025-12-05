import { NextRequest, NextResponse } from 'next/server';
import { 
  validateWebhookNotification, 
  getPaymentById,
  isPaymentApproved,
  isPaymentPending,
  isPaymentRejected,
  isPaymentCancelled,
  isPaymentRefunded,
} from '@/lib/mercadoPagoClient';
import { supabase } from '@/lib/supabase';

/**
 * API Route para receber webhooks do Mercado Pago
 * POST /api/payments/webhook
 * 
 * Eventos suportados:
 * - payment.created: Um novo pagamento foi criado
 * - payment.updated: Um pagamento foi atualizado (status, reembolso, etc)
 * 
 * Status de Pagamento:
 * - pending: Aguardando confirmação
 * - approved: Aprovado
 * - rejected: Rejeitado
 * - refunded: Reembolsado
 * - cancelled: Cancelado
 * - in_process: Em processamento
 * - in_mediation: Em mediação
 * - charged_back: Chargeback
 */

const WEBHOOK_LOG_ENABLED = process.env.WEBHOOK_LOG_ENABLED !== 'false';

/**
 * Mapear status do Mercado Pago para status do sistema
 */
function mapPaymentStatusToOrderStatus(paymentStatus: string): {
  orderStatus: string;
  paymentStatusDB: string;
} {
  switch (paymentStatus) {
    case 'approved':
      return { orderStatus: 'Pago', paymentStatusDB: 'approved' };
    case 'pending':
      return { orderStatus: 'Pendente', paymentStatusDB: 'pending' };
    case 'in_process':
      return { orderStatus: 'Pendente', paymentStatusDB: 'processing' };
    case 'in_mediation':
      return { orderStatus: 'Pendente', paymentStatusDB: 'mediation' };
    case 'rejected':
      return { orderStatus: 'Pendente', paymentStatusDB: 'rejected' };
    case 'cancelled':
      return { orderStatus: 'Cancelado', paymentStatusDB: 'cancelled' };
    case 'refunded':
      return { orderStatus: 'Cancelado', paymentStatusDB: 'refunded' };
    case 'charged_back':
      return { orderStatus: 'Pendente', paymentStatusDB: 'chargeback' };
    default:
      return { orderStatus: 'Pendente', paymentStatusDB: 'pending' };
  }
}

export async function POST(request: NextRequest) {
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const receivedAt = new Date().toISOString();

  try {
    const body = await request.json();

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook Mercado Pago] Recebido:', {
        requestId,
        receivedAt,
        type: body.type,
        action: body.action,
      });
    }

    // Validar estrutura da notificação
    if (!validateWebhookNotification(body)) {
      console.error('[Webhook] Notificação inválida:', body);
      return NextResponse.json(
        { error: 'Notificação inválida' },
        { status: 400 }
      );
    }

    // Buscar dados completos do pagamento
    const paymentId = body.data.id;
    let payment;
    
    try {
      payment = await getPaymentById(paymentId);
    } catch (error: any) {
      console.error('[Webhook] Erro ao buscar pagamento:', error);
      // Retornar 200 mesmo com erro para evitar reenvios
      return NextResponse.json(
        { received: true, error: 'Erro ao buscar pagamento' },
        { status: 200 }
      );
    }

    // Extrair informações relevantes
    const paymentStatus = payment.status;
    const externalReference = payment.external_reference; // ID do pedido no sistema
    const paymentIdFromMP = payment.id;
    const amount = payment.transaction_amount;
    const paymentMethodId = payment.payment_method_id;
    const paymentTypeId = payment.payment_type_id;
    const dateApproved = payment.date_approved;

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook Mercado Pago] Processando:', {
        requestId,
        payment_id: paymentIdFromMP,
        status: paymentStatus,
        external_reference: externalReference,
        amount,
        payment_method: paymentMethodId,
        payment_type: paymentTypeId,
      });
    }

    // Atualizar pedido no banco de dados
    if (externalReference) {
      try {
        const { orderStatus, paymentStatusDB } = mapPaymentStatusToOrderStatus(paymentStatus);

        // Buscar pedido existente
        const { data: existingOrder, error: searchError } = await supabase
          .from('sales')
          .select('id, order_number, status, payment_status')
          .eq('order_number', externalReference)
          .single();

        if (searchError && searchError.code !== 'PGRST116') {
          console.error('[Webhook] Erro ao buscar pedido:', searchError);
        }

        // Preparar dados de atualização
        const updateData: any = {
          payment_status: paymentStatusDB,
          payment_id: paymentIdFromMP.toString(),
          updated_at: new Date().toISOString(),
        };

        // Atualizar status do pedido apenas se mudou
        if (existingOrder) {
          if (existingOrder.status !== orderStatus) {
            updateData.status = orderStatus;
          }
        } else {
          // Se não encontrou pelo order_number, tentar atualizar pelo payment_id
          updateData.status = orderStatus;
        }

        // Adicionar data de aprovação se o pagamento foi aprovado
        if (isPaymentApproved(payment) && dateApproved) {
          updateData.payment_approved_at = dateApproved;
        }

        // Atualizar o pedido
        let updateQuery = supabase
          .from('sales')
          .update(updateData);

        if (existingOrder) {
          updateQuery = updateQuery.eq('id', existingOrder.id);
        } else {
          // Tentar atualizar pelo payment_id se já existe
          updateQuery = updateQuery.eq('payment_id', paymentIdFromMP.toString());
        }

        const { error: updateError } = await updateQuery;

        if (updateError) {
          console.error('[Webhook] Erro ao atualizar pedido:', {
            requestId,
            error: updateError,
            external_reference: externalReference,
          });
        } else {
          if (WEBHOOK_LOG_ENABLED) {
            console.log('[Webhook] Pedido atualizado com sucesso:', {
              requestId,
              external_reference: externalReference,
              new_status: orderStatus,
              payment_status: paymentStatusDB,
            });
          }
        }
      } catch (dbError: any) {
        console.error('[Webhook] Erro ao processar atualização do pedido:', {
          requestId,
          error: dbError,
        });
        // Continuar mesmo com erro no banco
      }
    } else {
      console.warn('[Webhook] Pagamento sem external_reference:', {
        requestId,
        payment_id: paymentIdFromMP,
      });
    }

    // Sempre retornar 200 para o Mercado Pago para evitar reenvios
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
    
    // Sempre retornar 200 para evitar que o Mercado Pago fique reenviando
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

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Webhook do Mercado Pago',
      method: 'Use POST para receber notificações',
      endpoint: '/api/payments/webhook',
    },
    { status: 405 }
  );
}


