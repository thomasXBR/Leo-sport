# 📧 Como Configurar o Envio de Emails

Agora o sistema usa **Nodemailer com SMTP**, que é mais simples e não precisa de serviços externos como Resend.

## 🚀 Configuração Rápida

### Opção 1: Gmail (Mais Fácil)

1. **Crie o arquivo `.env.local`** na raiz do projeto:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=seu-email@gmail.com
```

2. **Crie uma Senha de App no Gmail:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite "LeoSport" e clique em "Gerar"
   - Copie a senha gerada (16 caracteres)
   - Use essa senha no `SMTP_PASS` (não use sua senha normal do Gmail)

3. **Reinicie o servidor:**
```bash
npm run dev
```

### Opção 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
SMTP_FROM=seu-email@outlook.com
```

### Opção 3: Outros Provedores

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha
SMTP_FROM=seu-email@yahoo.com
```

**Servidor SMTP Personalizado:**
```env
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_USER=usuario@seudominio.com
SMTP_PASS=sua-senha
SMTP_FROM=noreply@seudominio.com
```

## ✅ Testar

1. Crie uma conta de teste no sistema
2. Verifique os logs do servidor - deve aparecer:
   - "✅ Email de boas-vindas enviado com sucesso!"
3. Verifique sua caixa de entrada (e spam)

## 🔧 Solução de Problemas

### Erro: "Invalid login"
- Verifique se o email e senha estão corretos
- Para Gmail, use Senha de App (não a senha normal)

### Erro: "Connection timeout"
- Verifique se a porta está correta (587 para TLS, 465 para SSL)
- Verifique se o firewall não está bloqueando

### Email não chega
- Verifique a pasta de spam
- Verifique se o email de destino está correto
- Verifique os logs do servidor para erros

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` (TLS) ou `465` (SSL) |
| `SMTP_USER` | Email de envio | `seu-email@gmail.com` |
| `SMTP_PASS` | Senha do email | `sua-senha-de-app` |
| `SMTP_FROM` | Nome/Email remetente | `seu-email@gmail.com` |

## 🎉 Pronto!

Agora os emails serão enviados automaticamente quando alguém criar uma conta!

