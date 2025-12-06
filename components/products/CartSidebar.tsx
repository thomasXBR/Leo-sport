'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CartSidebar() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, loading } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const [wasEmpty, setWasEmpty] = useState(true);
    const [previousCount, setPreviousCount] = useState(0);
    const pathname = usePathname();

    // Fechar automaticamente quando estiver na página do carrinho
    useEffect(() => {
        if (pathname === '/carrinho' || pathname === '/checkout') {
            setIsVisible(false);
        }
    }, [pathname]);

    // Mostrar carrinho automaticamente quando há produtos ou quando um produto é adicionado
    useEffect(() => {
        // Não mostrar se estiver na página do carrinho ou checkout
        if (pathname === '/carrinho' || pathname === '/checkout') {
            return;
        }

        const currentCount = cartItems.length;
        const currentTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const previousTotalItems = cartItems.length > 0 ? previousCount : 0;
        
        if (currentCount > 0) {
            // Se o carrinho estava vazio e agora tem itens, ou se a quantidade total aumentou, mostrar automaticamente
            if (wasEmpty || currentTotalItems > previousTotalItems) {
                setIsVisible(true);
            }
            setWasEmpty(false);
        } else {
            // Só esconder se não estava vazio antes (evita flash ao carregar)
            if (!wasEmpty) {
                setIsVisible(false);
            }
            setWasEmpty(true);
        }
        
        setPreviousCount(currentTotalItems);
    }, [cartItems, wasEmpty, previousCount, pathname]);

    const handleQuantityChange = (productId: number, change: number) => {
        const item = cartItems.find(item => item.product.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            updateQuantity(productId, Math.max(1, newQuantity));
        }
    };

    const calculateItemTotal = (price: string | number, quantity: number) => {
        let numPrice: number;
        if (typeof price === 'string') {
            numPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
        } else {
            numPrice = price;
        }
        const total = numPrice * quantity;
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    // Não renderizar se não houver itens
    if (cartItems.length === 0 || !isVisible) {
        return null;
    }

    return (
        <div className="fixed right-0 top-16 bottom-0 w-80 bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Carrinho</h2>
                    <p className="text-xs text-gray-600">
                        {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-600">Carregando...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/produtos/${item.product.id}`}>
                                        <h3 className="text-xs font-semibold text-gray-900 hover:text-blue-900 transition-colors line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.product.category}</p>
                                    <p className="text-xs font-bold text-blue-900 mt-1">
                                        {calculateItemTotal(item.product.price, item.quantity)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFromCart(item.product.id);
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                        disabled={loading}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <div className="flex items-center gap-1 border rounded">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleQuantityChange(item.product.id, -1);
                                            }}
                                            disabled={loading || item.quantity <= 1}
                                            className="h-6 w-6 p-0 disabled:opacity-50"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center font-semibold text-xs">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleQuantityChange(item.product.id, 1);
                                            }}
                                            disabled={loading}
                                            className="h-6 w-6 p-0 disabled:opacity-50"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Fixed */}
            <div className="border-t bg-white p-4 space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-semibold text-gray-900">
                            R$ {cartTotal.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Frete</span>
                        <span className="font-semibold text-gray-900">Grátis</span>
                    </div>
                    <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Link href="/carrinho" className="block" onClick={() => setIsVisible(false)}>
                        <Button
                            variant="outline"
                            className="w-full border-gray-300 text-xs"
                            size="sm"
                        >
                            Ver Carrinho Completo
                        </Button>
                    </Link>
                    <Link href="/checkout" onClick={() => setIsVisible(false)}>
                        <Button
                            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs"
                            size="sm"
                        >
                            Finalizar Compra
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    ✓ Pagamento seguro
                </p>
            </div>
        </div>
    );
}
