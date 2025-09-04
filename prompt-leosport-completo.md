# PROMPT PARA PROJETO LEOSPORT - MARKETPLACE COMPLETO

Você é um arquiteto de software sênior especializado em marketplaces e e-commerce. Preciso que você estruture completamente o projeto **LeoSport**, um marketplace esportivo com as seguintes especificações:

## CONTEXTO DO PROJETO
LeoSport é um marketplace que conecta vendedores parceiros com clientes finais, focado em produtos esportivos, com Leo como administrador central que controla todo o ecossistema.

## STACK TECNOLÓGICA OBRIGATÓRIA
- **Frontend**: Next.js 14+ com App Router
- **Backend/Database**: Supabase (autenticação, database, RLS)
- **Pagamentos**: Mercado Pago API
- **Frete**: Melhor Envio API
- **Email**: Resend ou similar
- **Deploy**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui

## FLUXO FUNCIONAL DETALHADO

### CLIENTE (Usuário Comum)
**Páginas públicas**:
- Início (hero, produtos em destaque, categorias)
- Sobre (história da LeoSport, missão, valores)
- Produtos (catálogo com filtros, busca, paginação)
- Venda na LeoSport (formulário para se tornar parceiro)
- Contato (formulário de contato, informações)

**Fluxo de compra**:
1. Navegar produtos → Adicionar ao carrinho → Checkout
2. Inserir CEP → Calcular frete (Melhor Envio)
3. Escolher forma de pagamento (Mercado Pago)
4. Finalizar compra → Receber email de confirmação com prazo

### PARCEIRO (Vendedor Aprovado)
**Após aprovação como parceiro**:
- Dashboard de vendas (produtos enviados, aprovados, vendas)
- Formulário para submeter novos produtos
- Histórico de propostas (pendente, aprovado, recusado)
- Relatórios de performance

### ADMINISTRADOR (Leo)
**Dashboard principal**:
- Overview: lucro total, produtos ativos, parceiros ativos
- Gráficos de vendas e performance
- Produtos mais vendidos

**Gestão de produtos**:
- Lista de propostas pendentes de parceiros
- Aprovar/recusar produtos com feedback
- Editar informações de produtos aprovados
- Remover produtos do marketplace

**Gestão de parceiros**:
- Lista de solicitações para se tornar parceiro
- Aprovar/recusar novos parceiros
- Visualizar performance de parceiros existentes
- Suspender/reativar parceiros

## REQUISITOS TÉCNICOS ESPECÍFICOS

### DATABASE SCHEMA (Supabase)
Defina tabelas para:
- users (auth.users + perfil estendido)
- user_roles (cliente, parceiro, admin)
- categories
- products
- product_proposals (status: pending, approved, rejected)
- orders
- order_items
- shipping_calculations
- partner_applications

### AUTENTICAÇÃO & AUTORIZAÇÃO
- Sistema de roles (cliente, parceiro, admin)
- RLS policies específicas para cada role
- Middleware de proteção de rotas

### INTEGRAÇÕES EXTERNAS
- **Mercado Pago**: Webhooks para status de pagamento
- **Melhor Envio**: API para cálculo de frete em tempo real
- **Email**: Templates para confirmação de compra, aprovação de parceiro, etc.

## ENTREGÁVEIS SOLICITADOS

Você deve fornecer:

### 1. ARQUITETURA COMPLETA
- Diagrama da arquitetura do sistema
- Estrutura de pastas detalhada do Next.js
- Schema do banco de dados com relacionamentos
- Fluxo de dados entre componentes

### 2. CRONOGRAMA DE EXECUÇÃO
Divida em 6 etapas semanais:
- **Semana 1**: Setup + Autenticação + Schema básico
- **Semana 2**: Páginas públicas + Catálogo de produtos
- **Semana 3**: Sistema de carrinho + Checkout + Frete
- **Semana 4**: Integração Mercado Pago + Email
- **Semana 5**: Dashboard do parceiro + Sistema de propostas
- **Semana 6**: Dashboard admin + Testes finais

### 3. DEFINIÇÃO DETALHADA DE PAPÉIS

Para cada papel (Cliente, Parceiro, Admin), especifique:
- Permissões de acesso
- Funcionalidades disponíveis
- Rotas protegidas
- Políticas de RLS

### 4. CHECKLIST TÉCNICO POR ETAPA

Para cada semana do cronograma, liste:
- [ ] Componentes a desenvolver
- [ ] APIs a integrar
- [ ] Tabelas de banco a criar
- [ ] Testes a implementar
- [ ] Deploy de staging

### 5. ESPECIFICAÇÕES DE INTEGRAÇÃO

#### Mercado Pago
- Fluxo de checkout completo
- Webhooks de confirmação
- Tratamento de falhas
- Sandbox para desenvolvimento

#### Melhor Envio
- Cálculo automático de frete
- Múltiplas transportadoras
- Cache de consultas
- Fallback para indisponibilidade

#### Email System
- Templates para: confirmação de compra, aprovação de parceiro, novos produtos
- Sistema de filas
- Tracking de entrega

## CRITÉRIOS DE QUALIDADE

### Performance
- SSG para páginas estáticas
- ISR para catálogo de produtos
- Lazy loading de componentes
- Otimização de imagens

### UX/UI
- Design responsivo (mobile-first)
- Loading states em todas as operações
- Feedback visual para ações
- Acessibilidade (WCAG 2.1 AA)

### Segurança
- Sanitização de inputs
- Rate limiting
- Validação de dados (Zod)
- HTTPS obrigatório

### SEO
- Meta tags dinâmicas
- Schema markup para produtos
- Sitemap automático
- URLs amigáveis

## ENTREGA ESPERADA

Forneça uma estrutura completa que inclua:

1. **Documento de Arquitetura** (15-20 páginas)
2. **Cronograma Executivo** com marcos e dependências
3. **Manual de Roles & Permissions**
4. **Checklist de Desenvolvimento** (formato Notion/Trello)
5. **Guia de Integração** para Mercado Pago e Melhor Envio
6. **Plano de Testes** (unitários, integração, E2E)
7. **Estratégia de Deploy** (staging → production)

## FORMATO DE SAÍDA

Estruture a resposta em markdown com:
- Índice clicável
- Diagramas em texto (ASCII ou Mermaid)
- Código de exemplo quando relevante
- Links para documentações oficiais
- Estimativas de tempo realistas

**IMPORTANTE**: A resposta deve ser um guia completo que permita a qualquer desenvolvedor sênior implementar o projeto do zero, seguindo exatamente as especificações do LeoSport.