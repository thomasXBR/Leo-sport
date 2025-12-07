# Configuração do Supabase Storage para Notas Fiscais

## Problema: Erro "new row violates row-level security policy"

Este erro ocorre quando o bucket do Supabase Storage não tem as políticas RLS (Row Level Security) configuradas corretamente.

## Solução: Configurar o Bucket no Supabase

### 1. Criar o Bucket (se não existir)

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá para **Storage** no menu lateral
3. Clique em **New bucket**
4. Nome do bucket: `invoices`
5. Marque como **Public bucket** (se quiser URLs públicas) ou **Private bucket** (se precisar de autenticação)
6. Clique em **Create bucket**

### 2. Configurar Políticas RLS (Row Level Security)

Se o bucket for **Private**, você precisa configurar políticas para permitir uploads:

1. No bucket `invoices`, vá para **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Nome da política: `Allow authenticated users to upload invoices`
5. Política:

```sql
-- Para permitir INSERT (upload)
CREATE POLICY "Allow authenticated users to upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');

-- Para permitir SELECT (download/visualização)
CREATE POLICY "Allow authenticated users to view invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');

-- Para permitir UPDATE (substituir arquivos)
CREATE POLICY "Allow authenticated users to update invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'invoices');

-- Para permitir DELETE (remover arquivos)
CREATE POLICY "Allow authenticated users to delete invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'invoices');
```

### 3. Alternativa: Bucket Público

Se preferir um bucket público (menos seguro, mas mais simples):

1. Crie o bucket como **Public**
2. Configure apenas a política de INSERT para usuários autenticados:

```sql
CREATE POLICY "Allow authenticated users to upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');
```

### 4. Verificar Configuração

Após configurar, teste fazendo upload de um PDF através da interface do admin.

## Nota Importante

- Buckets públicos permitem que qualquer pessoa com a URL acesse os arquivos
- Buckets privados são mais seguros, mas requerem autenticação para acesso
- Para produção, recomenda-se usar buckets privados com políticas RLS adequadas
