import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  description?: string;
  user_type: 'comprador' | 'vendedor' | 'admin';
  created_at: string;
  updated_at: string;
};

// ============================================
// TIPOS PARA AS TABELAS
// ============================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type Partnership = {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  partnership_date: string;
  notes?: string;
  form_type?: 'fornecedor' | 'representante';
  form_payload?: string | object;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  sku: string;
  content_id?: string;
  category_id?: string;
  brand?: string;
  price: number;
  fake_price?: number;
  stock_quantity: number;
  weight?: string;
  dimensions?: string;
  width?: number;
  height?: number;
  image_url?: string;
  color?: string;
  features?: string;
  specifications?: string;
  relevance?: number;
  no_shipping?: boolean;
  devolution_months?: number;
  warranty_months?: number;
  status: 'Ativo' | 'Inativo' | 'Esgotado';
  created_at: string;
  updated_at: string;
};

// --- Tipagem para reviews conforme oque está no Supabase:
export type Review = {
  id: number;
  product_id: string;
  user_id: string | null;
  stars: number;
  comment: string;
  name: string;
  created_at: string;
};

export type ReviewWithUser = Review & {
  user: { id: string; name: string; avatar_url?: string } | null
};

export type Sale = {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'Pendente' | 'Pago' | 'Em Processamento' | 'Enviado' | 'Entregue' | 'Cancelado';
  payment_method?: string;
  payment_status?: string;
  shipping_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  sale_id?: string;
  order_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_cpf_cnpj?: string;
  customer_address?: any;
  total_amount: number;
  status: 'Pendente' | 'Emitida' | 'Cancelada' | 'Rejeitada';
  issue_date: string;
  due_date?: string;
  nfse_key?: string;
  xml_content?: string;
  pdf_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'Percentual' | 'Fixo' | 'Especial';
  discount_value: string;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  usage_count: number;
  min_purchase_amount?: number;
  status: 'Ativo' | 'Inativo' | 'Expirado';
  description?: string;
  carousel_text?: string; // Texto personalizado para exibir no carrossel
  show_in_navbar?: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteContent = {
  id: string;
  section: string;
  content_key: string;
  label: string;
  value: string;
  content_type: 'text' | 'textarea' | 'html';
  created_at: string;
  updated_at: string;
};

export type Purchase = {
  id: string;
  purchase_number?: string;
  supplier_name: string;
  total_amount: number;
  pdf_url?: string;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// FUNÇÕES CRUD - PRODUTOS
// ============================================

/**
 * 1. FUNÇÃO: getFAQs
 * Objetivo: Obter todas as Perguntas e Respostas.
 */
export async function getFAQs() {
  const { data, error } = await supabase
    .from('perguntas_respostas') // Nome da Tabela
    .select('id, perguntas_frequentes, respostas') // Colunas a serem selecionadas
    .order('id', { ascending: true }); // Ordenar, por exemplo, por ID

  if (error) {
    console.error('Erro ao buscar FAQs:', error);
    throw new Error('Não foi possível carregar as perguntas frequentes.');
  }
  
  // Retorna os dados, ou um array vazio se não houver nada
  return data || [];
}

export interface FAQ {
  id: string; // CORREÇÃO
  perguntas_frequentes: string;
  respostas: string;
}

/**
 * 2. FUNÇÃO: createFAQ
 * Objetivo: Inserir uma nova Pergunta Frequente e Resposta.
 * @param faq - Objeto contendo 'pergunta' e 'resposta'.
 */
interface NewFAQ {
  pergunta: string;
  resposta: string;
}

export async function createFAQ({ pergunta, resposta }: NewFAQ) {
  const { data, error } = await supabase
    .from('perguntas_respostas') // Nome da Tabela
    .insert([
      { 
        perguntas_frequentes: pergunta, // Mapeamento para a coluna Supabase
        respostas: resposta            // Mapeamento para a coluna Supabase
      }
    ])
    .select() // Retorna o registro recém-criado
    .single();

  if (error) {
    console.error('Erro ao criar FAQ:', error);
    throw new Error('Não foi possível adicionar a nova pergunta.');
  }

  return data;
}

/**
 * 3. FUNÇÃO: updateFAQ
 * Objetivo: Atualizar uma Pergunta Frequente e Resposta existente.
 * @param id - O ID (UUID ou INT) do registro a ser atualizado.
 * @param updates - Objeto com os campos a serem atualizados (pergunta e/ou resposta).
 */
interface UpdatedFAQ {
  pergunta?: string;
  resposta?: string;
}

export async function updateFAQ(id: string | number, updates: UpdatedFAQ) {
  // Cria o objeto de atualização com base nos nomes das colunas do Supabase
  const updatePayload: Record<string, any> = {};
  if (updates.pergunta !== undefined) {
    updatePayload.perguntas_frequentes = updates.pergunta;
  }
  if (updates.resposta !== undefined) {
    updatePayload.respostas = updates.resposta;
  }

  const { data, error } = await supabase
    .from('perguntas_respostas')
    .update(updatePayload)
    .eq('id', id) // Condição de filtro para o registro correto
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar FAQ:', error);
    throw new Error(`Não foi possível atualizar a pergunta com ID ${id}.`);
  }

  return data;
}

/**
 * 4. FUNÇÃO: deleteFAQ
 * Objetivo: Excluir uma Pergunta Frequente e Resposta pelo ID.
 * @param id - O ID (UUID ou INT) do registro a ser excluído.
 */
export async function deleteFAQ(id: string | number) {
  const { error } = await supabase
    .from('perguntas_respostas')
    .delete()
    .eq('id', id); // Condição de filtro para o registro correto

  if (error) {
    console.error('Erro ao deletar FAQ:', error);
    throw new Error(`Não foi possível deletar a pergunta com ID ${id}.`);
  }
  
  // Retorna true em caso de sucesso (ou void/undefined, dependendo da sua preferência)
  return true; 
}

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, price, fake_price, stock_quantity, image_url, status, brand, created_at, updated_at, categories(name, slug)')
      .order('created_at', { ascending: false })
      .limit(1000); // Limitar para evitar queries muito grandes
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    // Garantir que sempre retorna um array
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Erro na função getProducts:', error);
    // Retornar array vazio em caso de erro para não quebrar a aplicação
    return [];
  }
}

export async function getProductById(id: string) {
  // Buscar produto com categoria, sem reviews (relacionamento pode não existir)
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  // Filter out undefined values to avoid Supabase errors
  const cleanProduct = Object.fromEntries(
    Object.entries(product).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  // Log payload to help debugging when inserts fail
  try {
    console.debug('Creating product with payload:', cleanProduct);
  } catch (e) {
    // ignore logging errors
  }

  const { data, error } = await supabase
    .from('products')
    .insert([cleanProduct])
    .select()
    .single();
  
  if (error) {
    // Log detailed error information to help debugging
    try {
      console.error('Error creating product:', {
        message: error.message || error,
        details: (error as any).details || null,
        hint: (error as any).hint || null,
        context: cleanProduct,
      });
    } catch (e) {
      console.error('Error creating product (failed to serialize error):', error);
    }
    throw error;
  }
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    console.debug('Updating product', id, updates);
  } catch (e) {
    /* ignore */
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// CRUD - REVIEWS
// ============================================
/**
 * Obtém todos os reviews de um produto, incluindo dados do usuário se desejar
 */
export async function getReviewsByProduct(product_id: string) {
  // Inclua user (perfil do usuário) no select se desejar mostrar nome/avatar
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(id, name, avatar_url)')
    .eq('product_id', product_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ReviewWithUser[];
}

/**
 * Cria um novo review
 */
export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

/**
 * Atualiza um review existente
 */
export async function updateReview(id: string, updates: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

/**
 * Deleta um review
 */
export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


// ============================================
// FUNÇÕES CRUD - VENDAS
// ============================================

export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('id, order_number, customer_name, customer_email, total_amount, status, payment_method, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500); // Limitar para melhor performance
  
  if (error) throw error;
  return data;
}

export async function createSale(sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// FUNÇÕES CRUD - NOTAS FISCAIS
// ============================================

export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, customer_email, total_amount, status, issue_date, pdf_url, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500); // Limitar para melhor performance
  
  if (error) throw error;
  return data;
}

export async function getInvoiceById(id: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES CRUD - CUPONS
// ============================================

export async function getCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getNavbarCoupons() {
  try {
    // Buscar todos os cupons ativos e válidos
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'Ativo')
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar cupons:', error);
      return [];
    }
    
    // Se a coluna show_in_navbar existir, filtrar por ela
    // Caso contrário, retornar todos os cupons ativos
    if (data && data.length > 0 && 'show_in_navbar' in data[0]) {
      return data.filter((coupon: any) => coupon.show_in_navbar === true);
    }
    
    // Retornar todos os cupons ativos se a coluna não existir
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar cupons da navbar:', error);
    return [];
  }
}

export async function getCouponById(id: string) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) {
  // Remover campos undefined para evitar erros no Supabase
  const cleanCoupon = Object.fromEntries(
    Object.entries(coupon).filter(([_, value]) => value !== undefined)
  ) as Omit<Coupon, 'id' | 'created_at' | 'updated_at'>;
  
  const { data, error } = await supabase
    .from('coupons')
    .insert([cleanCoupon])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar cupom no Supabase:', error);
    throw error;
  }
  return data;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  // Remover campos undefined para evitar erros no Supabase
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  ) as Partial<Coupon>;
  
  const { data, error } = await supabase
    .from('coupons')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar cupom no Supabase:', error);
    throw error;
  }
  return data;
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Validar cupom de desconto
 * @param code - Código do cupom
 * @param purchaseAmount - Valor total da compra
 * @returns Cupom válido ou null se inválido
 */
export async function validateCoupon(code: string, purchaseAmount: number, userId?: string) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error || !data) {
      return { valid: false, message: 'Cupom não encontrado' };
    }
    
    // Verificar se está ativo
    if (data.status !== 'Ativo') {
      return { valid: false, message: 'Cupom inativo' };
    }
    
    // Verificar data de validade
    const hoje = new Date().toISOString().split('T')[0];
    if (data.valid_until < hoje) {
      return { valid: false, message: 'Cupom expirado' };
    }
    
    if (data.valid_from > hoje) {
      return { valid: false, message: 'Cupom ainda não está válido' };
    }
    
    // Verificar limite de uso
    if (data.usage_limit && data.usage_count >= data.usage_limit) {
      return { valid: false, message: 'Cupom esgotado' };
    }
    
    // Verificar valor mínimo de compra
    if (data.min_purchase_amount && purchaseAmount < data.min_purchase_amount) {
      return { 
        valid: false, 
        message: `Compra mínima de R$ ${data.min_purchase_amount.toFixed(2).replace('.', ',')} necessária` 
      };
    }
    
    // Se fornecido userId, verificar se já usou (tabela coupon_usages)
    if (userId) {
      try {
        const { data: usage } = await supabase
          .from('coupon_usages')
          .select('id')
          .eq('coupon_id', data.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (usage) {
          return { valid: false, message: 'Você já utilizou este cupom' };
        }
      } catch (err) {
        console.warn('[Cupons] Não foi possível verificar uso por usuário (tabela ausente?)', err);
      }
    }

    // Calcular desconto
    let discountAmount = 0;
    if (data.discount_type === 'Percentual') {
      const percentage = parseFloat(data.discount_value);
      discountAmount = (purchaseAmount * percentage) / 100;
    } else if (data.discount_type === 'Fixo') {
      discountAmount = parseFloat(data.discount_value);
    }
    
    return {
      valid: true,
      coupon: data,
      discountAmount,
      message: 'Cupom aplicado com sucesso!'
    };
  } catch (error: any) {
    console.error('Erro ao validar cupom:', error);
    return { valid: false, message: 'Erro ao validar cupom' };
  }
}

/**
 * Registrar uso de cupom por usuário (idempotente)
 * Requer tabela coupon_usages (ver SQL recomendado)
 */
export async function registerCouponUsage(couponId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('coupon_usages')
      .insert({ coupon_id: couponId, user_id: userId })
      .select()
      .maybeSingle();

    if (error && !String(error.message).includes('duplicate key')) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Erro ao registrar uso do cupom:', error);
    return false;
  }
}

/**
 * Incrementar contador de uso do cupom
 * @param couponId - ID do cupom
 */
export async function incrementCouponUsage(couponId: string) {
  try {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('usage_count')
      .eq('id', couponId)
      .single();
    
    if (coupon) {
      await supabase
        .from('coupons')
        .update({ usage_count: coupon.usage_count + 1 })
        .eq('id', couponId);
    }
  } catch (error) {
    console.error('Erro ao incrementar uso do cupom:', error);
  }
}

// ============================================
// FUNÇÕES CRUD - PARCERIAS
// ============================================

export async function getPartnerships() {
  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createPartnership(partnership: Omit<Partnership, 'id' | 'created_at' | 'updated_at'>) {
  // Limpar campos undefined/null para evitar erros
  const cleanPartnership = Object.fromEntries(
    Object.entries(partnership).filter(([_, value]) => value !== undefined && value !== null)
  ) as Omit<Partnership, 'id' | 'created_at' | 'updated_at'>;
  
  // Garantir que campos obrigatórios existam
  if (!cleanPartnership.company_name) {
    cleanPartnership.company_name = 'Não informado';
  }
  if (!cleanPartnership.contact_email) {
    throw new Error('Email é obrigatório');
  }
  if (!cleanPartnership.status) {
    cleanPartnership.status = 'Pendente';
  }
  if (!cleanPartnership.partnership_date) {
    cleanPartnership.partnership_date = new Date().toISOString().split('T')[0];
  }
  
  const { data, error } = await supabase
    .from('partnerships')
    .insert([cleanPartnership])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar parceria no Supabase:', {
      error,
      partnership: cleanPartnership,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  return data;
}

export async function updatePartnership(id: string, updates: Partial<Partnership>) {
  const { data, error } = await supabase
    .from('partnerships')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePartnership(id: string) {
  const { error } = await supabase
    .from('partnerships')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES CRUD - TEXTOS DO SITE
// ============================================

export async function getSiteContent() {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section, content_key');
    
    if (error) {
      console.error('Erro ao buscar conteúdo do site:', error);
      // Retornar array vazio em vez de lançar erro
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.error('Erro na função getSiteContent:', err);
    // Retornar array vazio para não quebrar a aplicação
    return [];
  }
}

export async function updateSiteContent(id: string, value: string) {
  const { data, error } = await supabase
    .from('site_content')
    .update({ value })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSalesDataForChart() {
  // Buscar vendas dos últimos 6 meses para o gráfico
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const { data, error } = await supabase
    .from('sales')
    .select('total_amount, created_at, status')
    .gte('created_at', sixMonthsAgo.toISOString())
    .eq('status', 'Pago');
  
  if (error) throw error;
  return data;
}

// ============================================
// FUNÇÕES CRUD - COMPRAS
// ============================================

export async function getPurchases() {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchase])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePurchase(id: string, updates: Partial<Purchase>) {
  const { data, error } = await supabase
    .from('purchases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePurchase(id: string) {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES CRUD - CARRINHOS DE USUÁRIOS
// ============================================

export type UserCart = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
  created_at: string;
  product?: Product;
};

export async function getUserCart(userId: string) {
  const { data, error } = await supabase
    .from('user_carts')
    .select('*, product:products(*, categories:categories(*))')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data as UserCart[];
}

export async function getAllUserCarts() {
  const { data, error } = await supabase
    .from('user_carts')
    .select('*, product:products(*), user:profiles(id, name, email)')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addToUserCart(userId: string, productId: string, quantity: number = 1) {
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('user_carts')
    .select('id,quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    // Atualizar quantidade
    const { data, error } = await supabase
      .from('user_carts')
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('*, product:products(*)')
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Criar novo
    const { data, error } = await supabase
      .from('user_carts')
      .insert([{ user_id: userId, product_id: productId, quantity }])
      .select('*, product:products(*)')
      .single();
    
    if (error) throw error;
    return data;
  }
}

export async function updateUserCartItem(cartId: string, quantity: number) {
  if (quantity <= 0) {
    return deleteUserCartItem(cartId);
  }
  
  const { data, error } = await supabase
    .from('user_carts')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartId)
    .select('*, product:products(*)')
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteUserCartItem(cartId: string) {
  const { error } = await supabase
    .from('user_carts')
    .delete()
    .eq('id', cartId);
  
  if (error) throw error;
}

export async function clearUserCart(userId: string) {
  const { error } = await supabase
    .from('user_carts')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES CRUD - ITENS DE VENDA
// ============================================

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
};

export async function getSaleItems(saleId: string) {
  const { data, error } = await supabase
    .from('sale_items')
    .select('*, product:products(*)')
    .eq('sale_id', saleId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as SaleItem[];
}

export async function getAllSaleItems() {
  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      id,
      sale_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      created_at,
      product:products(id, name, sku, image_url),
      sale:sales(id, order_number, customer_name, customer_email, status)
    `)
    .order('created_at', { ascending: false })
    .limit(500); // Limitar para melhor performance
  
  if (error) throw error;
  return data as any[];
}

export async function createSaleItem(item: Omit<SaleItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('sale_items')
    .insert([item])
    .select('*, product:products(*)')
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSalesWithItems() {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id, 
      order_number, 
      customer_name, 
      customer_email, 
      total_amount, 
      status, 
      created_at,
      sale_items(
        id, 
        product_name, 
        quantity, 
        unit_price, 
        total_price,
        product:products(id, name, sku, price, image_url)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(200); // Limitar para melhor performance
  
  if (error) throw error;
  return data;
}

export async function getSaleById(id: string) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items:sale_items(*, product:products(*))')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// FUNÇÕES CRUD - USUÁRIOS
// ============================================

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, user_type, accept_terms, consent_emails, created_at')
    .order('created_at', { ascending: false })
    .limit(1000); // Limitar para melhor performance
  
  if (error) throw error;
  return data;
}

// ============================================
// FUNÇÕES CRUD - IMAGENS DO SITE
// ============================================

export type SiteImage = {
  id: string;
  image_key: string;
  image_url: string;
  description?: string;
  section?: string;
  label?: string;
  alt_text?: string;
  created_at: string;
  updated_at: string;
};

export async function getSiteImages() {
  try {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar imagens do site:', error);
      // Retornar array vazio em vez de lançar erro
      return [];
    }
    return (data || []) as SiteImage[];
  } catch (err: any) {
    console.error('Erro na função getSiteImages:', err);
    // Retornar array vazio para não quebrar a aplicação
    return [];
  }
}

export async function createSiteImage(image: Omit<SiteImage, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('site_images')
    .insert([image])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSiteImage(id: string, updates: Partial<SiteImage>) {
  const { data, error } = await supabase
    .from('site_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSiteImage(id: string) {
  // Primeiro, buscar a imagem para deletar do storage também
  const { data: image } = await supabase
    .from('site_images')
    .select('image_url')
    .eq('id', id)
    .single();
  
  // Deletar do storage se existir URL
  if (image?.image_url) {
    try {
      await deleteSiteImageFromStorage(image.image_url);
    } catch (error) {
      console.error('Erro ao deletar imagem do storage:', error);
      // Continuar mesmo se falhar a deleção do storage
    }
  }
  
  // Deletar do banco de dados
  const { error } = await supabase
    .from('site_images')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES PARA UPLOAD DE IMAGENS NO STORAGE
// ============================================

/**
 * Upload de imagem de produto para o Supabase Storage
 * @param file - Arquivo de imagem
 * @param productId - ID do produto (opcional, para atualização)
 * @param productSku - SKU do produto para nomear o arquivo
 * @returns URL pública da imagem
 */
export async function uploadProductImage(
  file: File,
  productId?: string,
  productSku?: string
): Promise<string> {
  // Validar tipo de arquivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG ou WEBP.');
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('A imagem deve ter no máximo 5MB');
  }

  // Nome do arquivo: usar SKU ou timestamp
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = productSku 
    ? `products/${productSku}_${Date.now()}.${fileExtension}`
    : `products/${productId || Date.now()}_${Date.now()}.${fileExtension}`;

  // Upload para o bucket 'site_images'
  const bucketName = 'site_images';
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Erro no upload:', uploadError);
    throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Upload de PDF de invoice para o Supabase Storage
 * @param file - Arquivo PDF
 * @param invoiceId - ID da invoice
 * @returns URL pública do PDF
 */
export async function uploadInvoicePdf(
  file: File,
  invoiceId: string
): Promise<string> {
  // Validar tipo de arquivo (apenas PDF)
  if (file.type !== 'application/pdf') {
    throw new Error('Tipo de arquivo inválido. Apenas arquivos PDF são permitidos.');
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('O arquivo PDF deve ter no máximo 5MB');
  }

  // Nome do arquivo: usar invoiceId e timestamp
  const fileName = `${invoiceId}_${Date.now()}_${file.name}`;
  const path = `${invoiceId}/${fileName}`;

  // Upload para o bucket 'invoices'
  const bucketName = 'invoices';
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('Erro no upload do PDF:', uploadError);
    throw new Error(`Erro ao fazer upload do PDF: ${uploadError.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Deletar PDF do storage
 * @param pdfUrl - URL do PDF a ser deletado
 */
export async function deleteInvoicePdf(pdfUrl: string): Promise<void> {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(pdfUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'storage' || part === 'v1');
    
    if (bucketIndex === -1) {
      throw new Error('URL de PDF inválida');
    }

    // O bucket geralmente vem após 'storage/v1/object/public/'
    const bucketName = pathParts[bucketIndex + 3] || 'invoices';
    const filePath = pathParts.slice(bucketIndex + 4).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Erro ao deletar PDF:', error);
    throw new Error(`Erro ao deletar PDF: ${error.message || 'Erro desconhecido'}`);
  }
}

/**
 * Upload de imagem do site para o Supabase Storage (bucket 'imgs')
 * @param file - Arquivo de imagem
 * @param imageKey - Chave única da imagem (ex: 'hero_background', 'contato_banner')
 * @returns URL pública da imagem
 */
export async function uploadSiteImage(
  file: File,
  imageKey: string
): Promise<string> {
  // Validar tipo de arquivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG ou WEBP.');
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('A imagem deve ter no máximo 5MB');
  }

  // Nome do arquivo: usar imageKey e timestamp
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${imageKey}_${Date.now()}.${fileExtension}`;
  const path = `site-images/${fileName}`;

  // Upload para o bucket 'imgs'
  const bucketName = 'imgs';
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Erro no upload:', uploadError);
    throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Deletar imagem do site do storage
 * @param imageUrl - URL da imagem a ser deletada
 */
export async function deleteSiteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'storage' || part === 'v1');
    
    if (bucketIndex === -1) {
      throw new Error('URL de imagem inválida');
    }

    // O bucket geralmente vem após 'storage/v1/object/public/'
    const bucketName = pathParts[bucketIndex + 3] || 'imgs';
    const filePath = pathParts.slice(bucketIndex + 4).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      // Não lançar erro, apenas logar (a imagem pode não existir)
    }
  } catch (error: any) {
    console.error('Erro ao processar exclusão de imagem:', error);
    // Não lançar erro, apenas logar
  }
}

/**
 * Deletar imagem do storage
 * @param imageUrl - URL da imagem a ser deletada
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'storage' || part === 'v1');
    
    if (bucketIndex === -1) {
      throw new Error('URL de imagem inválida');
    }

    // O bucket geralmente vem após 'storage/v1/object/public/'
    const bucketName = pathParts[bucketIndex + 3] || 'site_images';
    const filePath = pathParts.slice(bucketIndex + 4).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      // Não lançar erro, apenas logar (a imagem pode não existir)
    }
  } catch (error: any) {
    console.error('Erro ao processar exclusão de imagem:', error);
    // Não lançar erro, apenas logar
  }
}


// Buscar pedidos de um usuário específico
export async function getUserOrders(userId: string) {
  const { data: orders, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Buscar items de cada pedido da tabela sale_items
  const ordersWithItems = await Promise.all(
    (orders || []).map(async (order) => {
      try {
        const { data: saleItems } = await supabase
          .from('sale_items')
          .select('*, product:products(*)')
          .eq('sale_id', order.id);
        
        return {
          ...order,
          items: saleItems || []
        };
      } catch {
        return {
          ...order,
          items: []
        };
      }
    })
  );
  
  return ordersWithItems;
}

// Buscar notas fiscais de um usuário (por email ou user_id)
export async function getUserInvoices(userId?: string, userEmail?: string) {
  let query = supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (userId) {
    // Se houver user_id na tabela invoices, buscar por ele
    query = query.eq('user_id', userId);
  } else if (userEmail) {
    // Buscar por email do cliente
    query = query.eq('customer_email', userEmail);
  }
  
  const { data: invoices, error } = await query;
  
  if (error) throw error;
  return invoices || [];
}

