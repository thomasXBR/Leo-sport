import { NextRequest, NextResponse } from 'next/server';
import { refundPayment, searchPaymentsByReference } from '@/lib/mercadoPagoClient';

/**
 * API Route para reembolsar pagamentos
 * POST /api/payments/refund
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.paymentId && !body.externalReference) {
      return NextResponse.json(
        { error: 'paymentId ou externalReference é obrigatório' },
        { status: 400 }
      );
    }

    let paymentId = body.paymentId;

    // Se usar externalReference, buscar o pagamento primeiro
    if (!paymentId && body.externalReference) {
      const payments = await searchPaymentsByReference(body.externalReference);
      if (payments.length === 0) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado' },
          { status: 404 }
        );
      }
      paymentId = payments[0].id;
    }

    // Reembolsar
    const refund = await refundPayment(paymentId, body.amount);

    return NextResponse.json(
      {
        success: true,
        refund: {
          id: refund.id,
          payment_id: refund.payment_id,
          amount: refund.amount,
          status: refund.status,
          created_at: refund.date_created,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Refund] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao reembolsar pagamento',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}
