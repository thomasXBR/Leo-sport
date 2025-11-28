import { NextRequest, NextResponse } from 'next/server';
import { trackShipping } from '@/lib/melhorEnvioClient';

/**
 * API Route para rastrear um envio
 * GET /api/shipping/track/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shippingId } = await params;

    if (!shippingId) {
      return NextResponse.json(
        { error: 'ID do envio é obrigatório' },
        { status: 400 }
      );
    }

    const tracking = await trackShipping(shippingId);

    return NextResponse.json(
      {
        success: true,
        tracking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Erro ao rastrear envio:', error);
    return NextResponse.json(
      {
        error: 'Erro ao rastrear envio',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

