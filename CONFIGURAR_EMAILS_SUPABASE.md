# 📧 Configurar Emails no Supabase

## 📋 Índice
1. [Email de Confirmação](#1-email-de-confirmação)
2. [Email de Boas-Vindas com Cupom](#2-email-de-boas-vindas-com-cupom)
3. [SQL para Atualizar Schema](#3-sql-para-atualizar-schema)

---

## 1. Email de Confirmação

O Supabase já envia automaticamente um email de confirmação quando um usuário se cadastra. Você só precisa configurar o template.

### Passos:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em Authentication → Email Templates**
   - No menu lateral, clique em **Authentication**
   - Depois clique em **Email Templates**

3. **Configure o template "Confirm signup"**
   - Selecione **"Confirm signup"**
   - Personalize o assunto e o corpo do email
   - Use a variável `{{ .ConfirmationURL }}` para o link de confirmação

**Exemplo de template:**

```
Assunto: Confirme sua conta na LeoSport

Olá!

Bem-vindo à LeoSport! Por favor, confirme seu email clicando no link abaixo:

{{ .ConfirmationURL }}

Este link expira em 24 horas.

Se você não criou uma conta, ignore este email.

Atenciosamente,
Equipe LeoSport
```

4. **Ative a confirmação de email**
   - Vá em **Authentication → Settings**
   - Em **"User Management"**, ative:
     - ✅ **"Enable email confirmations"**
   - Em **"SMTP Settings"**, configure seu SMTP (ou use o SMTP gratuito do Supabase)

---

## 2. Email de Boas-Vindas com Cupom

Para enviar um email de boas-vindas com cupom após a confirmação, você precisa criar uma função Edge Function ou usar um webhook.

### Opção 1: Usar Edge Function (Recomendado)

1. **Crie uma Edge Function no Supabase**

No terminal, execute:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Inicializar projeto (se ainda não tiver)
supabase init

# Criar função
supabase functions new send-welcome-email
```

2. **Crie o arquivo da função:**

Crie o arquivo `supabase/functions/send-welcome-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { email, name, receiveEmails, userId } = await req.json()

    // Só enviar email se o usuário consentiu
    if (!receiveEmails) {
      return new Response(JSON.stringify({ message: 'User did not consent to emails' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Criar cupom de desconto
    const couponCode = `BEMVINDO${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const discountValue = 10 // 10% de desconto

    // Salvar cupom no banco (você precisa criar a tabela de cupons)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Criar cupom para o usuário
    await supabaseAdmin
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: 'percentage',
        discount_value: discountValue,
        user_id: userId,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        used: false,
      })

    // Enviar email de boas-vindas
    // Você pode usar Resend, SendGrid, ou outro serviço de email
    // Exemplo com Resend:
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'LeoSport <noreply@leosport.com>',
        to: email,
        subject: 'Bem-vindo à LeoSport! 🎉',
        html: `
          <h1>Bem-vindo à LeoSport, ${name}!</h1>
          <p>Obrigado por se cadastrar. Como agradecimento, ganhe <strong>${discountValue}% de desconto</strong> na sua primeira compra!</p>
          <p>Use o cupom: <strong>${couponCode}</strong></p>
          <p>Válido por 30 dias.</p>
          <p>Atenciosamente,<br>Equipe LeoSport</p>
        `,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

3. **Configure as variáveis de ambiente:**

No Supabase Dashboard:
- Vá em **Edge Functions → Settings**
- Adicione as variáveis:
  - `RESEND_API_KEY` (ou outro serviço de email)

4. **Disparar a função após confirmação:**

Você precisa criar um webhook ou trigger no Supabase que chame essa função quando o usuário confirmar o email.

---

### Opção 2: Usar Database Trigger (Mais Simples)

1. **Crie um trigger que dispara após confirmação:**

No SQL Editor do Supabase, execute:

```sql
-- Função para enviar email de boas-vindas
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Aqui você pode chamar uma Edge Function ou usar pg_notify
  -- Por enquanto, vamos apenas registrar no log
  RAISE NOTICE 'Usuário confirmado: %', NEW.email;
  
  -- Se o usuário consentiu em receber emails e tem receive_emails = true
  IF NEW.receive_emails = true THEN
    -- Criar cupom de desconto
    INSERT INTO coupons (
      code,
      discount_type,
      discount_value,
      user_id,
      valid_until,
      used
    ) VALUES (
      'BEMVINDO' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
      'percentage',
      10,
      NEW.id,
      NOW() + INTERVAL '30 days',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que dispara quando o email é confirmado
-- Nota: Isso precisa ser ajustado baseado em quando o email é confirmado
CREATE TRIGGER on_email_confirmed
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION send_welcome_email();
```

**⚠️ Nota:** O trigger acima é um exemplo. Você precisa adaptar baseado na estrutura do seu banco.

---

## 3. SQL para Atualizar Schema

Execute este SQL no Supabase para adicionar os campos necessários:

```sql
-- Adicionar campos à tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS receive_emails BOOLEAN DEFAULT false;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_receive_emails ON profiles(receive_emails);

-- Atualizar RLS se necessário
-- Certifique-se de que os usuários podem atualizar seus próprios dados
```

---

## 🔧 Configuração Simplificada (Recomendada para começar)

Para começar rapidamente:

1. **Ative confirmação de email no Supabase:**
   - Authentication → Settings → Enable email confirmations

2. **Personalize o template de confirmação:**
   - Authentication → Email Templates → Confirm signup

3. **Para o email de boas-vindas:**
   - Você pode criar um endpoint na sua aplicação Next.js que verifica usuários confirmados
   - Ou usar um serviço de email marketing como Mailchimp, Resend, ou SendGrid
   - Integre via API quando o usuário confirmar o email

---

## 📝 Checklist

- [ ] Ativar confirmação de email no Supabase
- [ ] Personalizar template de confirmação
- [ ] Adicionar campos `phone` e `receive_emails` na tabela `profiles`
- [ ] Configurar SMTP no Supabase
- [ ] Criar sistema de cupons (tabela `coupons`)
- [ ] Configurar email de boas-vindas (Edge Function ou serviço externo)
- [ ] Testar fluxo completo

---

**Nota:** Para produção, recomendo usar um serviço de email profissional como Resend, SendGrid ou AWS SES para emails transacionais.


