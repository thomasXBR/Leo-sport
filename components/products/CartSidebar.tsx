'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface CartSidebarProps {
    trigger?: React.ReactNode;
}

export default function CartSidebar({ trigger }: CartSidebarProps) {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, loading } = useCart();

    const handleQuantityChange = (productId: number, change: number) => {
        const item = cartItems.find(item => item.product.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            updateQuantity(productId, Math.max(1, newQuantity));
        }
    };

    const calculateItemTotal = (price: string, quantity: number) => {
        const numPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
        const total = numPrice * quantity;
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    const defaultTrigger = (
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                </span>
            )}
        </Button>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || defaultTrigger}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold text-gray-900">
                        Carrinho de Compras
                    </SheetTitle>
                    <p className="text-gray-600 text-sm">
                        {cartCount === 0 ? 'Seu carrinho está vazio' : `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} no carrinho`}
                    </p>
                </SheetHeader>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando carrinho...</p>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
                        <p className="text-gray-600 mb-6 text-center">Adicione produtos ao carrinho para continuar</p>
                        <Link href="/produtos">
                            <Button className="bg-blue-900 hover:bg-blue-950">
                                Ver Produtos
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.product.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <Image
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/produtos/${item.product.id}`}>
                                                <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-900 transition-colors line-clamp-2">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">{item.product.category}</p>
                                            <p className="text-sm font-bold text-blue-900 mt-2">
                                                {calculateItemTotal(item.product.price, item.quantity)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                R$ {item.product.price.replace(/[^\d,]/g, '')} cada
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-2 border rounded-lg">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item.product.id, -1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(item.product.id, 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4 mt-4 bg-white sticky bottom-0">
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})</span>
                                    <span className="font-semibold text-gray-900">
                                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span className="font-semibold text-gray-900">Grátis</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link href="/carrinho" className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300"
                                    >
                                        Ver Carrinho Completo
                                    </Button>
                                </Link>
                                <Link href="/checkout">
                                    <Button
                                        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold"
                                    >
                                        Finalizar Compra
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-gray-500 text-center">
                                    ✓ Pagamento seguro via Mercado Pago
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

