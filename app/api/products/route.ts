import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Mock data - TODO: Replace with real Supabase queries
const mockProducts = [
  {
    id: '1',
    name: 'Chuteira Nike Mercurial',
    description: 'Chuteira profissional para campo',
    price: 299.99,
    category_id: 'futebol',
    partner_id: 'partner1',
    status: 'active',
    images: ['https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg'],
    stock_quantity: 50,
    weight: 0.5,
    dimensions: { length: 30, width: 15, height: 10 }
  },
  {
    id: '2',
    name: 'Bola de Basquete Spalding',
    description: 'Bola oficial para basquete',
    price: 89.99,
    category_id: 'basquete',
    partner_id: 'partner2',
    status: 'active',
    images: ['https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg'],
    stock_quantity: 30,
    weight: 0.6,
    dimensions: { length: 25, width: 25, height: 25 }
  }
];

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Implement real Supabase query
    // const { data: products, error } = await supabase
    //   .from('products')
    //   .select('*, categories(*), partners(*)')
    //   .eq('status', 'active')
    //   .range(offset, offset + limit - 1);

    let filteredProducts = [...mockProducts];

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category_id === category);
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      products: filteredProducts.slice(offset, offset + limit),
      total: filteredProducts.length,
      hasMore: filteredProducts.length > offset + limit
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    // TODO: Implement authentication check
    // TODO: Implement admin role check
    // TODO: Implement real Supabase insert
    
    console.log('Creating product:', productData);

    const newProduct = {
      id: `product_${Date.now()}`,
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}