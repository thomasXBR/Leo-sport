# Guia Rápido de Configuração - Integrações

## ✅ O que foi implementado

- ✅ Cliente Mercado Pago com suporte a credenciais de teste
- ✅ API routes para criação de preferência de pagamento
- ✅ Webhook do Mercado Pago para atualização automática de status
- ✅ Cliente Melhor Envio para cálculo de frete e criação de envios
- ✅ API routes para cálculo de frete e rastreamento
- ✅ Webhook do Melhor Envio para atualização automática de status de envios

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx-xxx  # Token de teste
MERCADOPAGO_TEST_MODE=true

# Melhor Envio
MELHOR_ENVIO_TOKEN=your_token_here
MELHOR_ENVIO_PRODUCTION=false
MELHOR_ENVIO_WEBHOOK_SECRET=your_webhook_secret  # Secret do webhook (obtido no painel)
```

### 2. Obter Credenciais

#### Mercado Pago (Teste)
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Crie uma aplicação
3. Copie o **Access Token** de teste
4. Cole no `.env.local`

#### Melhor Envio (Sandbox)
1. Acesse: https://melhorenvio.com.br/painel/gerenciar/tokens
2. Crie um novo token
3. Configure `MELHOR_ENVIO_PRODUCTION=false` para sandbox

### 3. Configurar Webhook (Desenvolvimento Local)

Para testar webhooks localmente, use ngrok:

```bash
npx ngrok http 3000
```

Copie a URL (ex: `https://abc123.ngrok.io`) e configure:

**Mercado Pago:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app/YOUR_APP/webhooks
2. URL do webhook: `https://abc123.ngrok.io/api/payments/webhook`
3. Eventos: selecione `payment`

**Melhor Envio:**
1. Acesse: https://melhorenvio.com.br/painel/gerenciar/tokens
2. Vá em "Integrações" > "Área Dev" > "Seus aplicativos"
3. Clique em "Novo Webhook"
4. URL do webhook: `https://abc123.ngrok.io/api/shipping/webhook`
5. Copie o **Secret** e configure como `MELHOR_ENVIO_WEBHOOK_SECRET` no `.env.local`

## 📡 Endpoints Disponíveis

### Mercado Pago

- `POST /api/payments/create-preference` - Criar preferência de pagamento
- `POST /api/payments/webhook` - Webhook (chamado pelo Mercado Pago)
- `GET /api/payments/status?payment_id=xxx` - Verificar status

### Melhor Envio

- `POST /api/shipping/calculate` - Calcular frete
- `POST /api/shipping/create` - Criar envio
- `GET /api/shipping/track/[id]` - Rastrear envio
- `POST /api/shipping/webhook` - Webhook (chamado pelo Melhor Envio)

## 🔍 Testando

### Teste Mercado Pago
Use o cartão de teste: `5031 4332 1540 6351` (CVV: 123)

### Teste Melhor Envio
Use `MELHOR_ENVIO_PRODUCTION=false` para ambiente de sandbox

## 📚 Documentação Completa

Veja `INTEGRACOES.md` para documentação detalhada.

