# Guia do Painel Administrativo - LeoSport

## 📋 Visão Geral

O Painel Administrativo da LeoSport foi completamente prototipado com 8 abas principais para gerenciar diferentes aspectos do marketplace esportivo.

## 🎯 Funcionalidades Implementadas

### 1. **Vendas** 📊
- Gráfico de barras mostrando vendas mensais dos últimos 6 meses
- Análise visual de performance
- Dados mockados prontos para integração com banco de dados

### 2. **Estoque** 📦
- Listagem completa de produtos em estoque
- Status: Em Estoque, Estoque Baixo, Esgotado
- Ações: Editar e Deletar itens
- Interface em tabela responsiva

### 3. **Usuários** 👥
- Visualização de clientes e vendedores
- Informações: Nome, email e papel no sistema
- Lista organizada por tipo de usuário

### 4. **Produtos** 🏷️
- Grid de produtos com imagens
- Informações: Nome, categoria e preço
- Botão de adicionar novo produto
- Cards visuais com hover effects

### 5. **Notas Fiscais** 🧾 (NOVO)
Gerenciamento completo de notas fiscais com:
- **Visualização**: Tabela com todas as NFs emitidas
- **Informações**:
  - Número da NF
  - Número do Pedido
  - Cliente
  - Data de emissão
  - Valor
  - Status (Emitida, Pendente, Cancelada)
- **Ações**:
  - ✅ Emitir nova nota fiscal
  - ✏️ Editar nota existente
  - ⬆️ Upload de documentos

### 6. **Parcerias** 🤝 (NOVO)
Sistema completo de gerenciamento de parceiros comerciais:
- **Layout**: Cards visuais organizados em grid
- **Informações por Parceiro**:
  - Nome da empresa
  - Email de contato
  - Telefone
  - Status (Ativo/Inativo)
  - Data de início da parceria
- **Ações**:
  - ➕ Adicionar nova parceria
  - ✏️ Editar parceria existente
  - 🗑️ Remover parceria (com confirmação)

### 7. **Cupons** 🎟️ (NOVO)
Sistema completo de cupons de desconto:
- **Visualização**: Tabela detalhada
- **Informações por Cupom**:
  - Código (destaque visual)
  - Desconto
  - Tipo (Percentual, Fixo, Especial)
  - Data de validade
  - Limite de uso / Usos realizados
  - Status (Ativo/Expirado)
- **Ações**:
  - ➕ Criar novo cupom
  - ✏️ Editar cupom existente
  - 🗑️ Deletar cupom (com confirmação)

### 8. **Textos do Site** ✍️ (NOVO)
Sistema inovador de gerenciamento de conteúdo editável:
- **Organização**: Por seções do site
- **Seções Disponíveis**:
  - Header
  - Página Inicial
  - Sobre Nós
  - Contato
  - Footer
  - Venda na LeoSport
- **Tipos de Campos**:
  - Texto curto (títulos)
  - Texto longo/textarea (descrições)
  - HTML (conteúdo rico)
- **Recursos**:
  - Edição em tempo real
  - Identificação por chave única
  - Agrupamento visual por seção
  - Botão para salvar todas as alterações

## 🎨 Design e UX

### Sistema de Abas
- **Layout Responsivo**: 
  - Mobile: 2 colunas
  - Tablet: 4 colunas
  - Desktop: 8 colunas
- **Indicador Visual**: Aba ativa com destaque em cyan e efeito de escala
- **Transições Suaves**: Animações em todas as interações

### Modais
- Sistema de modais reutilizável
- Overlay com backdrop
- Formulários específicos para cada tipo de recurso
- Validação visual e feedback ao usuário

### Código de Cores
- **Ativo/Sucesso**: Verde (#10B981)
- **Inativo/Neutro**: Cinza
- **Pendente/Alerta**: Amarelo (#F59E0B)
- **Cancelado/Expirado/Erro**: Vermelho (#EF4444)
- **Primário**: Cyan (#0891b2)

## 📁 Estrutura de Arquivos

```
components/
└── admindash/
    └── dashboard.tsx          # Componente principal da dashboard

lib/
├── site-content.ts           # Sistema de conteúdo editável
└── types.ts                  # Tipos TypeScript (existente)
```

## 🔧 Sistema de Conteúdo Editável

### Arquivo: `lib/site-content.ts`

#### Interface Principal
```typescript
interface SiteContent {
  id: string;           // Identificador único
  section: string;      // Seção do site (Header, Footer, etc)
  key: string;          // Chave única para busca
  label: string;        // Label amigável para admin
  value: string;        // Conteúdo atual
  type: 'text' | 'textarea' | 'html';  // Tipo de campo
}
```

#### Funções Utilitárias
- `getContentByKey(key, contents)`: Busca conteúdo por chave
- `getContentBySection(section, contents)`: Filtra por seção

### Como Usar nos Componentes

```typescript
import { defaultSiteContent, getContentByKey } from '@/lib/site-content';

// Em um componente
const heroTitle = getContentByKey('hero_title', siteContent);
```

## 🔌 Integração com Banco de Dados

### Estrutura Sugerida para Supabase

#### Tabela: `invoices`
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer TEXT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('Emitida', 'Pendente', 'Cancelada')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `partners`
```sql
CREATE TABLE partners (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK (status IN ('Ativo', 'Inativo')),
  since DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `coupons`
```sql
CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount TEXT NOT NULL,
  type TEXT CHECK (type IN ('Percentual', 'Fixo', 'Especial')),
  valid_until DATE NOT NULL,
  status TEXT CHECK (status IN ('Ativo', 'Expirado')),
  usage_limit INTEGER NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `site_content`
```sql
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'textarea', 'html')),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Inserir conteúdo padrão
INSERT INTO site_content (id, section, key, label, value, type)
SELECT id, section, key, label, value, type
FROM json_populate_recordset(null::site_content, '[...]');
```

## 🚀 Próximos Passos para Produção

### 1. Conectar com Supabase
```typescript
// Exemplo para cupons
const { data: coupons, error } = await supabase
  .from('coupons')
  .select('*')
  .order('created_at', { ascending: false });
```

### 2. Implementar Funções de CRUD
- Create: Adicionar novos registros
- Read: Já implementado (mockado)
- Update: Editar registros existentes
- Delete: Remover com confirmação

### 3. Validação de Formulários
- Adicionar validação com Zod ou Yup
- Feedback visual de erros
- Mensagens de sucesso com toast

### 4. Autenticação e Permissões
- Integrar com sistema de auth (já existe)
- Verificar se usuário é admin
- Row Level Security (RLS) no Supabase

### 5. Upload de Arquivos
- Implementar upload de notas fiscais (PDF)
- Upload de imagens para produtos
- Usar Supabase Storage

## 📊 Dados de Exemplo

Todos os dados estão mockados e prontos para substituição:
- 3 Notas Fiscais de exemplo
- 3 Parcerias de exemplo
- 4 Cupons de exemplo
- 15+ textos editáveis do site

## 🎓 Boas Práticas Implementadas

1. **Componentização**: Modais reutilizáveis
2. **Estado Local**: useState para gerenciamento
3. **Responsividade**: Design mobile-first
4. **Acessibilidade**: Labels e semântica HTML
5. **UX**: Confirmações antes de deletar
6. **Feedback Visual**: Status coloridos e ícones
7. **Código Limpo**: Funções bem nomeadas e organizadas

## 🛠️ Tecnologias Utilizadas

- **React**: Componentes e hooks
- **TypeScript**: Tipagem forte
- **Tailwind CSS**: Estilização responsiva
- **Lucide React**: Ícones modernos
- **Chart.js**: Gráficos de vendas
- **Next.js**: Framework base

## 📝 Notas Importantes

1. **Protótipo Funcional**: Todas as interfaces estão prontas e funcionais
2. **Dados Mockados**: Substituir por queries reais ao banco
3. **Modais de Demonstração**: Implementar lógica de salvamento
4. **Sistema de Conteúdo**: Pronto para uso, basta integrar com DB
5. **Escalável**: Fácil adicionar novas abas ou funcionalidades

## 🎯 Como Testar

1. Acesse `/admindash` (ajuste a rota conforme necessário)
2. Navegue pelas 8 abas
3. Teste os botões de adicionar/editar/deletar
4. Edite textos na aba "Textos do Site"
5. Observe os modais e confirmações

## 💡 Dicas de Implementação

### Para Salvar Conteúdo do Site
```typescript
const handleSaveAllContent = async () => {
  const { error } = await supabase
    .from('site_content')
    .upsert(siteContent.map(c => ({
      id: c.id,
      section: c.section,
      key: c.key,
      label: c.label,
      value: c.value,
      type: c.type,
      updated_by: user.id
    })));
  
  if (!error) {
    toast.success('Conteúdo atualizado com sucesso!');
  }
};
```

### Para Criar Cupom
```typescript
const handleCreateCoupon = async (formData) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      code: formData.code,
      discount: formData.discount,
      type: formData.type,
      valid_until: formData.validUntil,
      usage_limit: formData.usageLimit,
      status: 'Ativo'
    }]);
};
```

---

**Desenvolvido para LeoSport** 🏆
*Dashboard Administrativa Completa v1.0*

