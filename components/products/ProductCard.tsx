import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/products-data';

interface ProductCardProps {
    // Accept flexible product shape (mock products and Supabase products)
    product: any;
    showStock?: boolean;
    showSKU?: boolean;
}

export default function ProductCard({ product, showStock = true, showSKU = false }: ProductCardProps) {
    // Calcula o percentual de desconto
    const calculateDiscount = () => {
        const fake = product.fake_price ? parseFloat(String(product.fake_price)) : 0;
        const real = product.price ? parseFloat(String(product.price)) : 0;
        if (!fake || !real || fake <= real) return 0;
        return Math.round(((fake - real) / fake) * 100);
    };

    const discountPercentage = calculateDiscount();
    const hasDiscount = discountPercentage > 0;

    return (
        <Link href={`/produtos/${product.id}`}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                            src={product.image_url || product.imageUrl || 'https://placehold.co/400x300'}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                        
                        {/* Badge de Esgotado */}
                        {product.status === 'Esgotado' && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Esgotado
                            </div>
                        )}
                        
                        {/* Badge de Desconto */}
                        {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                        
                        {/* Categoria ou Esporte */}
                        <p className="text-sm text-gray-500 mb-2">{product.category || product.sport}</p>
                        
                        {/* SKU opcional */}
                        {showSKU && (
                            <p className="text-xs text-gray-400 mb-1">SKU: {product.sku}</p>
                        )}
                        
                        {/* Estoque opcional */}
                        {showStock && (
                            <p className="text-sm text-gray-600 mb-3">
                                Estoque: {product.stock_quantity || product.stock || 0} unidades
                            </p>
                        )}
                        
                        {/* Preço com desconto */}
                        <div className="mb-3">
                            {hasDiscount ? (
                                <div className="space-y-2">
                                    {/* Preço original riscado */}
                                    <p className="text-sm text-gray-400 line-through">
                                        R$ {parseFloat(String(product.fake_price)).toFixed(2).replace('.', ',')}
                                    </p>
                                    
                                    {/* Preço atual em destaque */}
                                    <p className="text-2xl font-bold text-red-600">
                                        R$ {parseFloat(String(product.price)).toFixed(2).replace('.', ',')}
                                    </p>
                                    
                                    {/* Percentual de desconto em badge */}
                                    <div className="inline-block bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                                        {discountPercentage}% OFF
                                    </div>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-gray-900">
                                    R$ {parseFloat(String(product.price)).toFixed(2).replace('.', ',')}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{product.brand}</span>
                            <span className="text-xs text-gray-400">Ver detalhes →</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}