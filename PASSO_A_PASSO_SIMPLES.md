# 🎯 PASSO A PASSO SIMPLES - Resolver Erro de Permissão

## O que você precisa fazer:

### 1️⃣ Abra o Supabase
- Vá para: **https://supabase.com/dashboard**
- Faça login
- Selecione seu projeto

### 2️⃣ Abra o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**

### 3️⃣ Abra o arquivo SQL
- No seu editor de código, abra o arquivo: **`EXECUTAR_ISSO_NO_SUPABASE.sql`**

### 4️⃣ Copie o SQL
- Selecione TODO o conteúdo do arquivo (Ctrl+A)
- Copie (Ctrl+C)

### 5️⃣ Cole no Supabase
- No SQL Editor do Supabase, cole o código (Ctrl+V)

### 6️⃣ Execute
- Clique no botão **"RUN"** (ou pressione Ctrl+Enter)

### 7️⃣ Aguarde
- Você deve ver mensagens de sucesso
- Se aparecer erro, copie o erro e me envie

### 8️⃣ Teste
- Volte para a página do produto
- Tente enviar uma avaliação novamente
- Deve funcionar! ✅

---

## 📝 O que esse SQL faz?

Cria as "regras de segurança" no Supabase para permitir que:
- ✅ Qualquer um possa **ler** reviews
- ✅ Usuários logados possam **criar** reviews
- ✅ Admins possam **criar** reviews
- ✅ Visitantes anônimos possam **criar** reviews

---

## ❓ Por que está dando erro?

Porque o Supabase está **bloqueando tudo** por padrão quando RLS está habilitado. Sem essas políticas, **ninguém** pode inserir dados, nem mesmo admins.

O SQL que você vai executar cria essas políticas para permitir as operações.

---

## 🆘 Precisa de ajuda?

Se após executar o SQL ainda não funcionar, me envie:
1. O erro que apareceu no SQL Editor (se houver)
2. O erro que aparece na página quando tenta enviar avaliação
3. Screenshot da aba "RLS" da tabela reviews no Supabase

---

**O código está correto. É só executar o SQL no Supabase que resolve!**

