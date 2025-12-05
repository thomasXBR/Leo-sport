import { NextRequest, NextResponse } from 'next/server';
import { listServices, getServiceInfo } from '@/lib/melhorEnvioClient';

/**
 * API Route para listar serviços disponíveis do Melhor Envio
 * GET /api/shipping/services
 * GET /api/shipping/services?id=xxx (para buscar um serviço específico)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('id');

    if (serviceId) {
      // Buscar serviço específico
      const service = await getServiceInfo(parseInt(serviceId));
      return NextResponse.json(
        {
          success: true,
          service,
        },
        { status: 200 }
      );
    }

    // Listar todos os serviços
    const services = await listServices();

    return NextResponse.json(
      {
        success: true,
        services,
        count: services.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Services] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar serviços',
        message: error.message,
      },
      { status: 500 }
    );
  }
}




