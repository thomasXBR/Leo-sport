-- ============================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE
-- Baseado no schema real: reviews (id: int8, product_id: text, user_id: uuid, stars: int4, comment: text, created_at: timestamp)
-- ============================================

-- ============================================
-- PARTE 1: VERIFICAR ESTRUTURA
-- ============================================

-- Verificar estrutura da tabela reviews
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- ============================================
-- PARTE 2: CONFIGURAR CONSTRAINTS
-- ============================================

-- Garantir que stars está entre 1 e 5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_stars_check'
  ) THEN
    ALTER TABLE reviews
    ADD CONSTRAINT reviews_stars_check
    CHECK (stars >= 1 AND stars <= 5);
  END IF;
END $$;

-- Garantir que comment não é vazio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_comment_check'
  ) THEN
    ALTER TABLE reviews
    ADD CONSTRAINT reviews_comment_check
    CHECK (length(trim(comment)) > 0);
  END IF;
END $$;

-- ============================================
-- PARTE 3: CONFIGURAR FOREIGN KEY
-- ============================================

-- Verificar/criar foreign key para auth.users
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
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- PARTE 4: CONFIGURAR ÍNDICES (Performance)
-- ============================================

-- Índice para buscar reviews por produto
CREATE INDEX IF NOT EXISTS idx_reviews_product_id
ON reviews(product_id);

-- Índice para buscar reviews por usuário
CREATE INDEX IF NOT EXISTS idx_reviews_user_id
ON reviews(user_id)
WHERE user_id IS NOT NULL;

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_reviews_created_at
ON reviews(created_at DESC);

-- Índice composto para produto + data (usado na query principal)
CREATE INDEX IF NOT EXISTS idx_reviews_product_created
ON reviews(product_id, created_at DESC);

-- ============================================
-- PARTE 5: CONFIGURAR POLÍTICAS RLS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Permitir leitura de reviews" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews autenticados" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews por admins" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção anônima de reviews" ON reviews;

-- Habilitar RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política 1: LEITURA - Qualquer um pode ler reviews
CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);

-- Política 2: INSERÇÃO - Usuários autenticados podem inserir
-- Verifica se user_id corresponde ao usuário autenticado OU é null
CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Política 3: INSERÇÃO - Admins podem inserir reviews
-- Admins podem inserir mesmo que user_id não seja deles
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

-- Política 4: INSERÇÃO - Anônimos podem inserir (user_id será null)
CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- ============================================
-- PARTE 6: CONFIGURAR PROFILES (para verificação de admin)
-- ============================================

-- Garantir que profiles permite leitura para verificação de admin
CREATE POLICY IF NOT EXISTS "Permitir leitura de perfil para RLS"
ON profiles
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.user_type = 'admin'
  )
);

-- Política alternativa mais permissiva (se a anterior não funcionar)
-- CREATE POLICY IF NOT EXISTS "Permitir leitura de perfis para verificação"
-- ON profiles
-- FOR SELECT
-- USING (true);

-- ============================================
-- PARTE 7: VERIFICAR CONFIGURAÇÃO
-- ============================================

-- Verificar políticas criadas
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

-- Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reviews'
ORDER BY indexname;

-- Verificar constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'reviews'::regclass
ORDER BY conname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Após executar este script, teste inserir uma review e verifique os logs.

