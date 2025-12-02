import { NextRequest, NextResponse } from 'next/server';
import { capturePayment } from '@/lib/mercadoPagoClient';

/**
 * API Route para capturar um pagamento autorizado
 * POST /api/payments/capture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.paymentId) {
      return NextResponse.json(
        { error: 'paymentId é obrigatório' },
        { status: 400 }
      );
    }

    const payment = await capturePayment(body.paymentId, body.amount);

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          transaction_amount: payment.transaction_amount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Capture] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao capturar pagamento',
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

