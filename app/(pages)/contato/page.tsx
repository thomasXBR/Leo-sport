'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';

export default function ContatoPage() {
  const { getContent, loading } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: getContent('contact_address_title', 'Endereço'),
      content: getContent('contact_address_content', 'Rua dos Esportes, 123\nSão Paulo - SP, 01234-567')
    },
    {
      icon: Phone,
      title: getContent('contact_phone_title', 'Telefone'),
      content: getContent('contact_phone_content', '(11) 3456-7890\n(11) 99999-9999')
    },
    {
      icon: Mail,
      title: getContent('contact_email_title', 'E-mail'),
      content: getContent('contact_email_content', 'contato@leosport.com.br\nsuporte@leosport.com.br')
    },
    {
      icon: Clock,
      title: getContent('contact_hours_title', 'Horário de Atendimento'),
      content: getContent('contact_hours_content', 'Segunda a Sexta: 8h às 18h\nSábado: 8h às 14h')
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
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData);
    alert('Mensagem enviada com sucesso! Retornaremos em breve.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getContent('contact_title', 'Entre em Contato')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {getContent('contact_hero_description', 'Estamos aqui para ajudar! Entre em contato conosco para dúvidas, sugestões ou suporte.')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info and Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {getContent('contact_info_title', 'Informações de Contato')}
            </h2>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-blue-900" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {info.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-12 pb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {getContent('contact_faq_title', 'Perguntas Frequentes')}
              </h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {getContent('contact_faq_1_question', 'Como funciona o processo de venda?')}
                    </h4>
                    <p className="text-gray-600">
                      {getContent('contact_faq_1_answer', 'Após aprovação como parceiro, você pode enviar propostas de produtos que serão analisadas pela nossa equipe antes de serem publicadas.')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {getContent('contact_faq_2_question', 'Qual é a taxa de comissão?')}
                    </h4>
                    <p className="text-gray-600">
                      {getContent('contact_faq_2_answer', 'Nossa taxa é competitiva e varia conforme o volume de vendas. Entre em contato para conhecer nossos planos.')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{getContent('contact_form_title', 'Envie sua Mensagem')}</CardTitle>
                <p className="text-gray-600">
                  {getContent('contact_form_subtitle', 'Preencha o formulário e retornaremos em até 24 horas')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Como podemos ajudar?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Descreva sua dúvida ou sugestão..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950" size="lg">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}