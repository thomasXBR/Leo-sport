# 🔧 Solução Alternativa - Enquanto Configura o RLS

## ⚠️ Solução Temporária (Para Testar)

Se você não conseguiu configurar o RLS ainda, existe uma solução temporária:

### Opção 1: Desabilitar RLS Temporariamente (APENAS PARA DESENVOLVIMENTO)

⚠️ **ATENÇÃO**: Isso remove toda a segurança! Use apenas para testar.

No SQL Editor do Supabase, execute:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA TESTE)
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
```

**Depois dos testes, reabilite:**

```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Solução Correta (Recomendada)

Execute o arquivo **`EXECUTAR_ISSO_NO_SUPABASE.sql`** que criei. Este é o caminho correto e seguro.

---

## 🔍 Diagnóstico Rápido

### 1. Verifique se você é realmente admin

No Supabase Dashboard:
1. Vá em **Table Editor** → `profiles`
2. Procure seu usuário
3. Veja se `user_type` = `'admin'`
4. Se não for, altere manualmente

### 2. Verifique as políticas RLS

1. Vá em **Table Editor** → `reviews` → aba **"RLS"**
2. Veja se há políticas criadas
3. Se não houver, execute o SQL que criei

### 3. Verifique logs no console

Abra F12 → Console e procure por:
```
[API Reviews] Erro ao inserir: { code: "...", details: "..." }
```

---

## 🎯 Ação Imediata

**Execute este SQL no Supabase agora:**

Abra o arquivo **`EXECUTAR_ISSO_NO_SUPABASE.sql`** e execute todo o conteúdo no SQL Editor do Supabase.

Isso vai resolver o problema definitivamente!

