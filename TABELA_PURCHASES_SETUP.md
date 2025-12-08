# Estrutura da Tabela `purchases` no Supabase

## Colunas Necessárias

A tabela `purchases` deve ter as seguintes colunas:

### Colunas Obrigatórias

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `id` | `uuid` | ID único (chave primária, auto-gerado) | `550e8400-e29b-41d4-a716-446655440000` |
| `supplier_name` | `text` | Nome do fornecedor/cliente | `"João Silva"` |
| `total_amount` | `numeric` ou `decimal` | Valor total da compra | `150.50` |
| `created_at` | `timestamp` | Data de criação (auto-gerado) | `2024-01-15 10:30:00` |
| `updated_at` | `timestamp` | Data de atualização (auto-gerado) | `2024-01-15 10:30:00` |

### Colunas Opcionais

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `purchase_number` | `text` | Número da compra (gerado automaticamente pelo webhook) | `"COMP-ORDER123"` |
| `purchase_date` | `date` | Data da compra | `2024-01-15` |
| `pdf_url` | `text` | URL do PDF da nota fiscal/comprovante | `"https://..."` |

## SQL para Criar a Tabela

Execute este SQL no Supabase SQL Editor:

```sql
-- Criar tabela purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number TEXT,
  supplier_name TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  purchase_date DATE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por purchase_number
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_number ON purchases(purchase_number);

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Configuração de RLS (Row Level Security)

Se você usar RLS, configure as políticas:

```sql
-- Habilitar RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Users can view purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Users can insert purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Users can update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Users can delete purchases"
  ON purchases
  FOR DELETE
  TO authenticated
  USING (true);
```

## Como o Webhook Preenche os Dados

Quando um pagamento é aprovado, o webhook cria automaticamente uma compra com:

```typescript
{
  purchase_number: "COMP-{external_reference}",  // Ex: "COMP-ORDER123"
  supplier_name: "Nome do Cliente",             // Nome do pagador
  total_amount: 150.50,                          // Valor do pagamento
  purchase_date: "2024-01-15"                   // Data de aprovação
}
```

## Exemplo de Dados

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "purchase_number": "COMP-ORDER123",
  "supplier_name": "João Silva",
  "total_amount": 150.50,
  "purchase_date": "2024-01-15",
  "pdf_url": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Verificação

Para verificar se a tabela está configurada corretamente:

1. Acesse o Supabase Dashboard
2. Vá para **Table Editor** → `purchases`
3. Verifique se todas as colunas existem
4. Teste criando uma compra manualmente:
   ```sql
   INSERT INTO purchases (supplier_name, total_amount, purchase_date)
   VALUES ('Teste', 100.00, CURRENT_DATE);
   ```

## Troubleshooting

### Erro: "column does not exist"
- Verifique se todas as colunas foram criadas
- Execute o SQL de criação novamente

### Erro: "permission denied"
- Configure as políticas RLS conforme mostrado acima
- Ou desabilite RLS temporariamente para testes:
  ```sql
  ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
  ```

### Compras não aparecem no dashboard
- Verifique se a tabela existe
- Verifique se as colunas têm os nomes corretos (case-sensitive)
- Verifique os logs do webhook para erros

