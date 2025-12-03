# ⚠️ AÇÃO URGENTE NECESSÁRIA

## O erro que você está vendo:
**"Erro de permissão mesmo sendo admin. Verifique as políticas RLS no Supabase."**

## Por que isso acontece?
O Supabase está **bloqueando todas as inserções** porque as políticas de segurança (RLS) não estão configuradas.

## ✅ SOLUÇÃO (2 minutos):

### Passo 1: Acesse o Supabase
1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral esquerdo, clique em **"SQL Editor"**

### Passo 2: Execute o SQL
1. Abra o arquivo **`EXECUTAR_ISSO_NO_SUPABASE.sql`** que criei
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor do Supabase
5. Clique no botão **"RUN"** (ou pressione Ctrl+Enter)

### Passo 3: Verificar
Você deve ver mensagens de sucesso. Se houver erro, copie e me envie.

### Passo 4: Testar
Volte para a página do produto e tente enviar uma avaliação novamente.

---

## 📁 Arquivo para executar:
**`EXECUTAR_ISSO_NO_SUPABASE.sql`**

Este arquivo contém todo o SQL necessário para configurar as políticas de segurança.

---

## 🔍 Se ainda não funcionar:
1. Abra o console do navegador (F12)
2. Tente enviar uma avaliação
3. Procure por mensagens de erro
4. Compartilhe o erro completo comigo

---

**IMPORTANTE: O código está 100% correto. O problema é que o Supabase precisa das políticas RLS configuradas. Execute o SQL e deve funcionar!**

