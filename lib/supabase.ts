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
  stock_quantity: number;
  weight?: string;
  dimensions?: string;
  image_url?: string;
  status: 'Ativo' | 'Inativo' | 'Esgotado';
  created_at: string;
  updated_at: string;
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

// ============================================
// FUNÇÕES CRUD - PRODUTOS
// ============================================

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('coupons')
    .insert([coupon])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
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


