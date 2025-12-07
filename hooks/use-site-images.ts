'use client';

import { useState, useEffect } from 'react';
import { getSiteImages, type SiteImage } from '@/lib/supabase';

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
    try {
      setLoading(true);
      setError(null);
      const data = await getSiteImages();
      setImages(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar imagens do site:', err);
      setError(err.message);
      setImages([]);
      // Mesmo com erro, permitir que o site continue funcionando
    } finally {
      // Garantir que loading sempre seja desativado
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



