'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CarrinhoPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

    const handleQuantityChange = (productId: number, change: number) => {
        const item = cartItems.find(item => item.product.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            updateQuantity(productId, Math.max(1, newQuantity));
        }
    };

    const formatPrice = (price: string | number) => {
        if (typeof price === 'string') {
            return price;
        }
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
                    <p className="text-gray-600 mt-2">
                        {cartCount === 0 ? 'Seu carrinho está vazio' : `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} no carrinho`}
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
                        <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar</p>
                        <Link href="/produtos">
                            <Button className="bg-blue-900 hover:bg-blue-950">
                                Ver Produtos
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold text-gray-900">Itens do Carrinho</h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearCart}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Limpar Carrinho
                                        </Button>
                                    </div>
                                </div>
                                <div className="divide-y">
                                    {cartItems.map((item) => (
                                        <div key={item.product.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="relative w-24 h-24 flex-shrink-0">
                                                    <Image
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/produtos/${item.product.id}`}>
                                                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-900 transition-colors">
                                                            {item.product.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                                                    <p className="text-lg font-bold text-blue-900 mt-2">
                                                        {calculateItemTotal(item.product.price, item.quantity)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatPrice(item.product.price)} cada
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end justify-between">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumo do Pedido</h2>

                                <div className="space-y-3 mb-6">
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
                                    <Link href="/produtos" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full border-gray-300"
                                        >
                                            Continuar Comprando
                                        </Button>
                                    </Link>
                                    <Link href="/checkout" className="block">
                                        <Button
                                            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold"
                                        >
                                            Finalizar Compra
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-500">
                                        ✓ Pagamento seguro via Mercado Pago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

