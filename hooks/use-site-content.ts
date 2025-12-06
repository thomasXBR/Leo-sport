'use client';

import { useState, useEffect, useRef } from 'react';
import { getSiteContent, updateSiteContent, type SiteContent as SupabaseSiteContent } from '@/lib/supabase';

// Cache global para evitar múltiplas requisições
let globalContentCache: SupabaseSiteContent[] | null = null;
let globalContentLoading = false;
let globalContentError: string | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
let lastFetchTime = 0;

/**
 * Hook personalizado para gerenciar conteúdo editável do site
 * Carrega do Supabase e permite edição
 * Usa cache global para evitar múltiplas requisições
 * 
 * Uso:
 * const { content, getContent, loading } = useSiteContent();
 * const heroTitle = getContent('hero_title');
 */
export function useSiteContent() {
  const [content, setContent] = useState<SupabaseSiteContent[]>(globalContentCache || []);
  const [loading, setLoading] = useState(globalContentLoading);
  const [error, setError] = useState<string | null>(globalContentError);
  const hasLoadedRef = useRef(false);

  // Carregar conteúdo do banco de dados
  useEffect(() => {
    // Se já temos cache válido, usar ele
    const now = Date.now();
    if (globalContentCache && (now - lastFetchTime) < CACHE_DURATION) {
      setContent(globalContentCache);
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    // Se já está carregando, não fazer nova requisição
    if (globalContentLoading && !hasLoadedRef.current) {
      return;
    }

    loadContent();
  }, []);

  const loadContent = async () => {
    // Evitar múltiplas requisições simultâneas
    if (globalContentLoading) {
      return;
    }

    globalContentLoading = true;
    setLoading(true);
    setError(null);
    hasLoadedRef.current = false;

    try {
      // Timeout de 10 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar conteúdo')), 10000);
      });

      const dataPromise = getSiteContent();
      const data = await Promise.race([dataPromise, timeoutPromise]);
      
      const contentData = data || [];
      globalContentCache = contentData;
      globalContentError = null;
      lastFetchTime = Date.now();
      
      setContent(contentData);
    } catch (err: any) {
      console.error('Erro ao carregar conteúdo:', err);
      const errorMessage = err.message || 'Erro ao carregar conteúdo';
      globalContentError = errorMessage;
      setError(errorMessage);
      
      // Se houver cache antigo, usar ele
      if (globalContentCache) {
        setContent(globalContentCache);
      } else {
        setContent([]);
      }
    } finally {
      globalContentLoading = false;
      setLoading(false);
      hasLoadedRef.current = true;
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
