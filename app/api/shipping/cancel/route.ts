import { NextRequest, NextResponse } from 'next/server';
import { cancelShipping } from '@/lib/melhorEnvioClient';

/**
 * API Route para cancelar um envio
 * POST /api/shipping/cancel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.shippingId) {
      return NextResponse.json(
        { error: 'shippingId é obrigatório' },
        { status: 400 }
      );
    }

    const result = await cancelShipping(body.shippingId);

    return NextResponse.json(
      {
        success: true,
        shipping: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Cancel Shipping] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao cancelar envio',
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




