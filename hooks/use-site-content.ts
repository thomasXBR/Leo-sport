'use client';

import { useState, useEffect } from 'react';
import { defaultSiteContent, SiteContent, getContentByKey } from '@/lib/site-content';

/**
 * Hook personalizado para gerenciar conteúdo editável do site
 * 
 * Uso:
 * const { content, getContent, updateContent, saveAll } = useSiteContent();
 * const heroTitle = getContent('hero_title');
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent[]>(defaultSiteContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar conteúdo do banco de dados (quando integrado)
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com Supabase
      // const { data, error } = await supabase
      //   .from('site_content')
      //   .select('*');
      // 
      // if (error) throw error;
      // setContent(data || defaultSiteContent);
      
      // Por enquanto, usar dados padrão
      setContent(defaultSiteContent);
    } catch (err: any) {
      setError(err.message);
      setContent(defaultSiteContent);
    } finally {
      setLoading(false);
    }
  };

  // Buscar conteúdo por chave
  const getContent = (key: string): string => {
    return getContentByKey(key, content);
  };

  // Atualizar conteúdo localmente
  const updateContent = (id: string, newValue: string) => {
    setContent(prevContent =>
      prevContent.map(c =>
        c.id === id ? { ...c, value: newValue } : c
      )
    );
  };

  // Salvar todas as alterações no banco de dados
  const saveAll = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      // TODO: Integrar com Supabase
      // const { error } = await supabase
      //   .from('site_content')
      //   .upsert(content);
      // 
      // if (error) throw error;
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Resetar para valores padrão
  const reset = () => {
    setContent(defaultSiteContent);
  };

  return {
    content,
    loading,
    error,
    getContent,
    updateContent,
    saveAll,
    reset,
    reload: loadContent,
  };
}

