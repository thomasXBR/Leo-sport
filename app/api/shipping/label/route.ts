import { NextRequest, NextResponse } from 'next/server';
import { generateShippingLabel } from '@/lib/melhorEnvioClient';

/**
 * API Route para gerar etiqueta de envio
 * POST /api/shipping/label
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

    const label = await generateShippingLabel(body.shippingId);

    return NextResponse.json(
      {
        success: true,
        label,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Label] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao gerar etiqueta',
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

