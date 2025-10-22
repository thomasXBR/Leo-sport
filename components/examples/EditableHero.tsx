'use client';

import { useSiteContent } from '@/hooks/use-site-content';

/**
 * Componente de exemplo mostrando como usar o sistema de conteúdo editável
 * 
 * Este componente pode ser usado em qualquer página para exibir conteúdo
 * que pode ser editado pela dashboard administrativa.
 * 
 * Uso:
 * import EditableHero from '@/components/examples/EditableHero';
 * 
 * <EditableHero />
 */
export default function EditableHero() {
  const { getContent, loading } = useSiteContent();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-blue-800 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-blue-800 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {getContent('hero_title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            {getContent('hero_subtitle')}
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            {getContent('hero_description')}
          </p>
        </div>
      </div>
    </section>
  );
}

