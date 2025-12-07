'use client';

import { useState, useEffect } from 'react';
import { getSiteContent, updateSiteContent, type SiteContent as SupabaseSiteContent } from '@/lib/supabase';

/**
 * Hook personalizado para gerenciar conteúdo editável do site
 * Carrega do Supabase e permite edição
 * 
 * Uso:
 * const { content, getContent, loading } = useSiteContent();
 * const heroTitle = getContent('hero_title');
 */
export function useSiteContent() {
  const [content, setContent] = useState<SupabaseSiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar conteúdo do banco de dados
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSiteContent();
      setContent(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar conteúdo do site:', err);
      setError(err.message);
      setContent([]);
      // Mesmo com erro, permitir que o site continue funcionando
    } finally {
      // Garantir que loading sempre seja desativado
      setLoading(false);
    }
  };

  // Buscar conteúdo por chave
  const getContent = (key: string, fallback: string = ''): string => {
    const item = content.find(c => c.content_key === key);
    return item?.value || fallback;
  };

  // Recarregar conteúdo do banco
  const reload = () => {
    loadContent();
  };

  return {
    content,
    getContent,
    loading,
    error,
    reload,
  };
}
