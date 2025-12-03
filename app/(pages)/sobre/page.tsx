'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, Users, Award } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';

export default function SobrePage() {
  const { getContent, loading } = useSiteContent();

  const values = [
    {
      icon: Target,
      title: getContent('value_focus_title', 'Foco no Cliente'),
      description: getContent('value_focus_description', 'Priorizamos sempre a satisfação e experiência do nosso cliente.')
    },
    {
      icon: Heart,
      title: getContent('value_passion_title', 'Paixão pelo Esporte'),
      description: getContent('value_passion_description', 'Vivemos e respiramos esporte, entendemos as necessidades dos atletas.')
    },
    {
      icon: Users,
      title: getContent('value_community_title', 'Comunidade'),
      description: getContent('value_community_description', 'Construímos uma comunidade forte de atletas e parceiros.')
    },
    {
      icon: Award,
      title: getContent('value_quality_title', 'Qualidade'),
      description: getContent('value_quality_description', 'Oferecemos apenas produtos de alta qualidade e parceiros confiáveis.')
    }
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
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/SOBRE.jpg"
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getContent('about_title', 'Sobre a LeoSport')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {getContent('about_hero_description', 'Nascemos da paixão pelo esporte e do desejo de conectar atletas aos melhores produtos e parceiros do mercado brasileiro.')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{getContent('about_story_title', 'Nossa História')}</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                {getContent('about_story_paragraph_1', 'A LeoSport nasceu em 2024 com uma missão clara: democratizar o acesso a produtos esportivos de qualidade em todo o Brasil.')}
              </p>
              <p>
                {getContent('about_story_paragraph_2', 'Começamos como uma pequena iniciativa local e rapidamente crescemos para nos tornar uma das principais plataformas de marketplace esportivo do Brasil.')}
              </p>
              <p>
                {getContent('about_story_paragraph_3', 'Hoje, orgulhosamente conectamos centenas de parceiros vendedores com milhares de clientes, oferecendo desde equipamentos básicos até produtos profissionais para atletas de alto rendimento.')}
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Equipe LeoSport"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{getContent('about_values_title', 'Nossos Valores')}</h2>
            <p className="text-lg text-gray-600">
              {getContent('about_values_subtitle', 'Os princípios que guiam cada decisão na LeoSport')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <value.icon className="w-8 h-8 text-blue-900" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{getContent('about_mission_title', 'Nossa Missão')}</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed pb-10">
            {getContent('about_mission_description', 'Facilitar o acesso a produtos esportivos de qualidade, conectando atletas e entusiastas do esporte com os melhores parceiros vendedores do Brasil, promovendo um ecossistema saudável e sustentável para o crescimento do esporte nacional.')}
          </p>
        </div>
      </section>
    </div>
  );
}