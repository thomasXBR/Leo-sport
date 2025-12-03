# Configuração de Políticas RLS para Reviews no Supabase

## Problema

Se você está recebendo o erro "Sem permissão para enviar avaliação" mesmo sendo admin, é necessário configurar as políticas RLS (Row Level Security) na tabela `reviews` do Supabase.

## Solução

### 1. Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Policies** ou **Table Editor** → selecione a tabela `reviews` → **RLS**

### 2. Crie as políticas necessárias

Na tabela `reviews`, você precisa criar as seguintes políticas:

#### Política 1: Permitir leitura pública de reviews
```sql
-- Nome: Permitir leitura de reviews
-- Operação: SELECT
-- Política: Permitir para todos (anonymous + authenticated)

CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);
```

#### Política 2: Permitir inserção de reviews por usuários autenticados
```sql
-- Nome: Permitir inserção de reviews autenticados
-- Operação: INSERT
-- Política: Permitir para usuários autenticados

CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (true);
```

#### Política 3: Permitir inserção de reviews por admins (BYPASS RLS)
```sql
-- Nome: Permitir inserção de reviews por admins
-- Operação: INSERT
-- Política: Permitir para admins

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
```

#### Política 4: Permitir inserção anônima (opcional)
```sql
-- Nome: Permitir inserção anônima de reviews
-- Operação: INSERT
-- Política: Permitir para usuários não autenticados (opcional)

CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (true);
```

### 3. Verificar se RLS está habilitado

Certifique-se de que RLS está habilitado na tabela:

```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

### 4. Alternativa: Desabilitar RLS temporariamente (NÃO RECOMENDADO para produção)

Se você quiser testar sem RLS (apenas para desenvolvimento):

```sql
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
```

⚠️ **ATENÇÃO**: Desabilitar RLS remove toda a segurança da tabela. Use apenas em desenvolvimento.

## Verificação

Após configurar as políticas:

1. Teste inserir uma avaliação como usuário comum
2. Teste inserir uma avaliação como admin
3. Verifique os logs no console do navegador (F12) para ver detalhes do erro

## Troubleshooting

Se ainda houver problemas:

1. Verifique se o `user_type` na tabela `profiles` está correto ('admin')
2. Verifique se o usuário está autenticado corretamente
3. Verifique os logs do Supabase no dashboard
4. Verifique se a tabela `profiles` também tem RLS configurado corretamente

## Nota

O código já foi atualizado para:
- Verificar se o usuário é admin
- Tentar inserir via API route se houver erro de permissão
- Mostrar mensagens de erro mais claras

As políticas RLS no Supabase são necessárias para que funcione corretamente.

