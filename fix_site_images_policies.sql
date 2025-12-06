-- ============================================
-- POLÍTICAS RLS CORRETAS PARA O BUCKET site_images
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Vá para o Supabase Dashboard
-- 2. Acesse: Storage > site_images > Policies
-- 3. DELETE todas as políticas existentes (as que estão causando erro)
-- 4. Execute este SQL no SQL Editor do Supabase
-- 5. Ou crie as políticas manualmente usando as definições abaixo
--
-- ============================================

-- Primeiro, vamos garantir que o bucket existe e está público
-- (Execute isso se o bucket ainda não estiver configurado corretamente)

-- ============================================
-- POLÍTICA 1: Permitir SELECT (leitura) para todos (público)
-- ============================================
-- Nome: "Allow public read access"
-- Operação: SELECT
-- Aplicado a: public (todos)

CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site_images');

-- ============================================
-- POLÍTICA 2: Permitir INSERT (upload) para usuários autenticados
-- ============================================
-- Nome: "Allow authenticated users to upload"
-- Operação: INSERT
-- Aplicado a: authenticated (usuários logados)

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site_images');

-- ============================================
-- POLÍTICA 3: Permitir UPDATE para usuários autenticados
-- ============================================
-- Nome: "Allow authenticated users to update"
-- Operação: UPDATE
-- Aplicado a: authenticated

CREATE POLICY "Allow authenticated users to update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'site_images')
WITH CHECK (bucket_id = 'site_images');

-- ============================================
-- POLÍTICA 4: Permitir DELETE para usuários autenticados
-- ============================================
-- Nome: "Allow authenticated users to delete"
-- Operação: DELETE
-- Aplicado a: authenticated

CREATE POLICY "Allow authenticated users to delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'site_images');

-- ============================================
-- ALTERNATIVA: Se você quiser permitir upload para usuários anônimos também
-- (Use apenas se realmente precisar de uploads anônimos)
-- ============================================
-- Descomente a política abaixo se quiser permitir uploads anônimos:

/*
CREATE POLICY "Allow anon users to upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'site_images');
*/

-- ============================================
-- VERIFICAÇÃO: Para verificar se as políticas foram criadas
-- ============================================
-- Execute este comando para ver todas as políticas do bucket:

-- SELECT * FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%site_images%';

