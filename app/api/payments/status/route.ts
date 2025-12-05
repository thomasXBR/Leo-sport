import { NextRequest, NextResponse } from 'next/server';
import { getPaymentById } from '@/lib/mercadoPagoClient';

/**
 * API Route para verificar status de um pagamento
 * GET /api/payments/status?payment_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'payment_id é obrigatório' },
        { status: 400 }
      );
    }

    const payment = await getPaymentById(paymentId);

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          external_reference: payment.external_reference,
          transaction_amount: payment.transaction_amount,
          payment_method_id: payment.payment_method_id,
          payment_type_id: payment.payment_type_id,
          date_created: payment.date_created,
          date_approved: payment.date_approved,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Erro ao buscar status do pagamento:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar status do pagamento',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


