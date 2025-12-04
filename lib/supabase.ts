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
  phone?: string;
  accept_terms?: boolean;
  consent_emails?: boolean;
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
  form_payload?: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category_id?: string;
  brand?: string;
  price: number;
  fake_price?: number;
  stock_quantity: number;
  weight?: string;
  dimensions?: string;
  image_url?: string;
  color?: string;
  features?: string;
  specifications?: string;
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
  created_at: string;
};

export type ReviewWithUser = Review & {
  user: { id: string; name: string; avatar_url?: string } | null
};

export type InventoryMovement = {
  id: string;
  product_id: string;
  product_name: string;
  movement_type: 'Entrada' | 'Saída' | 'Ajuste';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  created_by?: string;
  created_at: string;
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

export type SiteImage = {
  id: string;
  image_key: string;
  section: string;
  label: string;
  image_url?: string;
  alt_text?: string;
  description?: string;
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
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  // Busca produto com categoria, mas não inclui reviews (são carregadas separadamente)
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
// FUNÇÕES CRUD - ESTOQUE
// ============================================

export async function getInventoryMovements() {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, products(name, sku)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getInventoryItems() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_quantity, status')
    .order('name');
  
  if (error) throw error;
  return data.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.stock_quantity,
    status: item.stock_quantity === 0 ? 'Esgotado' : 
            item.stock_quantity < 20 ? 'Estoque Baixo' : 'Em Estoque'
  }));
}

export async function createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'created_at'>) {
  // Primeiro, buscar a quantidade atual do produto
  const { data: product } = await supabase
    .from('products')
    .select('stock_quantity, name')
    .eq('id', movement.product_id)
    .single();
  
  if (!product) throw new Error('Produto não encontrado');
  
  const previousQuantity = product.stock_quantity;
  let newQuantity = previousQuantity;
  
  if (movement.movement_type === 'Entrada') {
    newQuantity = previousQuantity + movement.quantity;
  } else if (movement.movement_type === 'Saída') {
    newQuantity = Math.max(0, previousQuantity - movement.quantity);
  } else if (movement.movement_type === 'Ajuste') {
    newQuantity = movement.new_quantity;
  }
  
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([{
      ...movement,
      product_name: product.name,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteInventoryMovement(id: string) {
  const { error } = await supabase
    .from('inventory_movements')
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
    .select('*')
    .order('created_at', { ascending: false });
  
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
    .select('*')
    .order('created_at', { ascending: false });
  
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
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'Ativo')
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });
    
    if (error) {
      // Se o erro for sobre coluna não encontrada, retorna array vazio
      if (error.message?.includes('column') && error.message?.includes('show_in_navbar')) {
        console.warn('Coluna show_in_navbar não existe ainda. Retornando array vazio.');
        return [];
      }
      throw error;
    }
    
    // Filtrar client-side se a coluna existe, caso contrário retornar vazio
    if (data && data.length > 0 && 'show_in_navbar' in data[0]) {
      return data.filter(coupon => coupon.show_in_navbar === true) || [];
    }
    
    return [];
  } catch (error: any) {
    // Se for erro de coluna não encontrada, retorna array vazio silenciosamente
    if (error?.message?.includes('column') || error?.code === 'PGRST116') {
      console.warn('Coluna show_in_navbar não existe no banco de dados ainda.');
      return [];
    }
    throw error;
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
  const { data, error } = await supabase
    .from('partnerships')
    .insert([partnership])
    .select()
    .single();
  
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section, content_key');
  
  if (error) throw error;
  return data;
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
// FUNÇÕES CRUD - IMAGENS DO SITE
// ============================================

export async function getSiteImages() {
  const { data, error } = await supabase
    .from('site_images')
    .select('*')
    .order('section, image_key');
  
  if (error) throw error;
  return data;
}

export async function getSiteImageByKey(imageKey: string) {
  const { data, error } = await supabase
    .from('site_images')
    .select('*')
    .eq('image_key', imageKey)
    .single();
  
  if (error) throw error;
  return data;
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
  const { error } = await supabase
    .from('site_images')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FUNÇÕES CRUD - USUÁRIOS
// ============================================

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// ============================================
// FUNÇÕES CRUD - PEDIDOS E ITENS
// ============================================

export async function getSalesWithItems() {
  // Buscar vendas com informações dos produtos (se houver order_items)
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (salesError) throw salesError;
  
  // Tentar buscar items dos pedidos se a tabela existir
  const salesWithItems = await Promise.all(
    (sales || []).map(async (sale) => {
      try {
        // Tentar buscar order_items relacionados
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', sale.id);
        
        return {
          ...sale,
          items: orderItems || []
        };
      } catch {
        // Se a tabela não existir, retornar sem items
        return {
          ...sale,
          items: []
        };
      }
    })
  );
  
  return salesWithItems;
}

export async function getSaleById(id: string) {
  const { data: sale, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Tentar buscar items do pedido
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', id);
    
    return {
      ...sale,
      items: orderItems || []
    };
  } catch {
    return {
      ...sale,
      items: []
    };
  }
}

