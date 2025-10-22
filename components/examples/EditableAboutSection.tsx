'use client';

import { useSiteContent } from '@/hooks/use-site-content';

/**
 * Componente de exemplo para a seção "Sobre"
 * Demonstra como usar múltiplos campos de conteúdo editável
 */
export default function EditableAboutSection() {
  const { getContent, loading } = useSiteContent();

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {getContent('about_title')}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          {getContent('about_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Nossa Missão</h3>
          <p className="text-gray-600">
            {getContent('mission')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Nossa Visão</h3>
          <p className="text-gray-600">
            {getContent('vision')}
          </p>
        </div>
      </div>
    </section>
  );
}

