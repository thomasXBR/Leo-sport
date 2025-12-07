'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Users, ShoppingBag, Star } from 'lucide-react';
import { useSiteContent } from '@/hooks/use-site-content';
import { useSiteImages } from '@/hooks/use-site-images';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductCard';

type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  fake_price?: number;
  sales_count?: number;
  status?: string;
  stock_quantity?: number;
  [key: string]: any;
};

export default function InicioPage() {
  const { getContent, loading } = useSiteContent();
  const { getImage } = useSiteImages();

  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function fetchBestSellers() {
      setProductsLoading(true);
      try {
        // Primeira tentativa: buscar produtos ordenados por sales_count se a coluna existir
        let { data, error } = await supabase
          .from('products')
          .select('id,name,image_url,price,fake_price,sales_count,status,stock_quantity')
          .eq('status', 'Ativo')
          .order('sales_count', { ascending: false, nullsFirst: false })
          .limit(4);

        // Se der erro ou não houver dados, tentar busca alternativa
        if (error || !data || data.length === 0) {
          // Buscar produtos ativos com estoque, ordenados por data de criação
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .select('id,name,image_url,price,fake_price,status,stock_quantity')
            .eq('status', 'Ativo')
            .gt('stock_quantity', 0)
            .order('created_at', { ascending: false })
            .limit(4);

          if (!fallbackError && fallbackData && fallbackData.length > 0) {
            setBestSellers(fallbackData);
          }
        } else {
          // Filtrar produtos sem imagem antes de definir
          const validProducts = data.filter(p => p.image_url && p.name);
          setBestSellers(validProducts);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos mais vendidos:', err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchBestSellers();
  }, []);

  const stats = [
    { icon: Trophy, label: getContent('stats_products_label', 'Produtos Disponíveis'), value: getContent('stats_products_value', '500+') },
    { icon: Users, label: getContent('stats_partners_label', 'Parceiros Ativos'), value: getContent('stats_partners_value', '50+') },
    { icon: ShoppingBag, label: getContent('stats_orders_label', 'Pedidos Entregues'), value: getContent('stats_orders_value', '1000+') },
    { icon: Star, label: getContent('stats_rating_label', 'Avaliação Média'), value: getContent('stats_rating_value', '4.8') },
  ];

  // Removido o bloqueio de loading - o site agora carrega com valores padrão
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[520px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getImage('hero_background', '/images/INICIO.jpg')}
            alt="Sports Equipment on Grass"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {getContent('hero_title', 'Bem-vindo à')}{' '}
              <span className="text-blue-900 [text-shadow:_0_0_10px_#fff,_0_0_20px_#fff,_0_0_30px_#fff]">
                {getContent('hero_title_accent', 'LeoSport')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {getContent('hero_subtitle', 'O maior marketplace de produtos esportivos do Brasil.')}
              <br />
              {getContent('hero_description', 'Encontre tudo o que você precisa para sua prática esportiva.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-950 text-white">
                <Link href={getContent('hero_button_1_link', '/sobre')}>
                  {getContent('hero_button_1_text', 'Conheça a LeoSport')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-black bg-white hover:bg-zinc-400">
                <Link href={getContent('hero_button_2_link', '/venda-na-leosport')}>
                  {getContent('hero_button_2_text', 'Seja um Parceiro')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-blue-900" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIS VENDIDOS - Produtos em destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getContent('bestsellers_title', 'Mais Vendidos')}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {getContent('bestsellers_subtitle', 'Confira os produtos mais vendidos na LeoSport')}
          </p>
        </div>
        {productsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {getContent('bestsellers_empty', 'Nenhum produto encontrado no momento.')}
            </p>
            <Button asChild className="bg-blue-900 hover:bg-blue-950">
              <Link href="/produtos">
                Ver todos os produtos
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showStock={false}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
                <Link href="/produtos">
                  Ver todos os produtos
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getContent('cta_title', 'Pronto para começar sua jornada esportiva?')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {getContent('cta_description', 'Junte-se a milhares de atletas que já encontraram seus produtos ideais na LeoSport.')}
            </p>
            <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-950">
              <Link href={getContent('cta_button_link', '/contato')}>
                {getContent('cta_button_text', 'Entre em Contato')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}