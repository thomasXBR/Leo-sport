"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, RefreshCw } from "lucide-react";
import { getReviews } from "@/lib/reviews";
import { Button } from "@/components/ui/button";

export default function ReviewsList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getReviews(productId);
      setReviews(data || []);
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();

    // Recarregar reviews a cada 5 segundos para pegar mudanças (deletadas no Supabase, etc)
    const interval = setInterval(loadReviews, 5000);

    return () => clearInterval(interval);
  }, [loadReviews]);

  // Listener para eventos de mudanças nas reviews
  useEffect(() => {
    const handleReviewAdded = () => {
      // Aguardar um pouco para garantir que o banco foi atualizado
      setTimeout(() => {
        loadReviews();
      }, 500);
    };

    const handleReviewDeleted = () => {
      loadReviews();
    };

    window.addEventListener("reviewAdded", handleReviewAdded);
    window.addEventListener("reviewDeleted", handleReviewDeleted);
    
    return () => {
      window.removeEventListener("reviewAdded", handleReviewAdded);
      window.removeEventListener("reviewDeleted", handleReviewDeleted);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Botão para atualizar manualmente */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={loadReviews}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-700">Nenhuma avaliação ainda.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
        <div key={r.id} className="border rounded-xl p-4">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-4 h-4 ${n <= r.stars ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          <p className="text-gray-900">{r.comment}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(r.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}

