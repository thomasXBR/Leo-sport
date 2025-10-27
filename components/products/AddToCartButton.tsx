'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/products-data';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        addToCart(product, 1);
        // Simulate a brief delay for better UX
        setTimeout(() => {
            setIsAdding(false);
        }, 300);
    };

    return (
        <Button
            size="lg"
            className="flex-1 bg-blue-900 hover:bg-blue-800"
            disabled={product.status === 'Esgotado' || isAdding}
            onClick={handleAddToCart}
        >
            <ShoppingCart size={20} className="mr-2" />
            {product.status === 'Esgotado'
                ? 'Esgotado'
                : isAdding
                    ? 'Adicionando...'
                    : 'Adicionar ao Carrinho'
            }
        </Button>
    );
}

