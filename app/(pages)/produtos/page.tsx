'use client';

import { useState, useEffect } from 'react';
import { getProducts, getCoupons } from '@/lib/supabase';
import type { Product as SupabaseProduct } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductCard';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';
import { Loader2 } from 'lucide-react';
import { calculateDiscountedPrice } from '@/lib/utils';

// Função para converter produto do supabase ao formato para o ProductCard
function convertProduct(
  supabaseProduct: SupabaseProduct & { categories?: { name: string; slug: string } | null },
  discountInfo?: { discount_type?: string; discount_value?: string } | null
) {
  let width = '';
  let height = '';
  let color = '';
  let sport = '';

  if (supabaseProduct.dimensions) {
    // Suporta string "30x45x15" (LxAxP)
    const regex = /(\d+(?:[.,]\d+)?)[^\d]+(\d+(?:[.,]\d+)?)/;
    const match =
      typeof supabaseProduct.dimensions === 'string'
        ? supabaseProduct.dimensions.match(regex)
        : null;
    if (match) {
      width = match[1] || '';
      height = match[2] || '';
    }
  }
  // Os campos color e sport não existem no tipo Product.
  // Portanto, mantemos os valores como string vazia para evitar erro de tipo.

  const originalPrice = typeof supabaseProduct.price === 'number' ? supabaseProduct.price : 0;
  
  // Calcular preço com desconto se houver cupom ativo
  const discountCalculation = calculateDiscountedPrice(
    originalPrice,
    discountInfo?.discount_type,
    discountInfo?.discount_value
  );

  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    category: supabaseProduct.categories?.name ?? 'Sem categoria',
    price:
      originalPrice > 0
        ? `R$ ${originalPrice.toFixed(2).replace('.', ',')}`
        : 'R$ 0,00',
    discountedPrice: discountCalculation.hasDiscount
      ? `R$ ${discountCalculation.finalPrice.toFixed(2).replace('.', ',')}`
      : null,
    discountPercentage: discountCalculation.hasDiscount
      ? `${discountCalculation.discountPercentage}%`
      : null,
    imageUrl:
      supabaseProduct.image_url ||
      'https://placehold.co/400x400/e2e8f0/334155?text=Produto',
    description: supabaseProduct.description ?? '',
    stock: supabaseProduct.stock_quantity ?? 0,
    sku: supabaseProduct.sku ?? '',
    brand: supabaseProduct.brand ?? '',
    weight: supabaseProduct.weight ?? '',
    dimensions: supabaseProduct.dimensions ?? '',
    width,
    height,
    color,
    sport,
    status: supabaseProduct.status,
    relevance: "relevance" in supabaseProduct ? (supabaseProduct as any).relevance : 0,
  };
}

// UI auxiliar para mostrar um círculo de cor
function ColorBadge({ color }: { color: string }) {
  // Mapeamento de algumas cores
  const palette: Record<string, string> = {
    branco: '#fff',
    brancoNeve: '#fffdfa',
    brancoGelo: '#f8f9fa',
    azul: '#2563eb',
    marinho: '#1e293b',
    vermelho: '#dc2626',
    preto: '#18181b',
    cinza: '#64748b',
    amarelo: '#fde047',
    verde: '#22c55e',
    laranja: '#fb923c',
    roxo: '#a78bfa',
  };
  const hex = palette[color?.toLowerCase()] || color || '#e5e7eb';
  return (
    <span
      title={color}
      className="inline-block w-6 h-6 rounded-full border border-gray-300 mr-1 align-middle"
      style={{ background: hex }}
    ></span>
  );
}

export default function ProductsPage() {
  const { getContent, loading: contentLoading } = useSiteContent();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [widthRange, setWidthRange] = useState<[number, number]>([0, 0]);
  const [heightRange, setHeightRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState('relevance');

  // Para mostrar/esconder filtros em mobile
  const [showFilters, setShowFilters] = useState(false);

  // TESTE DE BASE: tenta buscar produtos; log de possível erro
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        
        // Buscar produtos e cupons ativos
        const [productsData, couponsData] = await Promise.all([
          getProducts(),
          getCoupons().catch(() => [])
        ]);

        if (!Array.isArray(productsData)) {
          console.error('getProducts não retornou um array:', productsData);
          setProducts([]);
          return;
        }

        // Encontrar cupom ativo (primeiro válido)
        const activeCoupon = Array.isArray(couponsData)
          ? couponsData.find((coupon: any) => {
              const today = new Date().toISOString().split('T')[0];
              return (
                coupon.status === 'Ativo' &&
                coupon.valid_from <= today &&
                coupon.valid_until >= today
              );
            })
          : null;

        // Só produtos ativos
        const activeProducts = productsData.filter((p) => p.status === 'Ativo');
        const prods = activeProducts.map((product: any) =>
          convertProduct(product, activeCoupon)
        );
        setProducts(prods);

        // Atualiza automatico min/max largura/altura
        if (prods.length) {
          const allWidths = prods.map((p) => parseFloat(p.width)).filter((v) => !isNaN(v));
          const allHeights = prods.map((p) => parseFloat(p.height)).filter((v) => !isNaN(v));
          if (allWidths.length)
            setWidthRange([Math.min(...allWidths), Math.max(...allWidths)]);
          if (allHeights.length)
            setHeightRange([Math.min(...allHeights), Math.max(...allHeights)]);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos (conexão/base?):', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
    // eslint-disable-next-line
  }, []);

  // Unicidade/categorias/filtros
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const sports = Array.from(new Set(products.map((p) => p.sport).filter(Boolean)));
  const colors = Array.from(new Set(products.map((p) => p.color).filter(Boolean)));

  // Range min/max real
  const minWidth = (() => {
    const values = products.map((p) => parseFloat(p.width)).filter((v) => !isNaN(v));
    return values.length ? Math.min(...values) : 0;
  })();
  const maxWidth = (() => {
    const values = products.map((p) => parseFloat(p.width)).filter((v) => !isNaN(v));
    return values.length ? Math.max(...values) : 0;
  })();
  const minHeight = (() => {
    const values = products.map((p) => parseFloat(p.height)).filter((v) => !isNaN(v));
    return values.length ? Math.min(...values) : 0;
  })();
  const maxHeight = (() => {
    const values = products.map((p) => parseFloat(p.height)).filter((v) => !isNaN(v));
    return values.length ? Math.max(...values) : 0;
  })();

  // Filtro combinando todas regras
  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        '');

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSport =
      selectedSport === 'all' ||
      (product.sport && product.sport === selectedSport);
    const matchesColor =
      selectedColor === 'all' ||
      (product.color && product.color === selectedColor);

    let matchesWidth = true;
    let matchesHeight = true;
    if (
      !isNaN(widthRange[0]) &&
      !isNaN(widthRange[1]) &&
      product.width !== ''
    ) {
      const w = parseFloat(product.width);
      matchesWidth = isNaN(w)
        ? true
        : w >= widthRange[0] && w <= widthRange[1];
    }
    if (
      !isNaN(heightRange[0]) &&
      !isNaN(heightRange[1]) &&
      product.height !== ''
    ) {
      const h = parseFloat(product.height);
      matchesHeight = isNaN(h)
        ? true
        : h >= heightRange[0] && h <= heightRange[1];
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSport &&
      matchesColor &&
      matchesWidth &&
      matchesHeight
    );
  });

  // Ordenação
  if (sortBy === 'relevance') {
    filteredProducts = filteredProducts.slice().sort(
      (a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)
    );
  } else if (sortBy === 'price_asc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => {
      const parsePrice = (valor: string) => {
        if (!valor) return 0;
        let n = valor.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
        return Number(n);
      };
      return parsePrice(a.price) - parsePrice(b.price);
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => {
      const parsePrice = (valor: string) => {
        if (!valor) return 0;
        let n = valor.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
        return Number(n);
      };
      return parsePrice(b.price) - parsePrice(a.price);
    });
  }

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
            src="/images/PRODUTOS.jpg"
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
              {getContent(
                'products_subtitle',
                'Descubra nossa ampla variedade de produtos esportivos de alta qualidade'
              )}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={getContent(
                    'products_search_placeholder',
                    'Buscar produtos...'
                  )}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 bg-white/90 text-gray-900 focus:ring-2 focus:ring-blue-300 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Botão exibido apenas em mobile/tablet para abrir lateral */}
          <div className="block md:hidden mb-4">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold shadow-sm"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>

          <div
            className={`
              ${showFilters ? 'block' : 'hidden'}
              md:grid md:grid-cols-12 md:gap-6
              mb-6 transition-all
            `}
          >
            {/* Filtros da esquerda (coluna para categoria/esporte/cor) */}
            <div className="md:col-span-4 xl:col-span-3 bg-gray-50 border rounded-xl p-4 shadow-sm mb-4 md:mb-0">

              {/* Categoria */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-blue-800" />
                  <h2 className="text-lg font-semibold text-blue-800">
                    {getContent('products_filter_title', 'Filtrar por categoria')}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150 ${
                      selectedCategory === 'all'
                        ? 'bg-blue-800 text-white border-blue-800'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {getContent('products_filter_all', 'Todos')}
                  </button>
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={String(category)}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150 ${
                        selectedCategory === category
                          ? 'bg-blue-800 text-white border-blue-800'
                          : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Esporte */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Esporte:
                </label>
                <div className="relative">
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="block w-full rounded-lg border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white px-3 py-2 text-blue-900"
                  >
                    <option value="all">Todos</option>
                    {sports.map((sport) => (
                      <option key={String(sport)} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cor */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Cor:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('all')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150 ${
                      selectedColor === 'all'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span className="inline-block w-5 h-5 rounded-full border border-gray-300 bg-white mr-0.5"></span>
                    Todas
                  </button>
                  {colors.map((color) => (
                    <button
                      key={String(color)}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150 ${
                        selectedColor === color
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <ColorBadge color={String(color)} />
                      {String(color)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtros da direita (largura/altura/ordenação), ocupa resto do espaço */}
            <div className="md:col-span-8 xl:col-span-9">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 bg-gray-50 border rounded-xl p-4 shadow-sm items-end">
                {/* Largura */}
                <div className="flex flex-col gap-1 mb-2 flex-1 max-w-xs">
                  <label className="text-sm font-medium text-blue-800">
                    Largura (cm):
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={minWidth}
                      max={maxWidth}
                      value={widthRange[0]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        setWidthRange([v, widthRange[1]]);
                      }}
                      className="w-20 rounded-lg border-blue-300 focus:ring-blue-500 px-2.5"
                    />
                    <span className="text-blue-900">à</span>
                    <input
                      type="number"
                      min={minWidth}
                      max={maxWidth}
                      value={widthRange[1]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        setWidthRange([widthRange[0], v]);
                      }}
                      className="w-20 rounded-lg border-blue-300 focus:ring-blue-500 px-2.5"
                    />
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    Mín: {minWidth} &nbsp; Máx: {maxWidth}
                  </div>
                </div>

                {/* Altura */}
                <div className="flex flex-col gap-1 mb-2 flex-1 max-w-xs">
                  <label className="text-sm font-medium text-blue-800">
                    Altura (cm):
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={minHeight}
                      max={maxHeight}
                      value={heightRange[0]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        setHeightRange([v, heightRange[1]]);
                      }}
                      className="w-20 rounded-lg border-blue-300 focus:ring-blue-500 px-2.5"
                    />
                    <span className="text-blue-900">à</span>
                    <input
                      type="number"
                      min={minHeight}
                      max={maxHeight}
                      value={heightRange[1]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        setHeightRange([heightRange[0], v]);
                      }}
                      className="w-20 rounded-lg border-blue-300 focus:ring-blue-500 px-2.5"
                    />
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    Mín: {minHeight} &nbsp; Máx: {maxHeight}
                  </div>
                </div>

                {/* Ordenação */}
                <div className="flex flex-col gap-1 mb-2 min-w-[130px]">
                  <label className="text-sm font-medium text-blue-800">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border-blue-300 focus:ring-blue-500 px-2.5 py-2 bg-white"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sempre mostrar filtros em desktop, mobile usando "md:grid" acima */}
          <div
            className={`
              ${showFilters ? 'hidden' : ''}
              md:hidden
              mb-4
            `}
          ></div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {getContent('products_list_title', 'Todos os Produtos')} (
              {filteredProducts.length})
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
            {getContent(
              'products_cta_title',
              'Não encontrou o que procura?'
            )}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {getContent(
              'products_cta_description',
              'Entre em contato conosco e vamos ajudar você a encontrar o produto ideal para sua prática esportiva.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {getContent('products_cta_button_1', 'Fale Conosco')}
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              {getContent('products_cta_button_2', 'Seja um Parceiro')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}