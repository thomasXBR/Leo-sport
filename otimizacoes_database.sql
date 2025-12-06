-- ============================================
-- OTIMIZAÇÕES DE ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================
-- Execute estes comandos no SQL Editor do Supabase para melhorar a performance

-- Índices para a tabela products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Índices para a tabela sales
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_customer_email ON sales(customer_email);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Índices para a tabela sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_created_at ON sale_items(created_at DESC);

-- Índices para a tabela user_carts
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_product_id ON user_carts(product_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_updated_at ON user_carts(updated_at DESC);

-- Índices para a tabela invoices
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);

-- Índices para a tabela profiles (users)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Índices para a tabela partnerships
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships(created_at DESC);

-- Índices para a tabela coupons
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);

-- Índices para a tabela inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- ============================================
-- POLÍTICAS RLS (Row Level Security) - Verificar se estão otimizadas
-- ============================================

-- Habilitar RLS nas tabelas se ainda não estiver
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessário)
-- Permitir leitura pública de produtos ativos
DROP POLICY IF EXISTS "Produtos ativos são visíveis publicamente" ON products;
CREATE POLICY "Produtos ativos são visíveis publicamente"
ON products FOR SELECT
USING (status = 'Ativo');

-- Permitir que usuários vejam seu próprio carrinho
DROP POLICY IF EXISTS "Usuários podem ver seu próprio carrinho" ON user_carts;
CREATE POLICY "Usuários podem ver seu próprio carrinho"
ON user_carts FOR ALL
USING (auth.uid() = user_id);

-- Permitir que usuários vejam suas próprias vendas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias vendas" ON sales;
CREATE POLICY "Usuários podem ver suas próprias vendas"
ON sales FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- CONFIGURAÇÃO DE REALTIME
-- ============================================

-- Habilitar realtime para a tabela user_carts (necessário para o recurso de carrinho em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE user_carts;

-- Verificar se as publicações estão corretas
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- VACUUM E ANALYZE PARA OTIMIZAR PERFORMANCE
-- ============================================

-- Execute periodicamente para manter as estatísticas atualizadas
VACUUM ANALYZE products;
VACUUM ANALYZE sales;
VACUUM ANALYZE sale_items;
VACUUM ANALYZE user_carts;
VACUUM ANALYZE invoices;
VACUUM ANALYZE profiles;
VACUUM ANALYZE partnerships;
VACUUM ANALYZE coupons;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. Execute estes comandos no SQL Editor do Supabase Dashboard
2. Os índices melhoram a velocidade de leitura mas podem deixar as escritas ligeiramente mais lentas
3. Monitore o uso de índices com: SELECT * FROM pg_stat_user_indexes;
4. Remova índices não utilizados para economizar espaço
5. Configure políticas RLS apropriadas para sua aplicação
6. Teste a performance antes e depois de aplicar os índices
*/

