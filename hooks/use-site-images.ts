'use client';

import { useState, useEffect, useRef } from 'react';
import { getSiteImages, type SiteImage } from '@/lib/supabase';

// Cache global para evitar múltiplas requisições
let globalImagesCache: SiteImage[] | null = null;
let globalImagesLoading = false;
let globalImagesError: string | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
let lastFetchTime = 0;

/**
 * Hook personalizado para gerenciar imagens editáveis do site
 * Carrega do Supabase e permite busca por chave
 * Usa cache global para evitar múltiplas requisições
 * 
 * Uso:
 * const { images, getImage, loading } = useSiteImages();
 * const heroImage = getImage('hero_background');
 */
export function useSiteImages() {
  const [images, setImages] = useState<SiteImage[]>(globalImagesCache || []);
  const [loading, setLoading] = useState(globalImagesLoading);
  const [error, setError] = useState<string | null>(globalImagesError);
  const hasLoadedRef = useRef(false);

  // Carregar imagens do banco de dados
  useEffect(() => {
    // Se já temos cache válido, usar ele
    const now = Date.now();
    if (globalImagesCache && (now - lastFetchTime) < CACHE_DURATION) {
      setImages(globalImagesCache);
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    // Se já está carregando, não fazer nova requisição
    if (globalImagesLoading && !hasLoadedRef.current) {
      return;
    }

    loadImages();
  }, []);

  const loadImages = async () => {
    // Evitar múltiplas requisições simultâneas
    if (globalImagesLoading) {
      return;
    }

    globalImagesLoading = true;
    setLoading(true);
    setError(null);
    hasLoadedRef.current = false;

    try {
      // Timeout de 10 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar imagens')), 10000);
      });

      const dataPromise = getSiteImages();
      const data = await Promise.race([dataPromise, timeoutPromise]);
      
      const imagesData = data || [];
      globalImagesCache = imagesData;
      globalImagesError = null;
      lastFetchTime = Date.now();
      
      setImages(imagesData);
    } catch (err: any) {
      console.error('Erro ao carregar imagens:', err);
      const errorMessage = err.message || 'Erro ao carregar imagens';
      globalImagesError = errorMessage;
      setError(errorMessage);
      
      // Se houver cache antigo, usar ele
      if (globalImagesCache) {
        setImages(globalImagesCache);
      } else {
        setImages([]);
      }
    } finally {
      globalImagesLoading = false;
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  // Buscar imagem por chave
  const getImage = (key: string, fallback: string = ''): string => {
    const image = images.find(img => img.image_key === key);
    return image?.image_url || fallback;
  };

  // Buscar objeto de imagem completo por chave
  const getImageObject = (key: string): SiteImage | null => {
    return images.find(img => img.image_key === key) || null;
  };

  // Recarregar imagens do banco
  const reload = () => {
    loadImages();
  };

  return {
    images,
    getImage,
    getImageObject,
    loading,
    error,
    reload,
  };
}



