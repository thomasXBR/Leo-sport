import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookNotification, getPaymentById } from '@/lib/mercadoPagoClient';
import { supabase } from '@/lib/supabase';

/**
 * API Route para receber webhooks do Mercado Pago
 * POST /api/payments/webhook
 * 
 * O Mercado Pago enviará notificações sobre mudanças de status de pagamentos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar estrutura da notificação
    if (!validateWebhookNotification(body)) {
      return NextResponse.json(
        { error: 'Notificação inválida' },
        { status: 400 }
      );
    }

    // Buscar dados completos do pagamento
    const paymentId = body.data.id;
    const payment = await getPaymentById(paymentId);

    // Extrair informações relevantes
    const paymentStatus = payment.status;
    const externalReference = payment.external_reference; // ID do pedido no sistema
    const paymentIdFromMP = payment.id;
    const amount = payment.transaction_amount;
    const paymentMethodId = payment.payment_method_id;
    const paymentTypeId = payment.payment_type_id;

    console.log('[Webhook Mercado Pago]', {
      payment_id: paymentIdFromMP,
      status: paymentStatus,
      external_reference: externalReference,
      amount,
      payment_method: paymentMethodId,
    });

    // Atualizar pedido no banco de dados
    if (externalReference) {
      try {
        // Mapear status do Mercado Pago para status do sistema
        let orderStatus = 'pending';
        let paymentStatusDB = 'pending';

        switch (paymentStatus) {
          case 'approved':
            orderStatus = 'paid';
            paymentStatusDB = 'approved';
            break;
          case 'pending':
            orderStatus = 'pending';
            paymentStatusDB = 'pending';
            break;
          case 'in_process':
            orderStatus = 'pending';
            paymentStatusDB = 'processing';
            break;
          case 'rejected':
            orderStatus = 'pending';
            paymentStatusDB = 'rejected';
            break;
          case 'cancelled':
            orderStatus = 'cancelled';
            paymentStatusDB = 'cancelled';
            break;
          case 'refunded':
            orderStatus = 'cancelled';
            paymentStatusDB = 'refunded';
            break;
          default:
            orderStatus = 'pending';
            paymentStatusDB = 'pending';
        }

        // Atualizar o pedido na tabela sales (ou orders, dependendo da estrutura do banco)
        const { error: updateError } = await supabase
          .from('sales')
          .update({
            status: orderStatus === 'paid' ? 'Pago' : 'Pendente',
            payment_status: paymentStatusDB,
            payment_id: paymentIdFromMP.toString(),
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', externalReference);

        if (updateError) {
          console.error('[Webhook] Erro ao atualizar pedido:', updateError);
          // Não retornar erro, apenas logar, para que o Mercado Pago não reenvie a notificação
        } else {
          console.log('[Webhook] Pedido atualizado com sucesso:', externalReference);
        }
      } catch (dbError: any) {
        console.error('[Webhook] Erro ao processar atualização do pedido:', dbError);
        // Continuar mesmo com erro no banco
      }
    }

    // Sempre retornar 200 para o Mercado Pago para evitar reenvios
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    
    // Sempre retornar 200 para evitar que o Mercado Pago fique reenviando
    // O erro foi logado para investigação
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}

