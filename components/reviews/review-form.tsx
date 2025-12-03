"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { addReview } from "@/lib/reviews";
import { Star, Shield } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário é admin
  const isAdmin = profile?.user_type === 'admin';

  async function submit() {
    // Validação antes de enviar
    if (stars === 0) {
      setError("Por favor, selecione uma avaliação com estrelas.");
      return;
    }

    if (!comment.trim()) {
      setError("Por favor, escreva um comentário.");
      return;
    }

    if (comment.trim().length < 3) {
      setError("O comentário deve ter pelo menos 3 caracteres.");
      return;
    }

    setError(null);
    setLoading(true);

    // Usar o ID do usuário logado (se houver), incluindo admins
    const userId = user?.id || null;

    try {
      const { error: reviewError, errorMessage } = await addReview({
        productId,
        stars,
        comment: comment.trim(),
        userId,
        isAdmin: isAdmin,
      });

      if (!reviewError) {
        setDone(true);
        setComment("");
        setStars(0);
        // Dispara evento para recarregar a lista de reviews
        window.dispatchEvent(new Event("reviewAdded"));
        // Recarrega a página após 2 segundos para garantir
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        const message = errorMessage || "Erro ao enviar avaliação. Tente novamente.";
        setError(message);
        console.error("Erro ao enviar avaliação:", {
          error: reviewError,
          message: errorMessage,
          productId,
        });
      }
    } catch (err: any) {
      setError("Erro inesperado ao enviar avaliação. Tente novamente.");
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="border p-4 rounded-lg bg-green-50">
        <p className="text-green-600 font-medium">Avaliação enviada com sucesso!</p>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Deixar uma avaliação</h3>
        {isAdmin && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Estrelas */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              n <= stars ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
            }`}
            onClick={() => {
              setStars(n);
              setError(null);
            }}
          />
        ))}
      </div>

      <textarea
        rows={3}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Escreva um comentário..."
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setError(null);
        }}
        disabled={loading}
      ></textarea>

      <button
        onClick={submit}
        disabled={stars === 0 || loading || !comment.trim()}
        className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
