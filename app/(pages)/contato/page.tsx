'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { useSiteContent } from '@/hooks/use-site-content';
import { useSiteImages } from '@/hooks/use-site-images';
import { getFAQs, type FAQ } from '@/lib/supabase';

export default function ContatoPage() {
  const { getContent, loading } = useSiteContent();
  const { getImage } = useSiteImages();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [currentFaqPage, setCurrentFaqPage] = useState(1);
  const FAQS_PER_PAGE = 2;

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

  // Carregar FAQs do Supabase
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setFaqLoading(true);
        const faqsData = await getFAQs();
        setFaqs(faqsData || []);
      } catch (error) {
        console.error('Erro ao carregar FAQs:', error);
        setFaqs([]);
      } finally {
        setFaqLoading(false);
      }
    };

    loadFAQs();
  }, []);

  // Cálculos de paginação para FAQ
  const totalFaqPages = Math.ceil(faqs.length / FAQS_PER_PAGE);
  const currentFaqs = faqs.slice(
    (currentFaqPage - 1) * FAQS_PER_PAGE,
    currentFaqPage * FAQS_PER_PAGE
  );

  // Ajustar página atual se necessário
  useEffect(() => {
    if (currentFaqPage > totalFaqPages && totalFaqPages > 0) {
      setCurrentFaqPage(totalFaqPages);
    }
  }, [faqs, totalFaqPages, currentFaqPage]);

  const handleFaqPageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentFaqPage > 1) {
      setCurrentFaqPage(prev => prev - 1);
    } else if (direction === 'next' && currentFaqPage < totalFaqPages) {
      setCurrentFaqPage(prev => prev + 1);
    }
  };

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
            src={getImage('contato_background', '/images/CONTATO.jpg')}
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

      {/* Contact Info and FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
          </div>

          {/* FAQ Section */}
          <div>
            {faqs.length > 0 && (
              <div className="pb-6">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-3">
                    <HelpCircle className="w-7 h-7 text-blue-900" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getContent('contact_faq_title', 'Perguntas Frequentes')}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Dúvidas mais comuns sobre contato e suporte
                  </p>
                </div>

                {faqLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {currentFaqs.map((faq) => (
                        <Card key={faq.id} className="hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-5">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm mt-1">
                                  Q
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                    {faq.perguntas_frequentes}
                                  </h4>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 ml-11">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold text-sm mt-1">
                                  A
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {faq.respostas}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Paginação */}
                    {totalFaqPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <Button
                          onClick={() => handleFaqPageChange('prev')}
                          disabled={currentFaqPage === 1}
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <span className="text-sm text-gray-600">
                          Página {currentFaqPage} de {totalFaqPages}
                        </span>

                        <Button
                          onClick={() => handleFaqPageChange('next')}
                          disabled={currentFaqPage === totalFaqPages}
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}