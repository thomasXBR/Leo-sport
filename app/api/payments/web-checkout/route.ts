import { NextRequest, NextResponse } from 'next/server';
import {
  createWebCheckoutPreference,
  MercadoPagoItem,
} from '@/lib/mercadoPagoClient';

/**
 * API Route para criar preferência de pagamento WEB (Checkout Pro)
 * POST /api/payments/web-checkout
 * 
 * Integração para navegador web com redirecionamento para Mercado Pago
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

    // Criar preferência web
    const preference = await createWebCheckoutPreference(
      items,
      body.payerEmail,
      body.orderId,
      {
        payerName: body.payerName,
        payerSurname: body.payerSurname,
        payerPhone: body.payerPhone,
        payerIdentification: body.payerIdentification,
        shipmentMode: body.shipmentMode,
        statementDescriptor: body.statementDescriptor,
        installments: body.installments,
      }
    );

    return NextResponse.json(
      {
        success: true,
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        preference,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Web Checkout] Erro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar preferência de pagamento web',
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
