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

    // Validar UUID se userId for fornecido
    let validUserId: string | null = null;
    if (body.userId) {
      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(body.userId)) {
        validUserId = body.userId;
      } else {
        console.warn('[API Reviews] userId fornecido não é um UUID válido:', body.userId);
        // Se não for UUID válido, pode ser problema, mas deixar null
        validUserId = null;
      }
    }

    // Preparar dados conforme schema do Supabase:
    // - product_id: text
    // - user_id: uuid (FK para auth.users.id) ou null
    // - stars: int4 (integer)
    // - comment: text
    const reviewData = {
      product_id: String(body.productId).trim(),
      stars: parseInt(String(body.stars), 10),
      comment: String(body.comment).trim(),
      user_id: validUserId,
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
      
      // Códigos de erro do PostgreSQL/Supabase:
      if (error.code === '23503') {
        // Foreign key violation
        if (error.details?.includes('user_id')) {
          errorMessage = 'Usuário não encontrado. Faça login novamente.';
        } else if (error.details?.includes('product_id')) {
          errorMessage = 'Produto não encontrado.';
        } else {
          errorMessage = 'Referência inválida. Verifique os dados.';
        }
      } else if (error.code === '23505') {
        // Unique violation - usuário já avaliou
        errorMessage = 'Você já avaliou este produto.';
      } else if (error.code === '23514') {
        // Check constraint violation
        if (error.details?.includes('stars')) {
          errorMessage = 'A avaliação deve estar entre 1 e 5 estrelas.';
        } else if (error.details?.includes('comment')) {
          errorMessage = 'O comentário não pode estar vazio.';
        } else {
          errorMessage = 'Dados inválidos. Verifique os campos.';
        }
      } else if (error.code === '42501' || error.code === 'PGRST301') {
        // Permission denied (RLS)
        if (isAdmin) {
          errorMessage = 'Erro de permissão mesmo sendo admin. É necessário configurar as políticas RLS no Supabase. Execute o arquivo "EXECUTAR_ISSO_NO_SUPABASE.sql" no SQL Editor do Supabase.';
        } else {
          errorMessage = 'Sem permissão para enviar avaliação. Faça login ou entre em contato.';
        }
      } else if (error.code === 'PGRST116') {
        // No rows returned
        errorMessage = 'Produto ou usuário não encontrado.';
      } else if (error.code === '22P02') {
        // Invalid UUID format
        errorMessage = 'Formato de ID inválido.';
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

