import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoClient } from '@/lib/mercadoPagoClient';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST /api/payments/create - Create payment
export async function POST(request: NextRequest) {
  try {
    const { order_id, amount, payer_email } = await request.json();

    // TODO: Validate order exists and belongs to user
    // TODO: Validate amount matches order total

    const paymentResult = await mercadoPagoClient.createPayment({
      amount,
      description: `Pedido LeoSport #${order_id}`,
      payerEmail: payer_email,
      orderId: order_id
    });

    if (paymentResult.error) {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 });
    }

    // TODO: Update order with payment_id in Supabase
    console.log('Payment created:', paymentResult);

    return NextResponse.json({
      payment_id: paymentResult.id,
      payment_url: paymentResult.payment_url,
      status: paymentResult.status
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// POST /api/payments/webhook - Handle Mercado Pago webhooks
export async function PUT(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const body = await request.text();

    // TODO: Verify webhook signature
    const isValid = await mercadoPagoClient.verifyWebhook(signature, body);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    console.log('Received webhook:', webhookData);

    // TODO: Process webhook based on type
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data.id;
      const paymentStatus = await mercadoPagoClient.getPaymentStatus(paymentId);

      // TODO: Update order status in Supabase based on payment status
      console.log('Payment status update:', { paymentId, paymentStatus });

      if (paymentStatus === 'approved') {
        // TODO: Update order status to 'paid'
        // TODO: Send confirmation email
        // TODO: Notify partner about new sale
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}