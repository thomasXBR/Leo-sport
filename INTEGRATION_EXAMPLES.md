# Exemplos de Integração - Dashboard Administrativa

Este documento fornece exemplos práticos de como integrar os componentes da dashboard com o Supabase e como usar o sistema de conteúdo editável em seus componentes.

## 📝 Índice

1. [Sistema de Conteúdo Editável](#sistema-de-conteúdo-editável)
2. [Gerenciamento de Cupons](#gerenciamento-de-cupons)
3. [Gerenciamento de Parcerias](#gerenciamento-de-parcerias)
4. [Notas Fiscais](#notas-fiscais)
5. [Permissões e Segurança](#permissões-e-segurança)

---

## Sistema de Conteúdo Editável

### Usando o Hook em Componentes

#### Exemplo 1: Página Inicial
```tsx
'use client';

import { useSiteContent } from '@/hooks/use-site-content';

export default function HomePage() {
  const { getContent, loading } = useSiteContent();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{getContent('hero_title')}</h1>
      <p>{getContent('hero_subtitle')}</p>
      <p>{getContent('hero_description')}</p>
    </div>
  );
}
```

#### Exemplo 2: Header Dinâmico
```tsx
'use client';

import { useSiteContent } from '@/hooks/use-site-content';

export default function Header() {
  const { getContent } = useSiteContent();

  return (
    <header>
      <h1>{getContent('site_title')}</h1>
      {/* Outros elementos */}
    </header>
  );
}
```

#### Exemplo 3: Footer com Conteúdo Editável
```tsx
'use client';

import { useSiteContent } from '@/hooks/use-site-content';

export default function Footer() {
  const { getContent } = useSiteContent();

  return (
    <footer>
      <p>{getContent('footer_description')}</p>
      <p>{getContent('copyright')}</p>
    </footer>
  );
}
```

### Integração com Supabase

#### 1. Criar Tabela no Supabase
```sql
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'textarea', 'html')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índice para busca rápida por chave
CREATE INDEX idx_site_content_key ON site_content(key);

-- RLS: Todos podem ler, apenas admins podem editar
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conteúdo é público"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem atualizar"
  ON site_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

#### 2. Inserir Dados Padrão
```sql
-- Script para inserir o conteúdo padrão
INSERT INTO site_content (id, section, key, label, value, type)
VALUES
  ('header-1', 'Header', 'site_title', 'Nome do Site', 'LeoSport', 'text'),
  ('home-1', 'Página Inicial', 'hero_title', 'Título Principal', 'Bem-vindo à LeoSport', 'text'),
  ('home-2', 'Página Inicial', 'hero_subtitle', 'Subtítulo', 'O maior marketplace de produtos esportivos do Brasil', 'textarea')
  -- ... outros registros
ON CONFLICT (key) DO NOTHING;
```

#### 3. Atualizar Hook com Supabase
```typescript
// hooks/use-site-content.ts
import { supabase } from '@/lib/supabase';

const loadContent = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section', { ascending: true });
    
    if (error) throw error;
    setContent(data || defaultSiteContent);
  } catch (err: any) {
    setError(err.message);
    setContent(defaultSiteContent);
  } finally {
    setLoading(false);
  }
};

const saveAll = async (): Promise<{ success: boolean; error?: string }> => {
  setLoading(true);
  try {
    const { error } = await supabase
      .from('site_content')
      .upsert(content, { onConflict: 'key' });
    
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};
```

---

## Gerenciamento de Cupons

### Estrutura Completa com Supabase

#### 1. Criar Tabela
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount TEXT NOT NULL,
  type TEXT CHECK (type IN ('Percentual', 'Fixo', 'Especial')) NOT NULL,
  valid_until DATE NOT NULL,
  status TEXT CHECK (status IN ('Ativo', 'Expirado', 'Inativo')) DEFAULT 'Ativo',
  usage_limit INTEGER NOT NULL DEFAULT 100,
  usage_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cupons são visíveis publicamente"
  ON coupons FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar cupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

#### 2. Hook de Gerenciamento
```typescript
// hooks/use-coupons.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Coupon {
  id: string;
  code: string;
  discount: string;
  type: 'Percentual' | 'Fixo' | 'Especial';
  validUntil: string;
  status: 'Ativo' | 'Expirado' | 'Inativo';
  usageLimit: number;
  usageCount: number;
  description?: string;
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (coupon: Omit<Coupon, 'id' | 'usageCount'>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert([coupon])
        .select()
        .single();
      
      if (error) throw error;
      setCoupons([data, ...coupons]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return {
    coupons,
    loading,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    reload: loadCoupons,
  };
}
```

#### 3. Usar no Componente
```tsx
'use client';

import { useCoupons } from '@/hooks/use-coupons';
import { toast } from 'sonner';

export default function CouponsManager() {
  const { coupons, loading, createCoupon, deleteCoupon } = useCoupons();

  const handleCreate = async (formData: any) => {
    const result = await createCoupon({
      code: formData.code,
      discount: formData.discount,
      type: formData.type,
      validUntil: formData.validUntil,
      status: 'Ativo',
      usageLimit: formData.usageLimit,
    });

    if (result.success) {
      toast.success('Cupom criado com sucesso!');
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este cupom?')) return;
    
    const result = await deleteCoupon(id);
    if (result.success) {
      toast.success('Cupom deletado!');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      {/* UI aqui */}
    </div>
  );
}
```

---

## Gerenciamento de Parcerias

### Estrutura Completa

#### 1. Tabela Supabase
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
  since DATE NOT NULL,
  description TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parcerias são públicas"
  ON partners FOR SELECT
  USING (status = 'Ativo');

CREATE POLICY "Admins gerenciam parcerias"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

#### 2. Hook
```typescript
// hooks/use-partners.ts
export function usePartners() {
  // Similar ao useCoupons
  // Implementar loadPartners, createPartner, updatePartner, deletePartner
}
```

---

## Notas Fiscais

### Estrutura com Upload de Arquivos

#### 1. Tabela + Storage
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('Emitida', 'Pendente', 'Cancelada')) DEFAULT 'Pendente',
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Upload de Arquivo
```typescript
// Criar bucket no Supabase Storage: 'invoices'

const uploadInvoice = async (file: File, invoiceId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${invoiceId}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('invoices')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('invoices')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

---

## Permissões e Segurança

### Verificar se Usuário é Admin

#### 1. Middleware
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Proteger rotas de admin
  if (req.nextUrl.pathname.startsWith('/admindash')) {
    if (!session) {
      return NextResponse.redirect(new URL('/inicio', req.url));
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (profile?.user_type !== 'admin') {
      return NextResponse.redirect(new URL('/inicio', req.url));
    }
  }

  return res;
}
```

#### 2. Hook de Permissões
```typescript
// hooks/use-permissions.ts
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { profile } = useAuth();

  const isAdmin = profile?.user_type === 'admin';
  const isVendor = profile?.user_type === 'vendedor';
  const isCustomer = profile?.user_type === 'comprador';

  const canManageCoupons = isAdmin;
  const canManagePartners = isAdmin;
  const canEditContent = isAdmin;
  const canViewDashboard = isAdmin;

  return {
    isAdmin,
    isVendor,
    isCustomer,
    canManageCoupons,
    canManagePartners,
    canEditContent,
    canViewDashboard,
  };
}
```

#### 3. Uso em Componentes
```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function SomeComponent() {
  const { canManageCoupons, isAdmin } = usePermissions();

  if (!isAdmin) {
    return <div>Acesso negado</div>;
  }

  return (
    <div>
      {canManageCoupons && (
        <button>Gerenciar Cupons</button>
      )}
    </div>
  );
}
```

---

## 🎯 Checklist de Integração

- [ ] Criar todas as tabelas no Supabase
- [ ] Configurar RLS (Row Level Security)
- [ ] Inserir dados padrão (site_content)
- [ ] Criar buckets no Storage (invoices, se necessário)
- [ ] Implementar hooks personalizados
- [ ] Adicionar validação de formulários
- [ ] Implementar tratamento de erros
- [ ] Adicionar feedback com toasts
- [ ] Testar permissões de admin
- [ ] Configurar middleware de proteção
- [ ] Implementar funcionalidade de upload
- [ ] Testar CRUD completo de cada recurso

---

**Pronto para Produção!** 🚀

