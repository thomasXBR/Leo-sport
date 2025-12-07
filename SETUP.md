# 🚀 Guia de Configuração - LeoSport

## ⚠️ CORREÇÃO DO LOADING INFINITO

O problema de loading infinito foi **corrigido**! As alterações incluem:

### Correções Implementadas:

1. **Hooks de Site Content e Images** - Agora retornam valores padrão em caso de erro
2. **Funções do Supabase** - Tratam erros graciosamente sem quebrar a aplicação
3. **Página Inicial** - Removido o bloqueio de loading que impedia o site de carregar
4. **AuthContext** - Melhorado tratamento de erros de sessão

## 📋 Configuração de Variáveis de Ambiente

Para o site funcionar completamente, você precisa configurar as variáveis de ambiente.

### Passo 1: Criar arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto `Leo-sport/` com o seguinte conteúdo:

```env
# Supabase Configuration (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Melhor Envio (Opcional - para cálculo de frete)
MELHOR_ENVIO_TOKEN=seu_token
MELHOR_ENVIO_SANDBOX=true

# Mercado Pago (Opcional - para pagamentos)
MERCADO_PAGO_ACCESS_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica

# Email (Opcional - para envio de emails)
RESEND_API_KEY=sua_chave_resend
EMAIL_FROM=noreply@leosport.com
```

### Passo 2: Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com/
2. Faça login ou crie uma conta
3. Crie um novo projeto ou selecione o existente
4. Vá em **Settings** → **API**
5. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 3: Configurar Banco de Dados

O projeto precisa das seguintes tabelas no Supabase:

#### Tabelas Principais:
- `profiles` - Perfis de usuários
- `products` - Produtos
- `categories` - Categorias de produtos
- `user_carts` - Carrinhos dos usuários
- `sales` - Vendas
- `sale_items` - Itens das vendas
- `coupons` - Cupons de desconto
- `reviews` - Avaliações de produtos
- `site_content` - Conteúdo editável do site (textos)
- `site_images` - Imagens editáveis do site
- `perguntas_respostas` - FAQ
- `partnerships` - Parcerias
- `invoices` - Notas fiscais
- `purchases` - Compras
- `inventory_movements` - Movimentações de estoque

#### Buckets de Storage:
- `site_images` - Imagens de produtos
- `imgs` - Imagens do site
- `invoices` - PDFs de notas fiscais

### Passo 4: Reiniciar o Servidor

Após configurar as variáveis de ambiente:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

## ✅ O Site Agora Funciona Sem Configuração Completa

**Importante:** Mesmo sem configurar o Supabase, o site agora carrega normalmente!

- ✅ Páginas carregam com valores padrão
- ✅ Não há mais loading infinito
- ✅ Erros são tratados graciosamente
- ⚠️ Funcionalidades que dependem do banco (login, produtos, carrinho) não funcionarão até configurar o Supabase

## 🔧 Funcionalidades que Requerem Configuração:

### Com Supabase Configurado:
- Login e cadastro de usuários
- Listagem de produtos
- Carrinho de compras persistente
- Avaliações de produtos
- Dashboard administrativo
- Conteúdo editável do site

### Com Melhor Envio Configurado:
- Cálculo de frete
- Rastreamento de entregas
- Geração de etiquetas

### Com Mercado Pago Configurado:
- Processamento de pagamentos
- Checkout integrado

### Com Resend Configurado:
- Email de boas-vindas
- Notificações por email

## 📞 Suporte

Se tiver problemas após essas configurações, verifique:

1. Se as variáveis de ambiente estão corretas
2. Se o servidor foi reiniciado após criar o `.env.local`
3. Os logs do console do navegador (F12)
4. Os logs do terminal onde o servidor está rodando

## 🎉 Pronto!

Seu site LeoSport está configurado e funcionando sem loading infinito!

