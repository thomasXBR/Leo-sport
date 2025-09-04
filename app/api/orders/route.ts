import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { mercadoPagoClient } from '@/lib/mercadoPagoClient';
import { resendClient } from '@/lib/resendClient';

interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  shipping_option: {
    id: string;
    price: number;
    delivery_time: number;
  };
  payment_method: string;
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session
    // TODO: Fetch orders from Supabase with proper RLS

    // Mock data
    const mockOrders = [
      {
        id: 'order_1',
        status: 'delivered',
        total_amount: 299.99,
        shipping_amount: 15.50,
        created_at: '2025-01-15T10:00:00Z',
        items: [
          {
            product: { name: 'Chuteira Nike Mercurial' },
            quantity: 1,
            unit_price: 299.99
          }
        ]
      }
    ];

    return NextResponse.json({ orders: mockOrders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData: CreateOrderRequest = await request.json();

    // TODO: Get user from session
    // TODO: Validate cart items and prices
    // TODO: Calculate total amount

    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + (item.unit_price * item.quantity), 
      0
    ) + orderData.shipping_option.price;

    // TODO: Create order in Supabase
    const orderId = `order_${Date.now()}`;
    
    console.log('Creating order:', {
      orderId,
      totalAmount,
      items: orderData.items,
      shippingAddress: orderData.shipping_address
    });

    // TODO: Create payment with Mercado Pago
    const paymentResult = await mercadoPagoClient.createPayment({
      amount: totalAmount,
      description: `Pedido LeoSport #${orderId}`,
      payerEmail: 'customer@example.com', // TODO: Get from user session
      orderId
    });

    if (paymentResult.error) {
      return NextResponse.json({ error: 'Payment creation failed' }, { status: 400 });
    }

    // TODO: Send order confirmation email
    await resendClient.sendOrderConfirmation({
      customerName: 'Cliente Exemplo', // TODO: Get from user session
      customerEmail: 'customer@example.com', // TODO: Get from user session
      orderId,
      products: orderData.items.map(item => ({
        name: `Produto ${item.product_id}`, // TODO: Get real product name
        quantity: item.quantity,
        price: item.unit_price
      })),
      totalAmount,
      deliveryEstimate: `${orderData.shipping_option.delivery_time} dias úteis`
    });

    return NextResponse.json({
      order: {
        id: orderId,
        status: 'pending',
        total_amount: totalAmount,
        payment_url: paymentResult.payment_url
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}