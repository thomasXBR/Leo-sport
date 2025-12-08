# Configuração do Supabase Storage para Notas Fiscais

## Configuração do Bucket no Supabase

### 1. Criar o Bucket

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá para **Storage** no menu lateral
3. Clique em **New bucket**
4. Nome do bucket: `invoices`
5. Marque como **Public bucket** (para permitir acesso público aos PDFs)
6. Clique em **Create bucket**

### 2. Configurar Políticas RLS (Row Level Security)

Configure as seguintes políticas no bucket `invoices`:

1. No bucket `invoices`, vá para **Policies**
2. Clique em **New Policy** para cada política abaixo

#### Política 1: Allow public read access for invoices (SELECT)

```sql
CREATE POLICY "Allow public read access for invoices"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'invoices'::text);
```

#### Política 2: Allow authenticated users to upload invoices (INSERT)

```sql
CREATE POLICY "Allow authenticated users to upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices'::text);
```

#### Política 3: Allow authenticated users to update invoices (UPDATE)

**IMPORTANTE:** Esta política verifica se o usuário é o owner do arquivo:

```sql
CREATE POLICY "Allow authenticated users to update invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING ((bucket_id = 'invoices'::text) AND (auth.uid() = owner));
```

#### Política 4: Allow authenticated users to delete invoices (DELETE)

**IMPORTANTE:** Esta política verifica se o usuário é o owner do arquivo:

```sql
CREATE POLICY "Allow authenticated users to delete invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING ((bucket_id = 'invoices'::text) AND (auth.uid() = owner));
```

### 3. Como o Owner é Definido

O campo `owner` é automaticamente definido no metadata do arquivo durante o upload. O código JavaScript já está configurado para:

- Obter o ID do usuário autenticado usando `supabase.auth.getUser()`
- Incluir o `owner` no metadata durante o upload:
  ```javascript
  metadata: {
    owner: user.id,
  }
  ```

### 4. Verificar Configuração

Após configurar, teste fazendo upload de um PDF através da interface do admin. O sistema irá:

1. Verificar se o usuário está autenticado
2. Fazer upload do PDF com o `owner` definido como o ID do usuário
3. Permitir apenas o owner do arquivo para fazer UPDATE ou DELETE

## Nota Importante

- A política de SELECT é pública, permitindo que qualquer pessoa com a URL acesse os PDFs
- As políticas de UPDATE e DELETE verificam se o usuário é o owner do arquivo
- Isso garante que apenas o usuário que fez upload pode modificar ou deletar seus próprios arquivos
- Para produção, considere usar buckets privados se precisar de mais segurança
