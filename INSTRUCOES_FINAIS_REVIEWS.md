# ✅ Instruções Finais - Configurar Reviews no Supabase

## 📋 O que foi feito no código:

1. ✅ Código adaptado ao schema real do Supabase
2. ✅ Validação de UUID para `user_id`
3. ✅ Tratamento de erros melhorado
4. ✅ Suporte para admins
5. ✅ Fallback para API route

## 🚀 O que você precisa fazer no Supabase:

### Passo 1: Execute o SQL no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo: **`CONFIGURAR_SUPABASE_COMPLETO.sql`**
5. Copie TODO o conteúdo
6. Cole no SQL Editor
7. Clique em **RUN** (ou pressione Ctrl+Enter)

### Passo 2: Verificar se funcionou

Após executar o SQL, verifique:

1. Vá em **Table Editor** → `reviews`
2. Clique na aba **RLS**
3. Deve aparecer 4 políticas:
   - ✅ Permitir leitura de reviews
   - ✅ Permitir inserção de reviews autenticados
   - ✅ Permitir inserção de reviews por admins
   - ✅ Permitir inserção anônima de reviews

### Passo 3: Testar

1. Volte para a página do produto
2. Tente enviar uma avaliação como admin
3. Deve funcionar! 🎉

---

## 🔍 Se ainda não funcionar:

### Verificar no Console do Navegador (F12)

Procure por estas mensagens:

```
Tentando inserir review: { ... }
Erro ao inserir review diretamente: { 
  code: "...",
  message: "...",
  details: "..."
}
```

**Compartilhe o erro completo para diagnóstico.**

### Verificar no Supabase

1. Vá em **Table Editor** → `reviews` → **RLS**
2. Veja se as políticas estão ativas (toggle ON)
3. Veja se há algum erro nas políticas

### Verificar Tabela Profiles

A política de admin depende da tabela `profiles`. Verifique:

1. Vá em **Table Editor** → `profiles`
2. Veja se o seu usuário tem `user_type = 'admin'`
3. Veja se a tabela `profiles` também tem RLS configurado

---

## 📝 Schema Esperado:

```
Tabela: reviews
- id: int8 (bigint, PRIMARY KEY, auto-increment)
- product_id: text
- user_id: uuid (FK para auth.users.id, nullable)
- stars: int4 (1-5)
- comment: text
- created_at: timestamp (auto)
```

---

## ⚠️ Problemas Comuns:

### Erro: "Foreign key violation"
- Verifique se o `user_id` existe em `auth.users`
- Verifique se está usando UUID válido

### Erro: "Check constraint violation"
- `stars` deve estar entre 1 e 5
- `comment` não pode estar vazio

### Erro: "Permission denied" (42501)
- Políticas RLS não configuradas ou bloqueando
- Execute o SQL novamente

### Erro: "Invalid UUID format" (22P02)
- `user_id` deve ser um UUID válido
- Formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## 🎯 Arquivos Criados:

1. **`CONFIGURAR_SUPABASE_COMPLETO.sql`** - Script SQL completo
2. **`SUPABASE_SCHEMA_REVIEWS.sql`** - Script detalhado com verificações
3. **`RESOLVER_ERRO_REVIEWS.md`** - Guia rápido de resolução
4. **`DIAGNOSTICO_ERRO_REVIEWS.md`** - Diagnóstico detalhado

---

## ✅ Checklist Final:

- [ ] Executei o SQL no Supabase
- [ ] Verifiquei que as políticas RLS foram criadas
- [ ] Verifiquei que minha conta tem `user_type = 'admin'`
- [ ] Testei enviar uma avaliação
- [ ] Funcionou! 🎉

Se tudo estiver correto e ainda não funcionar, compartilhe:
- O erro completo do console
- Screenshot das políticas RLS
- O resultado do teste de inserção

