-- ============================================
-- CONFIGURAÇÃO COMPLETA PARA TABELA REVIEWS
-- Baseado no schema real do Supabase
-- ============================================

-- Estrutura da tabela reviews (conforme schema):
-- - id: int8 (bigint, PRIMARY KEY, auto-increment)
-- - product_id: text
-- - user_id: uuid (FK para auth.users.id)
-- - stars: int4 (integer)
-- - comment: text
-- - created_at: timestamp

-- ============================================
-- 1. VERIFICAR ESTRUTURA DA TABELA
-- ============================================

-- Verificar se a tabela existe e suas colunas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Verificar constraints e foreign keys
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'reviews';

-- ============================================
-- 2. CONFIGURAR POLÍTICAS RLS
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de reviews" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews autenticados" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews por admins" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção anônima de reviews" ON reviews;
DROP POLICY IF EXISTS "Permitir atualização de próprio review" ON reviews;
DROP POLICY IF EXISTS "Permitir deleção de próprio review" ON reviews;

-- Habilitar RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política 1: Leitura pública (qualquer um pode ler reviews)
CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);

-- Política 2: Inserção para usuários autenticados
-- Permite que qualquer usuário autenticado insira uma review
-- Verifica se user_id corresponde ao usuário autenticado (ou é null para anônimo)
CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Política 3: Inserção para admins
-- Permite que admins insiram reviews (mesmo para outros usuários se necessário)
CREATE POLICY "Permitir inserção de reviews por admins"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Política 4: Inserção anônima (opcional)
-- Permite inserção sem autenticação (user_id será null)
CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Política 5: Atualização (permitir editar própria review)
CREATE POLICY "Permitir atualização de próprio review"
ON reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política 6: Deleção (permitir deletar própria review ou admins)
CREATE POLICY "Permitir deleção de próprio review"
ON reviews
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- ============================================
-- 3. VERIFICAR E CONFIGURAR TABELA PROFILES
-- ============================================

-- Verificar se profiles tem RLS configurado corretamente
-- (necessário para a política de admin funcionar)

-- Política para permitir leitura do próprio perfil e para verificação de admin
CREATE POLICY IF NOT EXISTS "Permitir leitura de perfil para RLS"
ON profiles
FOR SELECT
USING (
  id = auth.uid() OR
  user_type = 'admin'
);

-- Política alternativa mais permissiva (para desenvolvimento)
-- CREATE POLICY IF NOT EXISTS "Permitir leitura de perfis"
-- ON profiles
-- FOR SELECT
-- USING (true);

-- ============================================
-- 4. VERIFICAR CONSTRAINTS E VALIDAÇÕES
-- ============================================

-- Adicionar constraints se necessário

-- Garantir que stars está entre 1 e 5
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_stars_check;

ALTER TABLE reviews
ADD CONSTRAINT reviews_stars_check
CHECK (stars >= 1 AND stars <= 5);

-- Garantir que comment não é vazio
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_comment_check;

ALTER TABLE reviews
ADD CONSTRAINT reviews_comment_check
CHECK (length(trim(comment)) > 0);

-- Garantir que product_id não é null
ALTER TABLE reviews
ALTER COLUMN product_id SET NOT NULL;

-- Garantir que stars não é null
ALTER TABLE reviews
ALTER COLUMN stars SET NOT NULL;

-- Garantir que comment não é null
ALTER TABLE reviews
ALTER COLUMN comment SET NOT NULL;

-- ============================================
-- 5. VERIFICAR FOREIGN KEY
-- ============================================

-- Verificar se existe a foreign key para auth.users
-- Se não existir, criar:

-- Primeiro, verificar se a constraint já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_user_id_fkey'
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews
    ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL; -- Se usuário for deletado, user_id fica null
  END IF;
END $$;

-- ============================================
-- 6. VERIFICAR ÍNDICES (para performance)
-- ============================================

-- Criar índices se não existirem

-- Índice para buscar reviews por produto
CREATE INDEX IF NOT EXISTS idx_reviews_product_id
ON reviews(product_id);

-- Índice para buscar reviews por usuário
CREATE INDEX IF NOT EXISTS idx_reviews_user_id
ON reviews(user_id);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_reviews_created_at
ON reviews(created_at DESC);

-- Índice composto para produto + data
CREATE INDEX IF NOT EXISTS idx_reviews_product_created
ON reviews(product_id, created_at DESC);

-- ============================================
-- 7. TESTAR INSERÇÃO
-- ============================================

-- Teste 1: Verificar se pode inserir como anônimo
-- (apenas se a política anônima estiver ativa)
/*
INSERT INTO reviews (product_id, stars, comment, user_id)
VALUES ('test-product-123', 5, 'Teste de review anônimo', NULL);
*/

-- Teste 2: Verificar se pode inserir como autenticado
-- (substitua 'seu-user-id-aqui' pelo UUID de um usuário autenticado)
/*
INSERT INTO reviews (product_id, stars, comment, user_id)
VALUES ('test-product-123', 5, 'Teste de review autenticado', 'seu-user-id-aqui');
*/

-- ============================================
-- 8. VERIFICAR POLÍTICAS CRIADAS
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

