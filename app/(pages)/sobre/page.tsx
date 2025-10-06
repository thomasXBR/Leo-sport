import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, Users, Award } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre a LeoSport',
  description: 'Conheça a LeoSport e nosso compromisso com o esporte.',
  keywords: ['LeoSport', 'Sobre a LeoSport', 'Compromisso com o esporte'],
};

export default function SobrePage() {


  const values = [
    {
      icon: Target,
      title: 'Foco no Cliente',
      description: 'Priorizamos sempre a satisfação e experiência do nosso cliente.'
    },
    {
      icon: Heart,
      title: 'Paixão pelo Esporte',
      description: 'Vivemos e respiramos esporte, entendemos as necessidades dos atletas.'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Construímos uma comunidade forte de atletas e parceiros.'
    },
    {
      icon: Award,
      title: 'Qualidade',
      description: 'Oferecemos apenas produtos de alta qualidade e parceiros confiáveis.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a LeoSport
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Nascemos da paixão pelo esporte e do desejo de conectar atletas
              aos melhores produtos e parceiros do mercado brasileiro.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                A LeoSport nasceu em 2024 com uma missão clara: democratizar o acesso
                a produtos esportivos de qualidade em todo o Brasil. Fundada por Leo,
                um apaixonado por esportes e tecnologia, a plataforma surgiu da necessidade
                de conectar pequenos e médios vendedores especializados com atletas de todo o país.
              </p>
              <p>
                Começamos como uma pequena iniciativa local e rapidamente crescemos para
                nos tornar uma das principais plataformas de marketplace esportivo do Brasil,
                sempre mantendo nosso compromisso com a qualidade e o atendimento personalizado.
              </p>
              <p>
                Hoje, orgulhosamente conectamos centenas de parceiros vendedores com
                milhares de clientes, oferecendo desde equipamentos básicos até produtos
                profissionais para atletas de alto rendimento.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Equipe LeoSport"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-lg text-gray-600">
              Os princípios que guiam cada decisão na LeoSport
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed pb-10">
            Facilitar o acesso a produtos esportivos de qualidade, conectando atletas
            e entusiastas do esporte com os melhores parceiros vendedores do Brasil,
            promovendo um ecossistema saudável e sustentável para o crescimento do
            esporte nacional.
          </p>
        </div>
      </section>
    </div>
  );
}