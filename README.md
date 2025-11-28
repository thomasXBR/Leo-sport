# LeoSport - Marketplace Esportivo

Um marketplace completo para produtos esportivos, conectando vendedores parceiros com clientes finais.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 com App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth)
- **Pagamentos**: Mercado Pago
- **Frete**: Melhor Envio
- **Email**: Resend

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (public)/           # Páginas públicas
│   │   ├── inicio/         # Página inicial
│   │   ├── sobre/          # Sobre a empresa
│   │   ├── produtos/       # Catálogo de produtos
│   │   ├── venda-na-leosport/ # Formulário para parceiros
│   │   └── contato/        # Página de contato
│   ├── dashboard/          # Dashboards protegidos
│   │   ├── admin/          # Dashboard administrativo
│   │   ├── partner/        # Dashboard do parceiro
│   │   └── account/        # Dashboard do cliente
│   └── api/                # API routes
│       ├── auth/           # Autenticação
│       ├── products/       # CRUD de produtos
│       ├── cart/           # Gerenciamento do carrinho
│       ├── orders/         # Gestão de pedidos
│       ├── shipping/       # Cálculo de frete
│       ├── payments/       # Processamento de pagamentos
│       └── emails/         # Envio de emails
├── components/
│   ├── layout/             # Componentes de layout
│   └── ui/                 # Componentes shadcn/ui
├── lib/                    # Utilitários e clientes
│   ├── supabaseClient.ts   # Cliente Supabase
│   ├── mercadoPagoClient.ts # Cliente Mercado Pago
│   ├── melhorEnvioClient.ts # Cliente Melhor Envio
│   ├── resendClient.ts     # Cliente Resend
│   └── types.ts            # Tipos TypeScript
└── middleware.ts           # Middleware de autenticação
```

## 🔧 Configuração

1. **Clone e instale dependências**:
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env.local
   ```
   Preencha as variáveis no arquivo `.env.local`

3. **Execute o projeto**:
   ```bash
   npm run dev
   ```

## 🎯 Funcionalidades

### Para Clientes
- [x] Navegação pública (início, sobre, produtos, contato)
- [x] Catálogo de produtos com filtros e busca
- [ ] Sistema de carrinho de compras
- [ ] Checkout com cálculo de frete
- [ ] Pagamento via Mercado Pago
- [ ] Acompanhamento de pedidos

### Para Parceiros
- [x] Dashboard com estatísticas de vendas
- [ ] Envio de propostas de produtos
- [ ] Gerenciamento de produtos aprovados
- [ ] Relatórios de performance

### Para Administradores
- [x] Dashboard com overview do marketplace
- [ ] Aprovação/rejeição de parceiros
- [ ] Aprovação/rejeição de produtos
- [ ] Gestão completa do marketplace

## 🔐 Roles e Permissões

- **Cliente**: Comprar produtos, gerenciar conta
- **Parceiro**: Vender produtos, enviar propostas
- **Admin**: Controle total do marketplace

## 📋 TODO - Próximos Passos

### Configuração do Banco (Supabase)
- [ ] Criar schema do banco de dados
- [ ] Configurar RLS policies
- [ ] Implementar autenticação real

### Integrações
- [x] Implementar Mercado Pago real
- [x] Implementar Melhor Envio real
- [ ] Configurar Resend para emails

### Funcionalidades
- [ ] Sistema de carrinho funcional
- [ ] Checkout completo
- [ ] Dashboard de parceiros funcional
- [ ] Dashboard admin funcional
- [ ] Sistema de aprovação de produtos/parceiros

## 🚀 Deploy

O projeto está configurado para deploy na Vercel com build estático.

```bash
npm run build
```

## 📞 Suporte

Para dúvidas sobre o desenvolvimento, consulte a documentação das tecnologias utilizadas:

- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)