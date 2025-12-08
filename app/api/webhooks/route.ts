import { NextRequest, NextResponse } from 'next/server';
import { 
  validateWebhookNotification, 
  getPaymentById,
  isPaymentApproved,
} from '@/lib/mercadoPagoClient';
import { supabase } from '@/lib/supabase';
import { createPurchase } from '@/lib/supabase';

/**
 * API Route para receber webhooks do Mercado Pago
 * POST /api/webhooks
 * 
 * Esta rota é um alias para /api/payments/webhook
 * para compatibilidade com configurações do Mercado Pago
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
      console.log('[Webhook Mercado Pago] Recebido em /api/webhooks:', {
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
      // Se for um teste do Mercado Pago (ID 123456), retornar sucesso sem processar
      if (paymentId === '123456' || paymentId === '12345678') {
        if (WEBHOOK_LOG_ENABLED) {
          console.log('[Webhook] Teste do Mercado Pago recebido:', {
            requestId,
            payment_id: paymentId,
            message: 'Teste de webhook - não processando',
          });
        }
        return NextResponse.json(
          { 
            received: true,
            requestId,
            message: 'Webhook de teste recebido com sucesso',
            test: true,
          },
          { status: 200 }
        );
      }
      
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

          // Se pagamento aprovado, garantir criação/atualização completa e baixa de estoque
          if (isPaymentApproved(payment)) {
            await ensureOrderAndStock({
              requestId,
              externalReference,
              payment,
            });
            
            // Registrar como compra também
            await registerPurchaseFromPayment({
              requestId,
              externalReference,
              payment,
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
      message: 'Webhook processado com sucesso',
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
        error: error.message,
        message: 'Webhook recebido, mas houve um erro no processamento',
      },
      { status: 200 }
    );
  }
}

type PaymentItem = {
  id?: string;
  title?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
};

/**
 * Garante que o pedido esteja registrado com items e faz baixa de estoque
 */
async function ensureOrderAndStock({
  requestId,
  externalReference,
  payment,
}: {
  requestId: string;
  externalReference: string;
  payment: any;
}) {
  try {
    // Buscar pedido existente
    const { data: existingSale } = await supabase
      .from('sales')
      .select('id, order_number, status, customer_email, customer_name')
      .eq('order_number', externalReference)
      .maybeSingle();

    // Extrair itens do pagamento (Mercado Pago envia em additional_info.items ou transaction_details)
    const items: PaymentItem[] =
      payment?.additional_info?.items ||
      payment?.order?.items ||
      payment?.items ||
      [];

    const totalAmount = payment?.transaction_amount || 0;
    const paymentMethod = payment?.payment_method_id || '';
    const payerEmail = payment?.payer?.email || '';
    const payerName = payment?.payer?.first_name
      ? `${payment?.payer?.first_name} ${payment?.payer?.last_name || ''}`.trim()
      : payment?.payer?.name || payment?.payer?.nickname || '';

    // Se não há itens, não consegue baixar estoque
    if (!items || items.length === 0) {
      if (WEBHOOK_LOG_ENABLED) {
        console.warn('[Webhook] Pagamento aprovado sem itens para registrar', {
          requestId,
          externalReference,
        });
      }
      return;
    }

    let saleId = existingSale?.id;

    // Criar pedido se não existir
    if (!existingSale) {
      const { data: createdSale, error: createSaleError } = await supabase
        .from('sales')
        .insert({
          order_number: externalReference,
          customer_email: payerEmail || null,
          customer_name: payerName || null,
          total_amount: totalAmount,
          status: 'Pago',
          payment_method: paymentMethod,
          payment_status: 'approved',
          payment_id: payment?.id?.toString(),
        })
        .select('id')
        .single();

      if (createSaleError) {
        console.error('[Webhook] Erro ao criar venda', {
          requestId,
          externalReference,
          error: createSaleError,
        });
        return;
      }

      saleId = createdSale.id;
    } else {
      // Atualizar status se ainda não estava pago
      if (existingSale.status !== 'Pago') {
        await supabase
          .from('sales')
          .update({
            status: 'Pago',
            payment_status: 'approved',
            payment_id: payment?.id?.toString(),
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSale.id);
      }
    }

    if (!saleId) return;

    // Registrar itens e baixar estoque
    for (const item of items) {
      const quantity = item.quantity || 1;
      const unitPrice = item.unit_price || 0;
      const productId = item.id;

      // Inserir item da venda
      await supabase.from('sale_items').insert({
        sale_id: saleId,
        product_id: productId || null,
        product_name: item.title || item.description || 'Item',
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
      });

      // Baixar estoque se produtoId estiver presente
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .maybeSingle();

        if (product && product.stock_quantity !== undefined) {
          const newStock = Math.max(0, (product.stock_quantity || 0) - quantity);
          await supabase
            .from('products')
            .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
            .eq('id', productId);
        }
      }
    }

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook] Pedido consolidado e estoque atualizado', {
        requestId,
        external_reference: externalReference,
        sale_id: saleId,
      });
    }
  } catch (error: any) {
    console.error('[Webhook] Erro em ensureOrderAndStock', {
      requestId,
      external_reference: externalReference,
      error: error.message,
    });
  }
}

/**
 * Registra uma compra a partir de um pagamento aprovado do Mercado Pago
 */
async function registerPurchaseFromPayment({
  requestId,
  externalReference,
  payment,
}: {
  requestId: string;
  externalReference: string;
  payment: any;
}) {
  try {
    const totalAmount = payment?.transaction_amount || 0;
    const payerName = payment?.payer?.first_name
      ? `${payment?.payer?.first_name} ${payment?.payer?.last_name || ''}`.trim()
      : payment?.payer?.name || payment?.payer?.nickname || 'Cliente';
    const payerEmail = payment?.payer?.email || '';
    const paymentId = payment?.id?.toString() || '';
    const dateApproved = payment?.date_approved || new Date().toISOString();

    // Verificar se já existe uma compra com este purchase_number
    const purchaseNumber = `COMP-${externalReference}`;
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('purchase_number', purchaseNumber)
      .maybeSingle();

    if (existingPurchase) {
      if (WEBHOOK_LOG_ENABLED) {
        console.log('[Webhook] Compra já registrada:', {
          requestId,
          purchase_id: existingPurchase.id,
          external_reference: externalReference,
        });
      }
      return;
    }

    // Criar compra a partir do pagamento
    const purchaseData = {
      purchase_number: purchaseNumber,
      supplier_name: payerName || 'Cliente',
      total_amount: totalAmount,
      purchase_date: dateApproved.split('T')[0], // Apenas a data
    };

    const newPurchase = await createPurchase(purchaseData);

    if (WEBHOOK_LOG_ENABLED) {
      console.log('[Webhook] Compra registrada com sucesso:', {
        requestId,
        purchase_id: newPurchase.id,
        external_reference: externalReference,
        supplier_name: payerName,
        total_amount: totalAmount,
      });
    }
  } catch (error: any) {
    console.error('[Webhook] Erro ao registrar compra:', {
      requestId,
      external_reference: externalReference,
      error: error.message,
    });
    // Não lançar erro para não interromper o fluxo principal
  }
}

// Permitir GET para teste
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Webhook do Mercado Pago',
      endpoint: '/api/webhooks',
      method: 'Use POST para receber notificações',
      status: 'active',
    },
    { status: 200 }
  );
}

