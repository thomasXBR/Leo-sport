'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, cartCount } = useCart();
    const { user, profile } = useAuth();
    const { createWebCheckout, loading } = useMercadoPago();
    
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Preencher dados do usuário se estiver logado
    useEffect(() => {
        if (user && profile) {
            setCustomerEmail(user.email || '');
            setCustomerName(profile.name || '');
        }
    }, [user, profile]);

    // Redirecionar se o carrinho estiver vazio
    useEffect(() => {
        if (cartItems.length === 0 && !loading) {
            router.push('/carrinho');
        }
    }, [cartItems, loading, router]);

    const handleCheckout = async () => {
        setError('');
        
        // Validações
        if (!customerName || customerName.trim().length < 2) {
            setError('Por favor, informe seu nome completo');
            return;
        }

        if (!customerEmail || !customerEmail.includes('@')) {
            setError('Por favor, informe um email válido');
            return;
        }

        if (cartItems.length === 0) {
            setError('Seu carrinho está vazio');
            return;
        }

        setIsProcessing(true);

        try {
            // Gerar ID do pedido
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Preparar itens para o Mercado Pago
            const items = cartItems.map((item) => {
                // Converter price para número se for string
                let unitPrice: number;
                if (typeof item.product.price === 'string') {
                    unitPrice = parseFloat(item.product.price.replace(/[^\d,]/g, '').replace(',', '.'));
                } else {
                    unitPrice = item.product.price;
                }

                return {
                    id: item.product.id.toString(),
                    title: item.product.name,
                    description: item.product.description || item.product.name,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    currency_id: 'BRL',
                    picture_url: item.product.imageUrl || undefined,
                };
            });

            // Criar preferência de pagamento
            const preference = await createWebCheckout({
                items,
                payerEmail: customerEmail,
                orderId,
                payerName: customerName,
                payerPhone: customerPhone || undefined,
            });

            if (preference?.init_point) {
                // Redirecionar para o checkout do Mercado Pago
                window.location.href = preference.init_point;
            } else if (preference?.sandbox_init_point) {
                // Modo sandbox
                window.location.href = preference.sandbox_init_point;
            } else {
                throw new Error('URL de checkout não disponível');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Erro ao processar pagamento. Tente novamente.';
            setError(errorMessage);
            toast.error(errorMessage);
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Carrinho vazio</h2>
                    <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar</p>
                    <Link href="/produtos">
                        <Button className="bg-blue-900 hover:bg-blue-950">
                            Ver Produtos
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
                    <p className="text-gray-600 mt-2">Complete seus dados para prosseguir com o pagamento</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulário de Dados */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados para Entrega</CardTitle>
                                <CardDescription>Informe seus dados para processar o pedido</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="name">Nome Completo *</Label>
                                    <Input
                                        id="name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>ℹ️ Informação:</strong> Você será redirecionado para o Mercado Pago para finalizar o pagamento de forma segura.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumo do Pedido */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Itens */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {cartItems.map((item) => {
                                            let unitPrice: number;
                                            if (typeof item.product.price === 'string') {
                                                unitPrice = parseFloat(item.product.price.replace(/[^\d,]/g, '').replace(',', '.'));
                                            } else {
                                                unitPrice = item.product.price;
                                            }
                                            const itemTotal = unitPrice * item.quantity;

                                            return (
                                                <div key={item.product.id} className="flex justify-between text-sm">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                                        <p className="text-gray-500">Qtd: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">
                                                        R$ {itemTotal.toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
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
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                                <span>Total</span>
                                                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCheckout}
                                        disabled={isProcessing || loading}
                                        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold"
                                        size="lg"
                                    >
                                        {isProcessing || loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            'Finalizar Pagamento'
                                        )}
                                    </Button>

                                    <Link href="/carrinho" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full border-gray-300"
                                        >
                                            Voltar ao Carrinho
                                        </Button>
                                    </Link>

                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-gray-500 text-center">
                                            ✓ Pagamento seguro via Mercado Pago
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}



