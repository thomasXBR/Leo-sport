"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getReviews, computeAverage } from "@/lib/reviews";

export default function ProductRating({ productId }: { productId: string }) {
  const [avg, setAvg] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRating() {
      try {
        const reviews = await getReviews(productId);
        const average = computeAverage(reviews);
        setAvg(average);
        setReviewCount(reviews.length);
      } catch (error) {
        console.error("Erro ao carregar rating:", error);
        setAvg(null);
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    }

    loadRating();

    // Recarregar a cada 5 segundos
    const interval = setInterval(loadRating, 5000);

    // Listener para atualizar quando review for adicionada/deletada
    const handleReviewChange = () => {
      setTimeout(loadRating, 500);
    };

    window.addEventListener("reviewAdded", handleReviewChange);
    window.addEventListener("reviewDeleted", handleReviewChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("reviewAdded", handleReviewChange);
      window.removeEventListener("reviewDeleted", handleReviewChange);
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={16} className="text-gray-300" />
          ))}
        </div>
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${avg && star <= Math.round(avg)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
              }`}
          />
        ))}
      </div>
      {reviewCount > 0 ? (
        <span className="text-sm text-gray-600">
          ({avg?.toFixed(1) ?? "0.0"}) • {reviewCount} avaliação{reviewCount > 1 ? "s" : ""}
        </span>
      ) : (
        <span className="text-sm text-gray-500">(sem avaliações)</span>
      )}
    </div>
  );
}

