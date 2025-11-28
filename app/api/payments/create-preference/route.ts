import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference, MercadoPagoPreference } from '@/lib/mercadoPagoClient';

/**
 * API Route para criar preferência de pagamento no Mercado Pago
 * POST /api/payments/create-preference
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados obrigatórios
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items são obrigatórios e devem ser um array não vazio' },
        { status: 400 }
      );
    }

    // Validar cada item
    for (const item of body.items) {
      if (!item.id || !item.title || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: 'Cada item deve ter id, title, quantity e unit_price' },
          { status: 400 }
        );
      }
    }

    // Preparar dados da preferência
    const preferenceData: MercadoPagoPreference = {
      items: body.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'BRL',
        picture_url: item.picture_url,
      })),
      payer: body.payer
        ? {
            name: body.payer.name,
            surname: body.payer.surname,
            email: body.payer.email,
            phone: body.payer.phone,
            identification: body.payer.identification,
            address: body.payer.address,
          }
        : undefined,
      back_urls: body.back_urls || {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/pending`,
      },
      auto_return: body.auto_return || 'approved',
      external_reference: body.external_reference, // ID do pedido no sistema
      notification_url: body.notification_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/webhook`,
      statement_descriptor: body.statement_descriptor || 'LEOSPORT',
      metadata: {
        ...body.metadata,
        created_at: new Date().toISOString(),
      },
    };

    // Criar preferência no Mercado Pago
    const preference = await createPaymentPreference(preferenceData);

    return NextResponse.json(
      {
        success: true,
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        preference: preference,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Erro ao criar preferência de pagamento:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar preferência de pagamento',
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

