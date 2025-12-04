-- ============================================
-- ATUALIZAR SCHEMA PARA CADASTRO COMPLETO
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Adicionar campos à tabela profiles (se ainda não existirem)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS accept_terms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_emails BOOLEAN DEFAULT false;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_accept_terms ON profiles(accept_terms);
CREATE INDEX IF NOT EXISTS idx_profiles_consent_emails ON profiles(consent_emails);

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('phone', 'accept_terms', 'consent_emails');

-- ============================================
-- PRONTO! Os campos foram adicionados.
-- ============================================

