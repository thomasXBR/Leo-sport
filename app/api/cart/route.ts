import { NextRequest, NextResponse } from 'next/server';

// TODO: Implement cart management with Supabase or local storage
// For now, using mock implementation

interface CartItem {
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

// Mock cart data
let mockCart: CartItem[] = [];

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session
    // TODO: Fetch cart from Supabase
    
    const cartTotal = mockCart.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );

    return NextResponse.json({
      items: mockCart,
      total: cartTotal,
      itemCount: mockCart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity = 1 } = await request.json();

    // TODO: Validate product exists
    // TODO: Get user from session
    // TODO: Add to cart in Supabase

    // Mock implementation
    const existingItemIndex = mockCart.findIndex(item => item.product_id === product_id);
    
    if (existingItemIndex >= 0) {
      mockCart[existingItemIndex].quantity += quantity;
    } else {
      // Mock product data - TODO: Fetch real product from Supabase
      const mockProduct = {
        id: product_id,
        name: 'Produto Exemplo',
        price: 99.99,
        image: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg'
      };

      mockCart.push({
        product_id,
        quantity,
        product: mockProduct
      });
    }

    return NextResponse.json({ message: 'Item added to cart', cart: mockCart });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const { product_id, quantity } = await request.json();

    // TODO: Update cart in Supabase
    
    const itemIndex = mockCart.findIndex(item => item.product_id === product_id);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        mockCart.splice(itemIndex, 1);
      } else {
        mockCart[itemIndex].quantity = quantity;
      }
    }

    return NextResponse.json({ message: 'Cart updated', cart: mockCart });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // TODO: Remove from cart in Supabase
    
    mockCart = mockCart.filter(item => item.product_id !== product_id);

    return NextResponse.json({ message: 'Item removed from cart', cart: mockCart });
  } catch (error) {
    console.error('Cart removal error:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}