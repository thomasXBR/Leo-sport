# Configuração do Webhook do Mercado Pago para Compras

## Visão Geral

O webhook do Mercado Pago foi configurado para registrar automaticamente compras quando um pagamento é aprovado. Quando um cliente faz uma compra e o pagamento é aprovado, o sistema:

1. Registra a venda na tabela `sales`
2. **Registra automaticamente uma compra na tabela `purchases`**
3. Atualiza o estoque dos produtos
4. Registra os itens da venda

## Endpoints do Webhook

O sistema aceita webhooks em dois endpoints:

1. **Principal**: `POST /api/payments/webhook`
2. **Alternativo (para compatibilidade)**: `POST /api/webhooks`

Ambos processam os webhooks da mesma forma. Use o endpoint que preferir ao configurar no Mercado Pago.

## Como Configurar no Mercado Pago

### 1. Acessar o Painel do Mercado Pago

1. Acesse o [Painel do Mercado Pago](https://www.mercadopago.com.br/developers/panel)
2. Faça login com suas credenciais
3. Selecione sua aplicação

### 2. Configurar o Webhook

1. Vá para **Webhooks** no menu lateral
2. Clique em **Criar Webhook** ou **Configurar Webhook**
3. Configure os seguintes parâmetros:

   - **URL do Webhook**: 
     ```
     https://leo-sports.vercel.app/api/webhooks
     ```
     Ou use o endpoint alternativo:
     ```
     https://leo-sports.vercel.app/api/payments/webhook
     ```
     
     Para desenvolvimento local, use um serviço como ngrok:
     ```
     https://seu-ngrok-url.ngrok.io/api/webhooks
     ```

   - **Eventos a serem notificados**:
     - ✅ `payment.created` - Quando um pagamento é criado
     - ✅ `payment.updated` - Quando um pagamento é atualizado (status mudou)

   - **Versão da API**: Use a versão mais recente disponível

### 3. Testar o Webhook

#### Usando o Mercado Pago Test Mode

1. No painel do Mercado Pago, ative o **Modo de Teste**
2. Use os cartões de teste disponíveis:
   - **Cartão aprovado**: `5031 4332 1540 6351`
   - **CVV**: `123`
   - **Data de validade**: Qualquer data futura
   - **Nome**: Qualquer nome

3. Faça uma compra de teste no site
4. Verifique no dashboard se a compra foi registrada

#### Verificar Logs

O webhook registra logs detalhados. Para ativar logs, configure:

```env
WEBHOOK_LOG_ENABLED=true
```

Os logs aparecerão no console do servidor com informações como:
- ID da requisição
- Status do pagamento
- ID do pagamento
- External reference (número do pedido)
- Se a compra foi registrada

## Estrutura de Dados

### Compra Registrada

Quando um pagamento é aprovado, uma compra é criada com:

```typescript
{
  purchase_number: "COMP-{external_reference}",
  supplier_name: "Nome do Cliente",
  total_amount: valor_total,
  purchase_date: "data_de_aprovacao"
}
```

### Verificação de Duplicatas

O sistema verifica se já existe uma compra com:
- Mesmo `purchase_number` (baseado no external_reference)
- Mesmo `supplier_name`

Isso evita duplicatas caso o webhook seja chamado múltiplas vezes.

## Visualização no Dashboard

As compras registradas automaticamente aparecem na seção **Compras** do dashboard administrativo:

1. Acesse `/admindash`
2. Clique em **Compras** no menu lateral
3. Você verá:
   - **Vendas pagas** (mostradas como compras do cliente)
   - **Compras de fornecedores** (registradas manualmente)

## Troubleshooting

### Compra não está sendo registrada

1. **Verifique os logs do servidor**:
   ```bash
   # Em desenvolvimento
   npm run dev
   
   # Verifique os logs no console
   ```

2. **Verifique se o webhook está recebendo notificações**:
   - No painel do Mercado Pago, vá para **Webhooks**
   - Verifique o histórico de notificações
   - Veja se há erros (status diferente de 200)

3. **Verifique as variáveis de ambiente**:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
   MERCADO_PAGO_TEST_MODE=true  # Para modo de teste
   ```

4. **Verifique a estrutura do banco de dados**:
   - A tabela `purchases` deve existir
   - Deve ter as colunas: `purchase_number`, `supplier_name`, `total_amount`, `purchase_date`

### Webhook retorna erro 500

1. Verifique os logs do servidor para ver o erro específico
2. Verifique se o Supabase está configurado corretamente
3. Verifique se as permissões RLS (Row Level Security) estão configuradas

### Compras duplicadas

O sistema já tem proteção contra duplicatas, mas se ainda ocorrer:

1. Verifique se o `external_reference` está sendo enviado corretamente
2. Verifique se o `purchase_number` está sendo gerado corretamente

## Testando Localmente

Para testar localmente, você precisa expor seu servidor local:

1. **Instale o ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Inicie seu servidor**:
   ```bash
   npm run dev
   ```

3. **Exponha com ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Use a URL do ngrok no webhook do Mercado Pago**:
   ```
   https://seu-ngrok-url.ngrok.io/api/payments/webhook
   ```

## Segurança

- O webhook valida as notificações do Mercado Pago
- Sempre retorna status 200 para evitar reenvios
- Logs de erro são registrados sem expor informações sensíveis
- Verifica duplicatas antes de criar novas compras

## Próximos Passos

- [ ] Configurar notificações por email quando uma compra é registrada
- [ ] Adicionar mais informações à compra (itens, produtos, etc.)
- [ ] Criar relatórios de compras
- [ ] Integrar com sistema de estoque

