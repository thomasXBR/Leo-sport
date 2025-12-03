-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE AGORA
-- ============================================
-- 1. Vá para: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Clique em "SQL Editor"
-- 4. Cole este código completo
-- 5. Clique em "RUN"
-- ============================================

-- PASSO 1: Remover políticas antigas
DROP POLICY IF EXISTS "Permitir leitura de reviews" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews autenticados" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews por admins" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção anônima de reviews" ON reviews;

-- PASSO 2: Habilitar RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Política 1 - LEITURA (qualquer um pode ler)
CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);

-- PASSO 4: Política 2 - INSERÇÃO para usuários autenticados
CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- PASSO 5: Política 3 - INSERÇÃO para admins
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

-- PASSO 6: Política 4 - INSERÇÃO anônima (opcional)
CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- PASSO 7: Garantir que profiles permite leitura (CRÍTICO!)
-- A política de admin precisa ler a tabela profiles
-- Se a tabela profiles não tiver RLS habilitado, pode pular este passo
-- Mas se tiver RLS, precisa desta política:

-- Primeiro, remover política antiga se existir
DROP POLICY IF EXISTS "Permitir leitura de perfis para RLS" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON profiles;

-- Versão mais simples e permissiva (recomendada para resolver o problema):
CREATE POLICY "Permitir leitura de perfis"
ON profiles
FOR SELECT
USING (true);

-- ============================================
-- PRONTO! Agora teste enviar uma avaliação.
-- ============================================

