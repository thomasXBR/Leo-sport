# ✅ Checklist de Configuração do Resend

## 1. Verificar Instalação
- [x] Pacote `resend` instalado (v6.5.2)
- [x] Código usando SDK oficial do Resend

## 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Importante:**
- A API Key deve começar com `re_`
- Obtenha sua chave em: https://resend.com/api-keys
- Reinicie o servidor após adicionar as variáveis

## 3. Verificar no Dashboard do Resend

1. **API Keys**: https://resend.com/api-keys
   - Verifique se a chave está ativa
   - Verifique se tem permissão para enviar emails

2. **Domínios**: https://resend.com/domains
   - Se usar `onboarding@resend.dev`, não precisa verificar domínio
   - Se usar seu próprio domínio, ele precisa estar verificado

3. **Emails (Desenvolvimento)**: https://resend.com/emails
   - Em modo desenvolvimento, adicione seu email de teste
   - O Resend só envia para emails autorizados em dev

## 4. Testar o Envio

### Opção 1: Criar uma conta de teste
- Crie uma conta no seu sistema
- Verifique os logs do servidor
- Verifique o dashboard do Resend

### Opção 2: Testar diretamente
Execute no terminal do servidor e verifique os logs:
```
📬 API de email de boas-vindas chamada
🔑 Verificando configuração do Resend
📧 Preparando envio de email via Resend
✅ Email de boas-vindas enviado com sucesso!
```

## 5. Problemas Comuns

### ❌ "RESEND_API_KEY não configurada"
**Solução:** Adicione a variável no `.env.local` e reinicie o servidor

### ❌ "Email from não verificado"
**Solução:** 
- Use `onboarding@resend.dev` (só funciona para emails adicionados manualmente)
- Ou verifique seu domínio no dashboard do Resend

### ❌ "Email de destino não autorizado"
**Solução:** Em desenvolvimento, adicione o email no dashboard do Resend

### ❌ Email não chega mas aparece como enviado
**Solução:**
- Verifique a pasta de spam
- Verifique o dashboard do Resend para ver o status
- Verifique se o email de destino está correto

## 6. Verificar Logs

Os logs mostrarão:
- ✅ Se a API Key foi encontrada
- ✅ Se o email foi enviado com sucesso
- ❌ Qualquer erro específico

## 7. Produção

Para produção, configure as variáveis de ambiente no seu provedor:
- Vercel: Settings → Environment Variables
- Railway: Variables
- Outros: Consulte a documentação do seu provedor

