import { NextRequest, NextResponse } from 'next/server';
import { cancelPayment } from '@/lib/mercadoPagoClient';

/**
 * API Route para cancelar um pagamento pendente
 * POST /api/payments/cancel
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

    const payment = await cancelPayment(body.paymentId);

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Cancel] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao cancelar pagamento',
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




