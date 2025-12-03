import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API Route para criar uma avaliação
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação
    if (!body.productId) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.stars || body.stars < 1 || body.stars > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve estar entre 1 e 5 estrelas' },
        { status: 400 }
      );
    }

    if (!body.comment || !body.comment.trim()) {
      return NextResponse.json(
        { error: 'Comentário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é admin (se userId foi fornecido)
    let userIsAdmin = false;
    if (body.userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', body.userId)
          .single();
        
        userIsAdmin = profile?.user_type === 'admin';
        console.log('[API Reviews] Verificação de admin:', { userId: body.userId, isAdmin: userIsAdmin });
      } catch (profileError) {
        console.error('[API Reviews] Erro ao verificar perfil:', profileError);
      }
    }

    // Também aceitar o flag isAdmin do body se fornecido
    const isAdmin = body.isAdmin || userIsAdmin;

    // Preparar dados
    const reviewData = {
      product_id: body.productId,
      stars: body.stars,
      comment: body.comment.trim(),
      user_id: body.userId || null,
    };

    console.log('[API Reviews] Tentando inserir review:', { ...reviewData, isAdmin });

    // Se for admin e houver erro de permissão, tentar múltiplas vezes ou usar estratégia diferente
    let data, error;
    
    // Primeira tentativa
    ({ data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single());

    // Se houver erro de permissão e for admin, tentar uma segunda vez
    // (às vezes o RLS pode ter cache ou delay)
    if (error && (error.code === '42501' || error.code === 'PGRST301') && isAdmin) {
      console.log('[API Reviews] Erro de permissão detectado para admin, tentando novamente...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay
      
      ({ data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single());
    }

    if (error) {
      console.error('[API Reviews] Erro ao inserir:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        isAdmin,
        userId: body.userId,
      });

      let errorMessage = 'Erro ao enviar avaliação.';
      
      if (error.code === '23503') {
        errorMessage = 'Produto não encontrado.';
      } else if (error.code === '23505') {
        errorMessage = 'Você já avaliou este produto.';
      } else if (error.code === '42501' || error.code === 'PGRST301') {
        if (isAdmin) {
          errorMessage = 'Erro de permissão mesmo sendo admin. Entre em contato com o suporte técnico.';
        } else {
          errorMessage = 'Sem permissão para enviar avaliação.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      );
    }

    console.log('[API Reviews] Review inserido com sucesso:', data);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Reviews] Erro inesperado:', error);
    return NextResponse.json(
      {
        error: 'Erro inesperado ao enviar avaliação',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews?productId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Reviews] Erro ao buscar:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reviews: data || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Reviews] Erro inesperado:', error);
    return NextResponse.json(
      {
        error: 'Erro inesperado ao buscar avaliações',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

