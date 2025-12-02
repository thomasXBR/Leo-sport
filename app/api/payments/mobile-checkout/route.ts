import { NextRequest, NextResponse } from 'next/server';
import {
  createMobileCheckoutPreference,
  MercadoPagoItem,
} from '@/lib/mercadoPagoClient';

/**
 * API Route para criar preferência de pagamento MOBILE
 * POST /api/payments/mobile-checkout
 * 
 * Integração para aplicativos móveis nativos (iOS/Android)
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

    if (!body.payerEmail) {
      return NextResponse.json(
        { error: 'Email do pagador é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.orderId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar items
    const items: MercadoPagoItem[] = body.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: item.currency_id || 'BRL',
      picture_url: item.picture_url,
    }));

    // Criar preferência mobile
    const preference = await createMobileCheckoutPreference(
      items,
      body.payerEmail,
      body.orderId,
      {
        payerName: body.payerName,
        payerPhone: body.payerPhone,
        installments: body.installments,
        excludedPaymentMethods: body.excludedPaymentMethods,
      }
    );

    return NextResponse.json(
      {
        success: true,
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        // Para mobile, incluir mais detalhes
        preference: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
          marketplace: preference.marketplace,
          operation_type: preference.operation_type,
          live_mode: preference.live_mode,
          metadata: preference.metadata,
          external_reference: preference.external_reference,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Mobile Checkout] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar preferência de pagamento mobile',
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
