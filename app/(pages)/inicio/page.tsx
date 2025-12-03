'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, ShoppingBag, Star } from 'lucide-react';
import Ondas from '@/components/onda/ondas';
import { useSiteContent } from '@/hooks/use-site-content';

export default function InicioPage() {
  const { getContent, loading } = useSiteContent();

  const featuredCategories = [
    { name: 'Futebol', image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400', products: 150 },
    { name: 'Basquete', image: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=400', products: 89 },
    { name: 'Tênis', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400', products: 200 },
    { name: 'Natação', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400', products: 67 },
  ];

  const stats = [
    { icon: Trophy, label: getContent('stats_products_label', 'Produtos Disponíveis'), value: getContent('stats_products_value', '500+') },
    { icon: Users, label: getContent('stats_partners_label', 'Parceiros Ativos'), value: getContent('stats_partners_value', '50+') },
    { icon: ShoppingBag, label: getContent('stats_orders_label', 'Pedidos Entregues'), value: getContent('stats_orders_value', '1000+') },
    { icon: Star, label: getContent('stats_rating_label', 'Avaliação Média'), value: getContent('stats_rating_value', '4.8') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Top Navigation Bar */}
      <nav className="flex items-center gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Removido: Botões Home, Produtos e Contato */}
        {/* Removido: Botões lado a lado: Entrar, Carrinho, Criar Conta */}
      </nav>

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/INICIO.jpg"
            alt="Sports Equipment on Grass"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{getContent('categories_title', 'Categorias em Destaque')}</h2>
          <p className="text-lg text-gray-600">{getContent('categories_subtitle', 'Descubra produtos para seu esporte favorito')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.products} produtos disponíveis</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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