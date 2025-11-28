'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/supabase';
import type { Product as SupabaseProduct } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductCard';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';
import { Loader2 } from 'lucide-react';

// Converter produto do Supabase para o formato esperado pelo ProductCard
function convertProduct(supabaseProduct: SupabaseProduct & { categories?: { name: string; slug: string } | null }) {
    return {
        id: supabaseProduct.id,
        name: supabaseProduct.name,
        category: supabaseProduct.categories?.name || 'Sem categoria',
        price: `R$ ${supabaseProduct.price.toFixed(2).replace('.', ',')}`,
        imageUrl: supabaseProduct.image_url || 'https://placehold.co/400x400/e2e8f0/334155?text=Produto',
        description: supabaseProduct.description || '',
        stock: supabaseProduct.stock_quantity,
        sku: supabaseProduct.sku,
        brand: supabaseProduct.brand || '',
        weight: supabaseProduct.weight || '',
        dimensions: supabaseProduct.dimensions || '',
        status: supabaseProduct.status,
    };
}

export default function ProductsPage() {
    const { getContent, loading: contentLoading } = useSiteContent();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Buscar produtos do Supabase
    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const data = await getProducts();
                // Filtrar apenas produtos ativos
                const activeProducts = (data || []).filter(p => p.status === 'Ativo');
                setProducts(activeProducts.map(convertProduct));
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    // Obter categorias únicas dos produtos
    const categories = Array.from(new Set(products.map(p => p.category)));

    // Filtrar produtos
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (contentLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative text-white py-16 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/1920x1080-hd-sports-61oi85jh19u3ptld.jpg"
                        alt="Sports Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {getContent('products_title', 'Nossos Produtos')}
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            {getContent('products_subtitle', 'Descubra nossa ampla variedade de produtos esportivos de alta qualidade')}
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={getContent('products_search_placeholder', 'Buscar produtos...')}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 bg-white/90 text-gray-900 focus:ring-2 focus:ring-blue-300 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Filter */}
            <section className="py-8 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800">{getContent('products_filter_title', 'Filtrar por categoria:')}</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === 'all'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {getContent('products_filter_all', 'Todos')}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === category
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {getContent('products_list_title', 'Todos os Produtos')} ({filteredProducts.length})
                        </h2>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {getContent('products_cta_title', 'Não encontrou o que procura?')}
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        {getContent('products_cta_description', 'Entre em contato conosco e vamos ajudar você a encontrar o produto ideal para sua prática esportiva.')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            {getContent('products_cta_button_1', 'Fale Conosco')}
                        </button>
                        <button className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                            {getContent('products_cta_button_2', 'Seja um Parceiro')}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}