import { NextRequest, NextResponse } from 'next/server';
import {
  calculateShipping,
  MelhorEnvioCalculateShippingRequest,
  MelhorEnvioPackage,
} from '@/lib/melhorEnvioClient';

/**
 * API Route para calcular opções de frete
 * POST /api/shipping/calculate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados obrigatórios
    if (!body.from?.postal_code || !body.to?.postal_code) {
      return NextResponse.json(
        { error: 'CEP de origem e destino são obrigatórios' },
        { status: 400 }
      );
    }

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { error: 'Produtos são obrigatórios e devem ser um array não vazio' },
        { status: 400 }
      );
    }

    // Validar cada produto
    for (const product of body.products) {
      if (
        !product.height ||
        !product.width ||
        !product.length ||
        !product.weight
      ) {
        return NextResponse.json(
          {
            error:
              'Cada produto deve ter height, width, length e weight (em cm e kg)',
          },
          { status: 400 }
        );
      }
    }

    // Preparar requisição para Melhor Envio
    const calculateRequest: MelhorEnvioCalculateShippingRequest = {
      from: {
        postal_code: body.from.postal_code.replace(/\D/g, ''), // Remover formatação do CEP
      },
      to: {
        postal_code: body.to.postal_code.replace(/\D/g, ''),
      },
      products: body.products.map((p: any) => ({
        height: Number(p.height),
        width: Number(p.width),
        length: Number(p.length),
        weight: Number(p.weight),
      })),
      services: body.services, // IDs de serviços específicos (opcional)
    };

    // Calcular frete
    const shippingOptions = await calculateShipping(calculateRequest);

    return NextResponse.json(
      {
        success: true,
        options: shippingOptions.map((option) => ({
          id: option.id,
          name: option.name,
          company: option.company,
          price: parseFloat(option.price),
          currency: option.currency,
          delivery_time: option.delivery_time,
          delivery_range: option.delivery_range,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Erro ao calcular frete:', error);
    return NextResponse.json(
      {
        error: 'Erro ao calcular frete',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido. Use POST.' },
    { status: 405 }
  );
}

