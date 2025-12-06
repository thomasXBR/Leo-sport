# 🔧 Guia para Corrigir o Erro de Upload no Supabase

## ❌ Erro Atual
```
Erro ao fazer upload da imagem: new row violates row-level security policy
```

## 🎯 Solução

O problema é que as políticas RLS (Row Level Security) do bucket `site_images` não estão permitindo INSERT (upload de arquivos).

### 📋 Passo a Passo

#### **Opção 1: Usar o SQL Editor (Recomendado)**

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá para o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL de correção**
   - Abra o arquivo `fix_site_images_policies.sql` que foi criado
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run" ou pressione `Ctrl+Enter`

4. **Verifique se funcionou**
   - Tente fazer upload de uma imagem novamente
   - O erro deve desaparecer

#### **Opção 2: Criar Políticas Manualmente**

1. **Acesse Storage > Policies**
   - No Supabase Dashboard
   - Clique em "Storage" no menu lateral
   - Clique no bucket `site_images`
   - Vá para a aba "Policies"

2. **Delete as políticas antigas**
   - Delete todas as políticas que estão causando erro
   - Clique nos três pontos (⋯) ao lado de cada política
   - Selecione "Delete"

3. **Crie as novas políticas**

   **Política 1: Leitura Pública**
   - Clique em "New Policy"
   - Nome: `Allow public read access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'site_images'`
   - Salve

   **Política 2: Upload para Usuários Autenticados**
   - Clique em "New Policy"
   - Nome: `Allow authenticated users to upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'site_images'`
   - Salve

   **Política 3: Atualização para Usuários Autenticados**
   - Clique em "New Policy"
   - Nome: `Allow authenticated users to update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'site_images'`
   - WITH CHECK expression: `bucket_id = 'site_images'`
   - Salve

   **Política 4: Exclusão para Usuários Autenticados**
   - Clique em "New Policy"
   - Nome: `Allow authenticated users to delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'site_images'`
   - Salve

### ⚠️ Importante

- **Certifique-se de estar logado** quando fizer upload de imagens
- O bucket `site_images` deve estar marcado como **Público** (Public bucket)
- Se você quiser permitir uploads anônimos também, descomente a política alternativa no arquivo SQL

### 🔍 Verificar se Está Funcionando

1. Faça login no seu sistema
2. Tente fazer upload de uma imagem de produto
3. Se ainda der erro, verifique:
   - Se você está autenticado (logado)
   - Se o bucket `site_images` existe
   - Se o bucket está marcado como público
   - Se as políticas foram criadas corretamente

### 📝 Notas Técnicas

- As políticas RLS são aplicadas na tabela `storage.objects`
- O bucket `site_images` deve existir antes de criar as políticas
- Usuários `authenticated` = usuários que fizeram login
- Usuários `anon` = usuários não autenticados
- Usuários `public` = todos (inclui authenticated e anon)

### 🆘 Se Ainda Não Funcionar

1. Verifique se o bucket está público:
   - Storage > site_images > Settings
   - Marque "Public bucket" se não estiver marcado

2. Verifique se você está autenticado:
   - O código usa `supabase.auth.getUser()` para verificar autenticação
   - Certifique-se de estar logado antes de fazer upload

3. Verifique os logs do Supabase:
   - Vá para Logs > Postgres Logs
   - Procure por erros relacionados a RLS

