"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, RefreshCw } from "lucide-react";
import { getReviews, computeAverage } from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import ReviewForm from "./review-form";

export default function ReviewsSection({ productId }: { productId: string }) {
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

    // Recarregar reviews a cada 5 segundos para pegar mudanças
    const interval = setInterval(loadReviews, 5000);

    return () => clearInterval(interval);
  }, [loadReviews]);

  // Listener para eventos de mudanças nas reviews
  useEffect(() => {
    const handleReviewAdded = () => {
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
  }, [loadReviews]);

  const avg = computeAverage(reviews);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Avaliações</h2>

      {/* Média de avaliações */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={`${star <= Math.round(avg)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({avg.toFixed(1)}) • {reviews.length} avaliação{reviews.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Formulário de avaliação */}
      <div className="mb-8">
        <ReviewForm productId={productId} />
      </div>

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
          {refreshing ? "Atualizando..." : "Atualizar avaliações"}
        </Button>
      </div>

      {/* Lista de avaliações */}
      {reviews.length === 0 ? (
        <p className="text-gray-700">Nenhuma avaliação ainda.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{r.name || "Anônimo"}</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= r.stars ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
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

