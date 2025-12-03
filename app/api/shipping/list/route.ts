import { NextRequest, NextResponse } from 'next/server';
import { listShippings } from '@/lib/melhorEnvioClient';

/**
 * API Route para listar envios
 * GET /api/shipping/list?status=xxx&service_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: {
      status?: string;
      service_id?: number;
      created_at?: string;
    } = {};

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') || undefined;
    }
    if (searchParams.get('service_id')) {
      filters.service_id = parseInt(searchParams.get('service_id') || '0');
    }
    if (searchParams.get('created_at')) {
      filters.created_at = searchParams.get('created_at') || undefined;
    }

    const shippings = await listShippings(filters);

    return NextResponse.json(
      {
        success: true,
        shippings,
        count: shippings.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API List Shipping] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao listar envios',
        message: error.message,
      },
      { status: 500 }
    );
  }
}




