'use client';

import { useState, useEffect } from 'react';
import { getSiteImages, getSiteImageByKey, type SiteImage } from '@/lib/supabase';

/**
 * Hook personalizado para gerenciar imagens editáveis do site
 * Carrega do Supabase e permite busca por chave
 * 
 * Uso:
 * const { images, getImage, loading } = useSiteImages();
 * const heroImage = getImage('hero_background');
 */
export function useSiteImages() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar imagens do banco de dados
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteImages();
      setImages(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar imagens:', err);
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
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


