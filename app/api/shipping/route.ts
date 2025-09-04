import { NextRequest, NextResponse } from 'next/server';
import { melhorEnvioClient } from '@/lib/melhorEnvioClient';

interface ShippingCalculationRequest {
  cep_destination: string;
  items: Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
    value: number;
  }>;
}

// POST /api/shipping/calculate - Calculate shipping options
export async function POST(request: NextRequest) {
  try {
    const { cep_destination, items }: ShippingCalculationRequest = await request.json();

    // Validate CEP format
    if (!melhorEnvioClient.validateCEP(cep_destination)) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    // Calculate total dimensions and weight
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    
    // Use largest dimensions (simplified approach)
    const maxLength = Math.max(...items.map(item => item.length));
    const maxWidth = Math.max(...items.map(item => item.width));
    const maxHeight = Math.max(...items.map(item => item.height));

    // TODO: Get actual origin CEP from settings
    const shippingData = {
      cep_origin: '01310-100', // São Paulo - SP (placeholder)
      cep_destination,
      weight: Math.max(totalWeight, 0.3), // Minimum 300g
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      value: totalValue
    };

    const shippingOptions = await melhorEnvioClient.calculateShipping(shippingData);

    return NextResponse.json({ 
      shipping_options: shippingOptions,
      calculation_data: shippingData 
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}

// GET /api/shipping/track - Track order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('tracking_code');

    if (!trackingCode) {
      return NextResponse.json({ error: 'Tracking code required' }, { status: 400 });
    }

    const trackingInfo = await melhorEnvioClient.trackOrder(trackingCode);

    return NextResponse.json({ tracking: trackingInfo });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}