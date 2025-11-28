# Guia de Integrações - LeoSport

Este documento descreve como configurar e usar as integrações de Mercado Pago e Melhor Envio no projeto LeoSport.

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Base URL (usado para webhooks e redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_TEST_MODE=true

# Melhor Envio Configuration
MELHOR_ENVIO_TOKEN=your_melhor_envio_token
MELHOR_ENVIO_PRODUCTION=false
```

## 💳 Mercado Pago

### Obter Credenciais de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login na sua conta Mercado Pago
3. Copie o **Access Token** de teste
4. Configure no `.env.local`:
   ```env
   MERCADOPAGO_ACCESS_TOKEN=seu_access_token_de_teste
   MERCADOPAGO_TEST_MODE=true
   ```

### Webhook Configuration

O webhook está configurado para receber notificações em:
```
POST /api/payments/webhook
```

**Para configurar no Mercado Pago:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app/your_app_id/webhooks
2. Adicione a URL do webhook: `https://seu-dominio.com/api/payments/webhook`
3. Selecione os eventos: `payment`

### API Routes Disponíveis

#### Criar Preferência de Pagamento
```typescript
POST /api/payments/create-preference
Body: {
  items: [
    {
      id: string;
      title: string;
      description?: string;
      quantity: number;
      unit_price: number;
      currency_id?: string;
      picture_url?: string;
    }
  ];
  payer?: {
    name?: string;
    surname?: string;
    email: string;
    phone?: string;
    identification?: { type: string; number: string };
    address?: { zip_code: string; street_name: string; street_number: number };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  external_reference?: string; // ID do pedido no sistema
  notification_url?: string;
}
```

#### Verificar Status de Pagamento
```typescript
GET /api/payments/status?payment_id=xxx
```

#### Webhook (automático)
```typescript
POST /api/payments/webhook
// Chamado automaticamente pelo Mercado Pago
```

## 📦 Melhor Envio

### Obter Token

1. Acesse: https://melhorenvio.com.br/painel/gerenciar/tokens
2. Faça login na sua conta Melhor Envio
3. Crie um novo token de aplicação
4. Configure no `.env.local`:
   ```env
   MELHOR_ENVIO_TOKEN=seu_token_melhor_envio
   MELHOR_ENVIO_PRODUCTION=false  # true para produção
   ```

### API Routes Disponíveis

#### Calcular Frete
```typescript
POST /api/shipping/calculate
Body: {
  from: {
    postal_code: string; // CEP do remetente (ex: "01310-100")
  };
  to: {
    postal_code: string; // CEP do destinatário
  };
  products: [
    {
      height: number; // cm
      width: number; // cm
      length: number; // cm
      weight: number; // kg
    }
  ];
  services?: string; // IDs de serviços específicos (opcional)
}
```

#### Criar Envio
```typescript
POST /api/shipping/create
Body: {
  service: number; // ID do serviço escolhido
  from: {
    name: string;
    phone: string;
    email: string;
    document: string; // CPF/CNPJ
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state: string; // UF (ex: "SP")
    country_id?: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country_id?: string;
    postal_code: string;
  };
  products?: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
  }>;
  volumes: [
    {
      height: number;
      width: number;
      length: number;
      weight: number;
    }
  ];
  options?: {
    insurance_value?: number;
    receipt?: boolean;
    own_hand?: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
  };
}
```

#### Rastrear Envio
```typescript
GET /api/shipping/track/[id]
```

## 🔄 Fluxo Completo

### 1. Checkout

1. Cliente adiciona produtos ao carrinho
2. Calcula frete usando `/api/shipping/calculate`
3. Cliente escolhe opção de frete
4. Cria preferência de pagamento usando `/api/payments/create-preference`
5. Redireciona para Mercado Pago

### 2. Pagamento

1. Cliente finaliza pagamento no Mercado Pago
2. Mercado Pago redireciona de volta (success/failure/pending)
3. Mercado Pago envia webhook para `/api/payments/webhook`
4. Sistema atualiza status do pedido no banco de dados

### 3. Envio

1. Após pagamento aprovado, criar envio usando `/api/shipping/create`
2. Gerar etiqueta (se necessário)
3. Rastrear envio usando `/api/shipping/track/[id]`

## 📝 Notas Importantes

- **Modo de Teste**: Configure `MERCADOPAGO_TEST_MODE=true` para usar credenciais de teste
- **Webhook**: O webhook precisa estar acessível publicamente (use ngrok ou similar para desenvolvimento local)
- **CEP**: Sempre remover formatação dos CEPs antes de enviar (apenas números)
- **Documentos**: CPF/CNPJ devem ser enviados apenas com números

## 🧪 Testando

### Mercado Pago - Cartões de Teste

- **Aprovado**: `5031 4332 1540 6351` (CVV: 123)
- **Pendente**: `5031 4332 1540 6351` (CVV: 123, usar aprovação manual)
- **Rejeitado**: `5031 4332 1540 6351` (CVV: 789)

Expiração: qualquer data futura

### Melhor Envio - Ambiente de Teste

Configure `MELHOR_ENVIO_PRODUCTION=false` para usar o ambiente de sandbox.

