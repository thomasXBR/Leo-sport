'use client';

import { useState, useEffect } from 'react';
import { getProducts, getCoupons } from '@/lib/supabase';
import type { Product as SupabaseProduct } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductCard';
import { Search, Filter } from 'lucide-react';
import Image from 'next/image';
import { useSiteImages } from '@/hooks/use-site-images';
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
  let color = (supabaseProduct as any).color || '';
  let sport = supabaseProduct.categories?.name || '';

  // Priorizar campos width/height diretos, depois tentar extrair de dimensions
  // Width
  if ((supabaseProduct as any).width !== undefined && (supabaseProduct as any).width !== null) {
    const w = (supabaseProduct as any).width;
    width = typeof w === 'number' ? String(w) : (typeof w === 'string' && w.trim() ? w.trim() : '');
  } else if (supabaseProduct.dimensions) {
    // Suporta string "30x45x15" (LxAxP) ou "30 x 45 x 15"
    const regex = /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/;
    const match =
      typeof supabaseProduct.dimensions === 'string'
        ? supabaseProduct.dimensions.match(regex)
        : null;
    if (match && match[1]) {
      width = match[1].replace(',', '.');
    }
  }

  // Height
  if ((supabaseProduct as any).height !== undefined && (supabaseProduct as any).height !== null) {
    const h = (supabaseProduct as any).height;
    height = typeof h === 'number' ? String(h) : (typeof h === 'string' && h.trim() ? h.trim() : '');
  } else if (supabaseProduct.dimensions && !height) {
    // Se ainda não tem height, tenta extrair de dimensions
    const regex = /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/;
    const match =
      typeof supabaseProduct.dimensions === 'string'
        ? supabaseProduct.dimensions.match(regex)
        : null;
    if (match && match[2]) {
      height = match[2].replace(',', '.');
    }
  }

  const originalPrice = typeof supabaseProduct.price === 'number' ? supabaseProduct.price : 0;
  const fakePrice = typeof supabaseProduct.fake_price === 'number' ? supabaseProduct.fake_price : 0;
  
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
    // IMPORTANTE: Retornar price como NÚMERO, não string
    price: originalPrice > 0 ? originalPrice : 0,
    // Retornar fake_price como NÚMERO
    fake_price: fakePrice > 0 ? fakePrice : undefined,
    discountedPrice: discountCalculation.hasDiscount
      ? `R$ ${discountCalculation.finalPrice.toFixed(2).replace('.', ',')}`
      : null,
    discountPercentage: discountCalculation.hasDiscount
      ? `${discountCalculation.discountPercentage}%`
      : null,
    image_url:
      supabaseProduct.image_url ||
      'https://placehold.co/400x400/e2e8f0/334155?text=Produto',
    imageUrl:
      supabaseProduct.image_url ||
      'https://placehold.co/400x400/e2e8f0/334155?text=Produto',
    description: supabaseProduct.description ?? '',
    stock: supabaseProduct.stock_quantity ?? 0,
    stock_quantity: supabaseProduct.stock_quantity ?? 0,
    sku: supabaseProduct.sku ?? '',
    brand: supabaseProduct.brand ?? '',
    weight: supabaseProduct.weight ?? '',
    dimensions: supabaseProduct.dimensions ?? '',
    width,
    height,
    color,
    sport,
    status: supabaseProduct.status,
    relevance: (supabaseProduct as any).relevance ?? 0,
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
  const { getImage } = useSiteImages();
  const { getContent, loading: contentLoading } = useSiteContent();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [widthRange, setWidthRange] = useState<[number, number]>([0, 0]);
  const [heightRange, setHeightRange] = useState<[number, number]>([0, 0]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [widthRangeInitialized, setWidthRangeInitialized] = useState(false);
  const [heightRangeInitialized, setHeightRangeInitialized] = useState(false);
  const [priceRangeInitialized, setPriceRangeInitialized] = useState(false);
  const [widthRangeUserModified, setWidthRangeUserModified] = useState(false);
  const [heightRangeUserModified, setHeightRangeUserModified] = useState(false);
  const [priceRangeUserModified, setPriceRangeUserModified] = useState(false);
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

        // Atualiza automatico min/max largura/altura/preço
        if (prods.length) {
          // Width: converter string para número, tratando vírgula como separador decimal
          const allWidths = prods
            .map((p) => {
              if (!p.width || p.width === '') return null;
              const num = parseFloat(String(p.width).replace(',', '.'));
              return !isNaN(num) && num > 0 ? num : null;
            })
            .filter((v): v is number => v !== null);
          
          // Height: converter string para número, tratando vírgula como separador decimal
          const allHeights = prods
            .map((p) => {
              if (!p.height || p.height === '') return null;
              const num = parseFloat(String(p.height).replace(',', '.'));
              return !isNaN(num) && num > 0 ? num : null;
            })
            .filter((v): v is number => v !== null);
          
          // Price: já é número
          const allPrices = prods
            .map((p) => p.price ?? 0)
            .filter((v) => v > 0);
          
          if (allWidths.length > 0) {
            const minW = Math.min(...allWidths);
            const maxW = Math.max(...allWidths);
            setWidthRange([minW, maxW]);
            setWidthRangeInitialized(true);
          }
          
          if (allHeights.length > 0) {
            const minH = Math.min(...allHeights);
            const maxH = Math.max(...allHeights);
            setHeightRange([minH, maxH]);
            setHeightRangeInitialized(true);
          }
          
          if (allPrices.length > 0) {
            const minP = Math.min(...allPrices);
            const maxP = Math.max(...allPrices);
            setPriceRange([minP, maxP]);
            setPriceRangeInitialized(true);
          }
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

  // Range min/max real - calculado dos produtos filtrados
  const minWidth = (() => {
    const values = products
      .map((p) => {
        if (!p.width || p.width === '') return null;
        const num = parseFloat(String(p.width).replace(',', '.'));
        return !isNaN(num) && num > 0 ? num : null;
      })
      .filter((v): v is number => v !== null);
    return values.length ? Math.min(...values) : 0;
  })();
  const maxWidth = (() => {
    const values = products
      .map((p) => {
        if (!p.width || p.width === '') return null;
        const num = parseFloat(String(p.width).replace(',', '.'));
        return !isNaN(num) && num > 0 ? num : null;
      })
      .filter((v): v is number => v !== null);
    return values.length ? Math.max(...values) : 0;
  })();
  const minHeight = (() => {
    const values = products
      .map((p) => {
        if (!p.height || p.height === '') return null;
        const num = parseFloat(String(p.height).replace(',', '.'));
        return !isNaN(num) && num > 0 ? num : null;
      })
      .filter((v): v is number => v !== null);
    return values.length ? Math.min(...values) : 0;
  })();
  const maxHeight = (() => {
    const values = products
      .map((p) => {
        if (!p.height || p.height === '') return null;
        const num = parseFloat(String(p.height).replace(',', '.'));
        return !isNaN(num) && num > 0 ? num : null;
      })
      .filter((v): v is number => v !== null);
    return values.length ? Math.max(...values) : 0;
  })();
  const minPrice = (() => {
    const values = products.map((p) => p.price ?? 0).filter((v) => v > 0);
    return values.length ? Math.min(...values) : 0;
  })();
  const maxPrice = (() => {
    const values = products.map((p) => p.price ?? 0).filter((v) => v > 0);
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
    let matchesPrice = true;
    
    // Filtro de largura: só aplica se o usuário modificou o range
    if (widthRangeUserModified && widthRangeInitialized && !isNaN(widthRange[0]) && !isNaN(widthRange[1]) && widthRange[0] > 0 && widthRange[1] > 0) {
      if (product.width && product.width !== '') {
        const w = parseFloat(String(product.width).replace(',', '.'));
        matchesWidth = !isNaN(w) && w >= widthRange[0] && w <= widthRange[1];
      } else {
        matchesWidth = false;
      }
    }
    
    // Filtro de altura: só aplica se o usuário modificou o range
    if (heightRangeUserModified && heightRangeInitialized && !isNaN(heightRange[0]) && !isNaN(heightRange[1]) && heightRange[0] > 0 && heightRange[1] > 0) {
      if (product.height && product.height !== '') {
        const h = parseFloat(String(product.height).replace(',', '.'));
        matchesHeight = !isNaN(h) && h >= heightRange[0] && h <= heightRange[1];
      } else {
        matchesHeight = false;
      }
    }
    
    // Filtro de preço: só aplica se o usuário modificou o range
    if (priceRangeUserModified && priceRangeInitialized && !isNaN(priceRange[0]) && !isNaN(priceRange[1]) && priceRange[0] > 0 && priceRange[1] > 0) {
      const p = product.price ?? 0;
      matchesPrice = p >= priceRange[0] && p <= priceRange[1];
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSport &&
      matchesColor &&
      matchesWidth &&
      matchesHeight &&
      matchesPrice
    );
  });

  // Ordenação
  if (sortBy === 'relevance') {
    filteredProducts = filteredProducts.slice().sort(
      (a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)
    );
  } else if (sortBy === 'price_asc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => {
      return (a.price ?? 0) - (b.price ?? 0);
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => {
      return (b.price ?? 0) - (a.price ?? 0);
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
            src={getImage('produtos_background', '/images/PRODUTOS.jpg')}
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
      <section className="py-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Botão exibido apenas em mobile/tablet para abrir lateral */}
          <div className="block md:hidden mb-4">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
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
            <div className="md:col-span-4 xl:col-span-3 bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl p-6 shadow-2xl mb-4 md:mb-0 relative overflow-hidden">
              {/* Decoração de fundo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-2xl"></div>
              <div className="relative z-10">

                {/* Categoria */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {getContent('products_filter_title', 'Filtrar por categoria')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-lg ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xl scale-105 transform'
                          : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {getContent('products_filter_all', 'Todos')}
                    </button>
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={String(category)}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-lg ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xl scale-105 transform'
                            : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Esporte */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-gray-800 mb-3">
                    <span className="text-xl">⚽</span> Esporte
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="block w-full rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm px-4 py-3 text-gray-700 font-semibold shadow-lg transition-all hover:shadow-xl hover:border-indigo-400"
                    >
                      <option value="all">Todos os esportes</option>
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
                  <label className="flex items-center gap-2 text-sm font-extrabold text-gray-800 mb-3">
                    <span className="text-xl">🎨</span> Cor
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedColor('all')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-lg ${
                        selectedColor === 'all'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xl scale-105'
                          : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-400 bg-white shadow-inner"></span>
                      Todas
                    </button>
                    {colors.map((color) => (
                      <button
                        key={String(color)}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-lg ${
                          selectedColor === color
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xl scale-105'
                            : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        <ColorBadge color={String(color)} />
                        {String(color)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros da direita (largura/altura/preço/ordenação), ocupa resto do espaço */}
            <div className="md:col-span-8 xl:col-span-9">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Decoração de fundo */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                {/* Largura */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-white to-indigo-50/50 rounded-xl p-4 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <label className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📏</span> 
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Largura (cm)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={minWidth || 0}
                      max={maxWidth || 1000}
                      value={widthRange[0] || ''}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (isNaN(v) || v < (minWidth || 0)) v = minWidth || 0;
                        if (v > (maxWidth || 0)) v = maxWidth || 0;
                        if (v > widthRange[1]) {
                          setWidthRange([v, v]);
                        } else {
                          setWidthRange([v, widthRange[1]]);
                        }
                        setWidthRangeUserModified(true);
                      }}
                      placeholder={minWidth > 0 ? String(minWidth) : '0'}
                      className="w-24 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                    />
                    <span className="text-gray-600 font-semibold">à</span>
                    <input
                      type="number"
                      min={minWidth || 0}
                      max={maxWidth || 1000}
                      value={widthRange[1] || ''}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (isNaN(v) || v < (minWidth || 0)) v = minWidth || 0;
                        if (v > (maxWidth || 0)) v = maxWidth || 0;
                        if (v < widthRange[0]) {
                          setWidthRange([v, v]);
                        } else {
                          setWidthRange([widthRange[0], v]);
                        }
                        setWidthRangeUserModified(true);
                      }}
                      placeholder={maxWidth > 0 ? String(maxWidth) : '0'}
                      className="w-24 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                    />
                  </div>
                  {minWidth > 0 || maxWidth > 0 ? (
                    <div className="text-xs text-indigo-700 mt-2 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                      Mín: <span className="text-indigo-900">{minWidth.toFixed(1)}</span> cm &nbsp; • &nbsp; Máx: <span className="text-indigo-900">{maxWidth.toFixed(1)}</span> cm
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic mt-2 bg-gray-50 px-2 py-1 rounded-lg">
                      ⚠️ Sem produtos com largura cadastrada
                    </div>
                  )}
                </div>

                {/* Altura */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-white to-purple-50/50 rounded-xl p-4 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <label className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📐</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Altura (cm)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={minHeight || 0}
                      max={maxHeight || 1000}
                      value={heightRange[0] || ''}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (isNaN(v) || v < (minHeight || 0)) v = minHeight || 0;
                        if (v > (maxHeight || 0)) v = maxHeight || 0;
                        if (v > heightRange[1]) {
                          setHeightRange([v, v]);
                        } else {
                          setHeightRange([v, heightRange[1]]);
                        }
                        setHeightRangeUserModified(true);
                      }}
                      placeholder={minHeight > 0 ? String(minHeight) : '0'}
                      className="w-24 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                    />
                    <span className="text-gray-600 font-semibold">à</span>
                    <input
                      type="number"
                      min={minHeight || 0}
                      max={maxHeight || 1000}
                      value={heightRange[1] || ''}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (isNaN(v) || v < (minHeight || 0)) v = minHeight || 0;
                        if (v > (maxHeight || 0)) v = maxHeight || 0;
                        if (v < heightRange[0]) {
                          setHeightRange([v, v]);
                        } else {
                          setHeightRange([heightRange[0], v]);
                        }
                        setHeightRangeUserModified(true);
                      }}
                      placeholder={maxHeight > 0 ? String(maxHeight) : '0'}
                      className="w-24 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                    />
                  </div>
                  {minHeight > 0 || maxHeight > 0 ? (
                    <div className="text-xs text-purple-700 mt-2 font-bold bg-purple-50 px-2 py-1 rounded-lg">
                      Mín: <span className="text-purple-900">{minHeight.toFixed(1)}</span> cm &nbsp; • &nbsp; Máx: <span className="text-purple-900">{maxHeight.toFixed(1)}</span> cm
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic mt-2 bg-gray-50 px-2 py-1 rounded-lg">
                      ⚠️ Sem produtos com altura cadastrada
                    </div>
                  )}
                </div>

                {/* Preço */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-white to-green-50/50 rounded-xl p-4 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <label className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Preço (R$)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input
                        type="number"
                        min={minPrice || 0}
                        max={maxPrice || 100000}
                        step="0.01"
                        value={priceRange[0] || ''}
                        onChange={(e) => {
                          let v = Number(e.target.value);
                          if (isNaN(v) || v < (minPrice || 0)) v = minPrice || 0;
                          if (v > (maxPrice || 0)) v = maxPrice || 0;
                          if (v > priceRange[1]) {
                            setPriceRange([v, v]);
                          } else {
                            setPriceRange([v, priceRange[1]]);
                          }
                          setPriceRangeUserModified(true);
                        }}
                        placeholder={minPrice > 0 ? minPrice.toFixed(2) : '0,00'}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                      />
                    </div>
                    <span className="text-gray-600 font-semibold">à</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input
                        type="number"
                        min={minPrice || 0}
                        max={maxPrice || 100000}
                        step="0.01"
                        value={priceRange[1] || ''}
                        onChange={(e) => {
                          let v = Number(e.target.value);
                          if (isNaN(v) || v < (minPrice || 0)) v = minPrice || 0;
                          if (v > (maxPrice || 0)) v = maxPrice || 0;
                          if (v < priceRange[0]) {
                            setPriceRange([v, v]);
                          } else {
                            setPriceRange([priceRange[0], v]);
                          }
                          setPriceRangeUserModified(true);
                        }}
                        placeholder={maxPrice > 0 ? maxPrice.toFixed(2) : '0,00'}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400 bg-white/90"
                      />
                    </div>
                  </div>
                  {minPrice > 0 || maxPrice > 0 ? (
                    <div className="text-xs text-green-700 mt-2 font-bold bg-green-50 px-2 py-1 rounded-lg">
                      Mín: <span className="text-green-900">R$ {minPrice.toFixed(2).replace('.', ',')}</span> &nbsp; • &nbsp; Máx: <span className="text-green-900">R$ {maxPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic mt-2 bg-gray-50 px-2 py-1 rounded-lg">
                      ⚠️ Sem produtos com preço cadastrado
                    </div>
                  )}
                </div>

                {/* Ordenação */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-white to-cyan-50/50 rounded-xl p-4 border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <label className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🔀</span>
                    <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Ordenar por</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-700 font-bold shadow-md transition-all hover:shadow-lg hover:border-indigo-400"
                  >
                    <option value="relevance">⭐ Relevância</option>
                    <option value="price_asc">💰 Menor preço</option>
                    <option value="price_desc">💎 Maior preço</option>
                  </select>
                </div>
                </div>
              </div>
              
              {/* Botão para resetar filtros */}
              {(selectedCategory !== 'all' || selectedSport !== 'all' || selectedColor !== 'all' || 
                widthRangeUserModified || heightRangeUserModified || priceRangeUserModified ||
                searchTerm !== '') && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSport('all');
                      setSelectedColor('all');
                      if (widthRangeInitialized) {
                        setWidthRange([minWidth, maxWidth]);
                        setWidthRangeUserModified(false);
                      }
                      if (heightRangeInitialized) {
                        setHeightRange([minHeight, maxHeight]);
                        setHeightRangeUserModified(false);
                      }
                      if (priceRangeInitialized) {
                        setPriceRange([minPrice, maxPrice]);
                        setPriceRangeUserModified(false);
                      }
                      setSortBy('relevance');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl border-2 border-transparent transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🔄 Limpar Filtros
                  </button>
                </div>
              )}
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
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSport('all');
                    setSelectedColor('all');
                    setSearchTerm('');
                    if (widthRangeInitialized) {
                      setWidthRange([minWidth, maxWidth]);
                      setWidthRangeUserModified(false);
                    }
                    if (heightRangeInitialized) {
                      setHeightRange([minHeight, maxHeight]);
                      setHeightRangeUserModified(false);
                    }
                    if (priceRangeInitialized) {
                      setPriceRange([minPrice, maxPrice]);
                      setPriceRangeUserModified(false);
                    }
                    setSortBy('relevance');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🔄 Limpar Todos os Filtros
                </button>
              </div>
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