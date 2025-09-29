import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, ShoppingBag, Star } from 'lucide-react';

export default function InicioPage() {
  const featuredCategories = [
    { name: 'Futebol', image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400', products: 150 },
    { name: 'Basquete', image: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=400', products: 89 },
    { name: 'Tênis', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400', products: 200 },
    { name: 'Natação', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400', products: 67 },
  ];

  const stats = [
    { icon: Trophy, label: 'Produtos Disponíveis', value: '500+' },
    { icon: Users, label: 'Parceiros Ativos', value: '50+' },
    { icon: ShoppingBag, label: 'Pedidos Entregues', value: '1000+' },
    { icon: Star, label: 'Avaliação Média', value: '4.8' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bem-vindo à <span className="text-gray-400">LeoSport</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              O maior marketplace de produtos esportivos do Brasil. 
              Encontre tudo o que você precisa para sua prática esportiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gray-400 hover:bg-zinc-500 text-black">
                <Link href="/produtos">Explorar Produtos</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-stone-300">
                <Link href="/venda-na-leosport" className="text-black">Seja um Parceiro</Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorias em Destaque</h2>
          <p className="text-lg text-gray-600">Descubra produtos para seu esporte favorito</p>
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
              Pronto para começar sua jornada esportiva?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de atletas que já encontraram seus produtos ideais na LeoSport.
            </p>
            <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-950">
              <Link href="/produtos">Ver Todos os Produtos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}