# 🎯 Resolver Erro de Avaliações - Guia Rápido

## ✅ Diagnóstico: O Erro Está no SUPABASE

O erro **"Sem permissão para enviar avaliação"** vem do **Supabase RLS (Row Level Security)** bloqueando a inserção.

### O código está correto, mas precisa configurar as políticas RLS no Supabase!

---

## 🚀 Solução Rápida (5 minutos)

### Passo 1: Acesse o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Execute Este SQL

Copie e cole no SQL Editor e execute:

```sql
-- ============================================
-- POLÍTICAS RLS PARA TABELA REVIEWS
-- ============================================

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir leitura de reviews" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews autenticados" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção de reviews por admins" ON reviews;
DROP POLICY IF EXISTS "Permitir inserção anônima de reviews" ON reviews;

-- 2. Habilitar RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 3. Política 1: Permitir LEITURA para todos
CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);

-- 4. Política 2: Permitir INSERÇÃO para usuários autenticados
CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Política 3: Permitir INSERÇÃO para admins (verificando perfil)
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

-- 6. Política 4: Permitir INSERÇÃO anônima (opcional - remover se não quiser)
CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (true);
```

### Passo 3: Verificar se a tabela profiles permite leitura

A política de admin precisa ler a tabela `profiles`. Execute também:

```sql
-- Verificar se profiles tem política de leitura
-- Se não tiver, adicione:

CREATE POLICY IF NOT EXISTS "Permitir leitura de próprio perfil"
ON profiles
FOR SELECT
USING (auth.uid() = id OR user_type = 'admin');

-- Ou mais permissivo (para desenvolvimento):
CREATE POLICY IF NOT EXISTS "Permitir leitura de perfis"
ON profiles
FOR SELECT
USING (true);
```

### Passo 4: Testar

1. Volte para a página do produto
2. Tente enviar uma avaliação como admin
3. Deve funcionar! ✅

---

## 🔍 Se Ainda Não Funcionar

### Verificar no Console do Navegador (F12)

Procure por:
```
Erro ao inserir review diretamente: {
  code: "...",
  message: "...",
  details: "..."
}
```

**Compartilhe essas informações para diagnóstico mais preciso.**

### Verificar se é realmente Admin

No console do navegador, execute:

```javascript
// Estar logado na página
localStorage.getItem('supabase.auth.token')
```

Ou veja no Network tab se o `userId` está sendo enviado.

### Verificar no Supabase

1. Vá em **Table Editor** → `reviews`
2. Verifique se há reviews antigas (para confirmar que a tabela existe)
3. Vá em **Authentication** → **Policies** → `reviews`
4. Verifique se as políticas foram criadas

---

## 📝 Notas Importantes

1. **O código está correto** - O problema é configuração do Supabase
2. **RLS é necessário** - Mantém a segurança do banco
3. **Após configurar**, pode levar alguns segundos para as políticas atualizarem
4. **Se usar service role**, pode ignorar RLS, mas não recomendado para produção

---

## ✅ Checklist de Verificação

- [ ] Executei o SQL no Supabase
- [ ] As políticas foram criadas (verificar em Policies)
- [ ] RLS está habilitado na tabela reviews
- [ ] A tabela profiles também tem política de leitura
- [ ] Testei enviar uma avaliação
- [ ] Funcionou! 🎉

---

**Se após seguir todos os passos ainda não funcionar, compartilhe:**
1. O erro completo do console (code, message, details)
2. Screenshot das políticas criadas no Supabase
3. Se consegue ler reviews (SELECT funciona?)

