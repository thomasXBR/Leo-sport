'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Store, TrendingUp, Users, Shield } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';
import { useSiteImages } from '@/hooks/use-site-images';

export default function VendaNaLeoSportPage() {
  const { getContent, loading } = useSiteContent();
  const { getImage } = useSiteImages();
  const [activeForm, setActiveForm] = useState<'fornecedor' | 'representante'>('fornecedor');
  const [formData, setFormData] = useState({
    // Campos comuns
    nome: '',
    email: '',
    telefone: '',

    // Campos específicos para Fornecedor
    nomeEmpresa: '',
    anosMercado: '',
    oQueFabrica: '',
    canaisVendaAtuais: '',

    // Campos específicos para Representante
    localAtuacao: '',
    produtoRevender: '',
    estrategiasVenda: ''
  });

  const benefits = [
    {
      icon: Store,
      title: getContent('benefit_vitrine_title', 'Vitrine Digital'),
      description: getContent('benefit_vitrine_description', 'Tenha sua própria vitrine em uma plataforma consolidada')
    },
    {
      icon: TrendingUp,
      title: getContent('benefit_vendas_title', 'Aumento de Vendas'),
      description: getContent('benefit_vendas_description', 'Acesse milhares de clientes em potencial')
    },
    {
      icon: Users,
      title: getContent('benefit_suporte_title', 'Suporte Dedicado'),
      description: getContent('benefit_suporte_description', 'Equipe especializada para ajudar no seu crescimento')
    },
    {
      icon: Shield,
      title: getContent('benefit_seguranca_title', 'Segurança'),
      description: getContent('benefit_seguranca_description', 'Transações seguras e proteção contra fraudes')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement partner application submission
    console.log('Partner application submitted:', {
      formType: activeForm,
      data: formData
    });
    alert(`Solicitação de ${activeForm === 'fornecedor' ? 'Fornecedor' : 'Representante'} enviada com sucesso! Entraremos em contato em breve.`);

    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      nomeEmpresa: '',
      anosMercado: '',
      oQueFabrica: '',
      canaisVendaAtuais: '',
      localAtuacao: '',
      produtoRevender: '',
      estrategiasVenda: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormTypeChange = (type: 'fornecedor' | 'representante') => {
    setActiveForm(type);

    // Limpar campos específicos quando mudar de tipo
    if (type === 'fornecedor') {
      setFormData(prev => ({
        ...prev,
        localAtuacao: '',
        produtoRevender: '',
        estrategiasVenda: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        nomeEmpresa: '',
        anosMercado: '',
        oQueFabrica: '',
        canaisVendaAtuais: ''
      }));
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getImage('venda_background', '/images/VENDA.jpg')}
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
              {getContent('seller_title', 'Venda na LeoSport')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              {getContent('seller_hero_description', 'Junte-se aos nossos parceiros e expanda seu negócio no maior marketplace esportivo do Brasil.')}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-300" />
              <span className="text-blue-100">{getContent('seller_free_signup', 'Cadastro gratuito')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getContent('seller_benefits_title', 'Por que vender na LeoSport?')}
          </h2>
          <p className="text-lg text-gray-600">
            {getContent('seller_benefits_subtitle', 'Oferecemos tudo que você precisa para fazer seu negócio crescer')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{getContent('seller_form_title', 'Solicitar Parceria')}</CardTitle>
            <p className="text-gray-600 text-center">
              {getContent('seller_form_subtitle', 'Preencha o formulário abaixo e nossa equipe entrará em contato')}
            </p>

            {/* Choice Chips */}
            <div className="flex justify-center mt-6">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => handleFormTypeChange('fornecedor')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${activeForm === 'fornecedor'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Fornecedor
                </button>
                <button
                  onClick={() => handleFormTypeChange('representante')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${activeForm === 'representante'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Representante
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeForm === 'fornecedor' ? (
                <>
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeEmpresa">Nome da empresa *</Label>
                    <Input
                      id="nomeEmpresa"
                      value={formData.nomeEmpresa}
                      onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                      placeholder="Nome da sua empresa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anosMercado">Quantos anos está no mercado? *</Label>
                    <Input
                      id="anosMercado"
                      type="number"
                      value={formData.anosMercado}
                      onChange={(e) => handleInputChange('anosMercado', e.target.value)}
                      placeholder="Ex: 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oQueFabrica">O que fabrica? *</Label>
                    <Textarea
                      id="oQueFabrica"
                      value={formData.oQueFabrica}
                      onChange={(e) => handleInputChange('oQueFabrica', e.target.value)}
                      placeholder="Descreva os produtos que sua empresa fabrica..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canaisVendaAtuais">Como já vende o item (canais de venda atuais) *</Label>
                    <Textarea
                      id="canaisVendaAtuais"
                      value={formData.canaisVendaAtuais}
                      onChange={(e) => handleInputChange('canaisVendaAtuais', e.target.value)}
                      placeholder="Ex: Loja física, e-commerce próprio, revendedores, marketplaces..."
                      rows={4}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Informações sobre a Atuação</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localAtuacao">De que local é (área de atuação)? *</Label>
                    <Textarea
                      id="localAtuacao"
                      value={formData.localAtuacao}
                      onChange={(e) => handleInputChange('localAtuacao', e.target.value)}
                      placeholder="Ex: São Paulo, SP - Região Metropolitana"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="produtoRevender">Qual produto quer revender? *</Label>
                    <Textarea
                      id="produtoRevender"
                      value={formData.produtoRevender}
                      onChange={(e) => handleInputChange('produtoRevender', e.target.value)}
                      placeholder="Descreva os produtos que deseja revender..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estrategiasVenda">Como pretende vender? (canais e estratégias que planeja usar para vender os produtos) *</Label>
                    <Textarea
                      id="estrategiasVenda"
                      value={formData.estrategiasVenda}
                      onChange={(e) => handleInputChange('estrategiasVenda', e.target.value)}
                      placeholder="Ex: Redes sociais, loja física, venda direta, nicho específico, eventos esportivos..."
                      rows={4}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950" size="lg">
                Enviar Solicitação de Parceria
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Process Steps */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{getContent('seller_process_title', 'Como Funciona')}</h2>
            <p className="text-lg text-gray-600">{getContent('seller_process_subtitle', 'Processo simples em 4 etapas')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: getContent('process_step_1_title', 'Cadastro'), description: getContent('process_step_1_description', 'Preencha o formulário com suas informações') },
              { step: '2', title: getContent('process_step_2_title', 'Análise'), description: getContent('process_step_2_description', 'Nossa equipe avalia sua solicitação') },
              { step: '3', title: getContent('process_step_3_title', 'Aprovação'), description: getContent('process_step_3_description', 'Você recebe a confirmação por e-mail') },
              { step: '4', title: getContent('process_step_4_title', 'Vendas'), description: getContent('process_step_4_description', 'Comece a vender seus produtos') }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}