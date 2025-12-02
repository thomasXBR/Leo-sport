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
    return (
        <Link href={`/produtos/${product.id}`}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                        {product.status === 'Esgotado' && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Esgotado
                            </div>
                        )}
                        {product.discountPercentage && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                -{product.discountPercentage}
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        {showSKU && (
                            <p className="text-xs text-gray-400 mb-1">SKU: {product.sku}</p>
                        )}
                        {showStock && (
                            <p className="text-sm text-gray-600 mb-2">
                                Estoque: {product.stock} unidades
                            </p>
                        )}
                        
                        {/* Preço com desconto */}
                        <div className="mb-3">
                            {(
                                product.discountedPrice ||
                                product.fake_price ||
                                product.fakePrice
                            ) ? (
                                // If discountedPrice exists, treat that as the current (lower) price and show original as line-through.
                                <div className="flex items-baseline gap-2">
                                    <p className="text-lg font-bold text-red-600">{product.discountedPrice ?? product.price}</p>
                                    <p className="text-sm text-gray-400 line-through">{product.price ?? product.fake_price ?? product.fakePrice}</p>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-gray-900">{product.price}</p>
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
