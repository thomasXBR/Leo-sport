"use client";

import { useState } from "react";
import { addReview } from "@/lib/reviews";
import { Star } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);

    const userId = null; // coloque o ID do user se usar Supabase Auth

    const { error } = await addReview({
      productId,
      stars,
      comment,
      userId,
    });

    if (!error) {
      setDone(true);
    } else {
      alert("Erro ao enviar avaliação");
    }

    setLoading(false);
  }

  if (done) return <p className="text-green-600">Avaliação enviada!</p>;

  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-3">Deixar uma avaliação</h3>

      {/* Estrelas */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-6 h-6 cursor-pointer ${
              n <= stars ? "text-yellow-500" : "text-gray-400"
            }`}
            onClick={() => setStars(n)}
          />
        ))}
      </div>

      <textarea
        rows={3}
        className="w-full border rounded-lg p-2"
        placeholder="Escreva um comentário..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>

      <button
        onClick={submit}
        disabled={stars === 0 || loading}
        className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg"
      >
        {loading ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
