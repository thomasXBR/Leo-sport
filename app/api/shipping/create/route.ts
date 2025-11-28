import { NextRequest, NextResponse } from 'next/server';
import {
  createShipping,
  MelhorEnvioCreateShippingRequest,
} from '@/lib/melhorEnvioClient';

/**
 * API Route para criar envio no Melhor Envio
 * POST /api/shipping/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados obrigatórios
    if (!body.service) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.from || !body.to) {
      return NextResponse.json(
        { error: 'Dados de origem e destino são obrigatórios' },
        { status: 400 }
      );
    }

    if (!body.volumes || !Array.isArray(body.volumes) || body.volumes.length === 0) {
      return NextResponse.json(
        { error: 'Volumes são obrigatórios e devem ser um array não vazio' },
        { status: 400 }
      );
    }

    // Validar endereço de origem
    const requiredFromFields = ['name', 'phone', 'email', 'document', 'address', 'number', 'district', 'city', 'state', 'postal_code'];
    for (const field of requiredFromFields) {
      if (!body.from[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: from.${field}` },
          { status: 400 }
        );
      }
    }

    // Validar endereço de destino
    const requiredToFields = ['name', 'phone', 'email', 'document', 'address', 'number', 'district', 'city', 'state', 'postal_code'];
    for (const field of requiredToFields) {
      if (!body.to[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: to.${field}` },
          { status: 400 }
        );
      }
    }

    // Preparar requisição para Melhor Envio
    const shippingRequest: MelhorEnvioCreateShippingRequest = {
      service: Number(body.service),
      from: {
        name: body.from.name,
        phone: body.from.phone.replace(/\D/g, ''), // Remover formatação
        email: body.from.email,
        document: body.from.document.replace(/\D/g, ''), // Remover formatação
        company_document: body.from.company_document?.replace(/\D/g, ''),
        state_register: body.from.state_register,
        address: body.from.address,
        complement: body.from.complement,
        number: body.from.number,
        district: body.from.district,
        city: body.from.city,
        state: body.from.state.toUpperCase(), // Garantir maiúsculas
        country_id: body.from.country_id || 'BR',
        postal_code: body.from.postal_code.replace(/\D/g, ''),
      },
      to: {
        name: body.to.name,
        phone: body.to.phone.replace(/\D/g, ''),
        email: body.to.email,
        document: body.to.document.replace(/\D/g, ''),
        address: body.to.address,
        complement: body.to.complement,
        number: body.to.number,
        district: body.to.district,
        city: body.to.city,
        state: body.to.state.toUpperCase(),
        country_id: body.to.country_id || 'BR',
        postal_code: body.to.postal_code.replace(/\D/g, ''),
      },
      products: body.products || [],
      volumes: body.volumes.map((v: any) => ({
        height: Number(v.height),
        width: Number(v.width),
        length: Number(v.length),
        weight: Number(v.weight),
      })),
      options: body.options || {},
    };

    // Criar envio no Melhor Envio
    const shipping = await createShipping(shippingRequest);

    return NextResponse.json(
      {
        success: true,
        shipping: {
          id: shipping.id,
          protocol: shipping.protocol,
          service_id: shipping.service_id,
          status: shipping.status,
          tracking: shipping.tracking,
          created_at: shipping.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Erro ao criar envio:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar envio',
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

