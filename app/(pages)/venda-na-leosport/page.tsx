'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Store, TrendingUp, Users, Shield } from 'lucide-react';

export default function VendaNaLeoSportPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessDescription: '',
    experience: '',
    productCategories: ''
  });

  const benefits = [
    {
      icon: Store,
      title: 'Vitrine Digital',
      description: 'Tenha sua própria vitrine em uma plataforma consolidada'
    },
    {
      icon: TrendingUp,
      title: 'Aumento de Vendas',
      description: 'Acesse milhares de clientes em potencial'
    },
    {
      icon: Users,
      title: 'Suporte Dedicado',
      description: 'Equipe especializada para ajudar no seu crescimento'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Transações seguras e proteção contra fraudes'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement partner application submission
    console.log('Partner application submitted:', formData);
    alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Venda na LeoSport
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Junte-se aos nossos parceiros e expanda seu negócio no maior
              marketplace esportivo do Brasil.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-300" />
              <span className="text-blue-100">Cadastro gratuito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que vender na LeoSport?
          </h2>
          <p className="text-lg text-gray-600">
            Oferecemos tudo que você precisa para fazer seu negócio crescer
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
            <CardTitle className="text-2xl text-center">Solicitar Parceria</CardTitle>
            <p className="text-gray-600 text-center">
              Preencha o formulário abaixo e nossa equipe entrará em contato
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome da Empresa *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Ex: SportShop Pro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do Responsável *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@empresa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Descrição do Negócio *</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  placeholder="Conte-nos sobre sua empresa, produtos que vende, tempo de mercado..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experiência no Setor Esportivo</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Descreva sua experiência vendendo produtos esportivos..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCategories">Categorias de Produtos *</Label>
                <Input
                  id="productCategories"
                  value={formData.productCategories}
                  onChange={(e) => handleInputChange('productCategories', e.target.value)}
                  placeholder="Ex: Futebol, Basquete, Tênis de Corrida"
                  required
                />
              </div>

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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600">Processo simples em 4 etapas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Cadastro', description: 'Preencha o formulário com suas informações' },
              { step: '2', title: 'Análise', description: 'Nossa equipe avalia sua solicitação' },
              { step: '3', title: 'Aprovação', description: 'Você recebe a confirmação por e-mail' },
              { step: '4', title: 'Vendas', description: 'Comece a vender seus produtos' }
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