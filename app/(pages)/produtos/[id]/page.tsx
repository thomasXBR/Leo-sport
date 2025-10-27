import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { getProductById, productsData } from '@/lib/products-data';
import ProductCard from '@/components/products/ProductCard';
import AddToCartButton from '@/components/products/AddToCartButton';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = getProductById(parseInt(id));

    if (!product) {
        return {
            title: 'Produto não encontrado - LeoSport',
        };
    }

    return {
        title: `${product.name} - LeoSport`,
        description: product.description,
        keywords: [product.name, product.category, product.brand, 'produtos esportivos'],
    };
}

export async function generateStaticParams() {
    return productsData.map((product) => ({
        id: product.id.toString(),
    }));
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = getProductById(parseInt(id));

    if (!product) {
        notFound();
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = productsData
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/inicio" className="hover:text-blue-900">Início</Link>
                        <span>/</span>
                        <Link href="/produtos" className="hover:text-blue-900">Produtos</Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.category}</span>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/produtos">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft size={16} />
                            Voltar aos Produtos
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {product.status === 'Esgotado' && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    Esgotado
                                </div>
                            )}
                        </div>

                        {/* Additional Images Placeholder */}
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                                    <Image
                                        src={product.imageUrl}
                                        alt={`${product.name} ${i}`}
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-cover opacity-70"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-500">{product.brand}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{product.category}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={16} className="text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">(4.8) • 127 avaliações</span>
                            </div>

                            <div className="text-3xl font-bold text-gray-900 mb-6">{product.price}</div>
                        </div>

                        {/* Product Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                            <ul className="space-y-2">
                                {product.features?.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-700">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Specifications */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificações Técnicas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(product.specifications || {}).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">{key}:</span>
                                        <span className="text-gray-900 font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stock Info */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900">
                                    {product.stock > 0 ? `${product.stock} unidades em estoque` : 'Produto esgotado'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <AddToCartButton product={product} />
                                <Button size="lg" variant="outline">
                                    <Heart size={20} />
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Share2 size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                            <div className="flex items-center gap-3">
                                <Truck className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Frete Grátis</p>
                                    <p className="text-sm text-gray-600">Acima de R$ 200</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Garantia</p>
                                    <p className="text-sm text-gray-600">1 ano</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Devolução</p>
                                    <p className="text-sm text-gray-600">30 dias</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} showStock={false} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
