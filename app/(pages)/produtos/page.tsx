import { Metadata } from 'next';
import { productsData, getCategories } from '@/lib/products-data';
import ProductCard from '@/components/products/ProductCard';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Produtos - LeoSport',
    description: 'Descubra nossa ampla variedade de produtos esportivos de alta qualidade.',
    keywords: ['produtos esportivos', 'equipamentos esportivos', 'LeoSport produtos'],
};

export default function ProductsPage() {
    const categories = getCategories();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative text-white py-16 overflow-hidden">
                {/* Background Image */}
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
                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Nossos Produtos
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            Descubra nossa ampla variedade de produtos esportivos de alta qualidade
                        </p>

                        {/* Search and Filter Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
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
                        <h2 className="text-lg font-semibold text-gray-800">Filtrar por categoria:</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors">
                            Todos
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
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
                            Todos os Produtos ({productsData.length})
                        </h2>
                        <div className="flex items-center gap-4">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="relevance">Relevância</option>
                                <option value="price-low">Menor preço</option>
                                <option value="price-high">Maior preço</option>
                                <option value="name">Nome A-Z</option>
                                <option value="newest">Mais recentes</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productsData.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="text-center mt-12">
                        <button className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold">
                            Carregar Mais Produtos
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Não encontrou o que procura?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Entre em contato conosco e vamos ajudar você a encontrar o produto ideal para sua prática esportiva.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            Fale Conosco
                        </button>
                        <button className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                            Seja um Parceiro
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
