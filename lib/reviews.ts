
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
  name,
  userId,
}: {
  productId: string;
  stars: number;
  comment: string;
  name: string;
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

  if (!name || !name.trim()) {
    return { 
      error: { message: "Nome é obrigatório" },
      errorMessage: "Por favor, informe seu nome."
    };
  }

  try {
    // Preparar o objeto de review
    const reviewData: {
      product_id: string;
      stars: number;
      comment: string;
      name: string;
      user_id: string | null;
    } = {
      product_id: productId,
      stars,
      comment: comment.trim(),
      name: name.trim(),
      user_id: userId,
    };

    console.log("Tentando inserir review:", reviewData);

    // Tentar inserir diretamente no Supabase
    const { data, error } = await supabase
      .from("reviews")
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir review diretamente:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        data: reviewData,
      });

      // Se for erro de permissão (RLS), tentar via API route
      if (error.code === "42501" || error.code === "PGRST301") {
        console.log("Tentando inserir via API route devido a problema de permissão...");
        
        try {
          const apiResponse = await fetch("/api/reviews", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
              stars,
              comment: comment.trim(),
              name: name.trim(),
              userId,
            }),
          });

          const apiResult = await apiResponse.json();

          if (!apiResponse.ok) {
            return {
              error: { message: apiResult.error || "Erro ao enviar avaliação" },
              errorMessage: apiResult.error || "Erro ao enviar avaliação. Tente novamente.",
            };
          }

          console.log("Review inserido com sucesso via API:", apiResult.data);
          return { error: null, errorMessage: null, data: apiResult.data };
        } catch (apiError: any) {
          console.error("Erro ao usar API route:", apiError);
          // Continuar com o erro original
        }
      }
      
      // Traduzir mensagens de erro comuns
      let errorMessage = "Erro ao enviar avaliação. Tente novamente.";
      
      if (error.code === "23503") {
        errorMessage = "Produto não encontrado.";
      } else if (error.code === "23505") {
        errorMessage = "Você já avaliou este produto.";
      } else if (error.code === "42501") {
        errorMessage = "Sem permissão para enviar avaliação. Entre em contato com o suporte.";
      } else if (error.code === "PGRST116") {
        errorMessage = "Produto não encontrado.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      return { error, errorMessage };
    }

    console.log("Review inserido com sucesso:", data);
    return { error: null, errorMessage: null, data };
  } catch (err: any) {
    console.error("Erro inesperado ao adicionar review:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
    });
    return { 
      error: err, 
      errorMessage: `Erro inesperado: ${err?.message || "Tente novamente."}`
    };
  }
}

export function computeAverage(reviews: { stars: number }[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
  return sum / reviews.length;
}
