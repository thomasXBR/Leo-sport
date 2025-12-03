
// Supondo que a função createClient está em "@/lib/supabase.ts", altere o import assim:

import { supabase } from "@/lib/supabase";

export async function getReviews(productId: string) {
  // Usa o client importado diretamente
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar reviews:", error);
    return [];
  }

  return data;
}

export async function addReview({
  productId,
  stars,
  comment,
  userId,
}: {
  productId: string;
  stars: number;
  comment: string;
  userId: string | null;
}) {
  // Validação básica
  if (!productId) {
    return { 
      error: { message: "ID do produto é obrigatório" },
      errorMessage: "ID do produto inválido."
    };
  }

  if (!stars || stars < 1 || stars > 5) {
    return { 
      error: { message: "Avaliação deve estar entre 1 e 5 estrelas" },
      errorMessage: "Por favor, selecione uma avaliação entre 1 e 5 estrelas."
    };
  }

  if (!comment || !comment.trim()) {
    return { 
      error: { message: "Comentário é obrigatório" },
      errorMessage: "Por favor, escreva um comentário."
    };
  }

  try {
    // Usa o client importado diretamente
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        stars,
        comment: comment.trim(),
        user_id: userId,
      })
      .select();

    if (error) {
      console.error("Erro ao inserir review:", error);
      
      // Traduzir mensagens de erro comuns
      let errorMessage = "Erro ao enviar avaliação. Tente novamente.";
      
      if (error.code === "23503") {
        errorMessage = "Produto não encontrado.";
      } else if (error.code === "23505") {
        errorMessage = "Você já avaliou este produto.";
      } else if (error.code === "42501") {
        errorMessage = "Sem permissão para enviar avaliação. Entre em contato com o suporte.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { error, errorMessage };
    }

    return { error: null, errorMessage: null, data };
  } catch (err: any) {
    console.error("Erro inesperado ao adicionar review:", err);
    return { 
      error: err, 
      errorMessage: "Erro inesperado ao enviar avaliação. Tente novamente."
    };
  }
}

export function computeAverage(reviews: { stars: number }[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
  return sum / reviews.length;
}
