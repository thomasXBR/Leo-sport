
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
  // Usa o client importado diretamente
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    stars,
    comment,
    user_id: userId,
  });

  return { error };
}

export function computeAverage(reviews: { stars: number }[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
  return sum / reviews.length;
}
