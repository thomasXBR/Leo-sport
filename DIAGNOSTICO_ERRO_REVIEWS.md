# Diagnóstico: Onde está o erro ao enviar avaliações?

## Análise do Fluxo

### 1. **Página de Produtos** (`app/(pages)/produtos/[id]/page.tsx`)
✅ **Status: OK**
- Carrega as reviews usando `getReviews(normalizedProduct.id)`
- Renderiza o componente `<ReviewForm productId={normalizedProduct.id} />`
- Exibe as reviews existentes

**Não é o problema** - A página apenas renderiza o formulário.

---

### 2. **Componente ReviewForm** (`components/reviews/review-form.tsx`)
✅ **Status: OK**
- Obtém o usuário do contexto: `const { user, profile } = useAuth()`
- Verifica se é admin: `const isAdmin = profile?.user_type === 'admin'`
- Envia dados corretos: `productId`, `stars`, `comment`, `userId`, `isAdmin`

**Verificação necessária:**
- [ ] O `user?.id` está sendo passado corretamente?
- [ ] O `isAdmin` está sendo identificado corretamente?
- [ ] O `profile?.user_type` realmente é `'admin'`?

**Como verificar:**
```javascript
// No console do navegador (F12), antes de enviar:
console.log({
  userId: user?.id,
  userType: profile?.user_type,
  isAdmin: profile?.user_type === 'admin'
});
```

---

### 3. **Função addReview** (`lib/reviews.ts`)
⚠️ **Status: Pode ter problema**
- Primeiro tenta inserir diretamente no Supabase (cliente do navegador)
- Se der erro `42501` ou `PGRST301`, tenta via API route

**Problema potencial:**
- O cliente Supabase do navegador está sujeito a RLS (Row Level Security)
- Se RLS estiver bloqueando, o erro será `42501` ou `PGRST301`

**Como verificar:**
```javascript
// No console do navegador, veja os logs:
// "Tentando inserir review:" - mostra os dados
// "Erro ao inserir review diretamente:" - mostra o erro completo
```

---

### 4. **API Route** (`app/api/reviews/route.ts`)
✅ **Status: OK (mas depende do Supabase)**
- Verifica se o usuário é admin consultando a tabela `profiles`
- Tenta inserir via cliente Supabase do servidor
- Também está sujeito a RLS, mas com permissões diferentes

**Problema potencial:**
- Mesmo verificando admin, o RLS pode estar bloqueando
- A consulta ao perfil pode falhar se RLS da tabela `profiles` estiver bloqueando

---

### 5. **Supabase (RLS Policies)**
❌ **Status: PROVÁVEL CAUSA DO PROBLEMA**

**O erro está aqui se:**
- Você está recebendo "Sem permissão para enviar avaliação"
- O código de erro é `42501` ou `PGRST301`
- O admin badge aparece (significa que o código reconhece você como admin)

**Soluções:**

#### Solução 1: Configurar Políticas RLS (Recomendado)

Execute no SQL Editor do Supabase:

```sql
-- 1. Habilitar RLS (se não estiver habilitado)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 2. Política para leitura pública
CREATE POLICY "Permitir leitura de reviews"
ON reviews
FOR SELECT
USING (true);

-- 3. Política para inserção de usuários autenticados
CREATE POLICY "Permitir inserção de reviews autenticados"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Política para inserção de admins
CREATE POLICY "Permitir inserção de reviews por admins"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- 5. Política para inserção anônima (opcional)
CREATE POLICY "Permitir inserção anônima de reviews"
ON reviews
FOR INSERT
TO anon
WITH CHECK (true);
```

#### Solução 2: Verificar tabela profiles também tem RLS correto

A política de admin depende da tabela `profiles`. Verifique:

```sql
-- Verificar se profiles tem políticas que permitem leitura
SELECT * FROM profiles WHERE id = auth.uid();
```

Se essa consulta falhar, você precisa adicionar políticas RLS na tabela `profiles` também.

---

## Como Diagnosticar o Problema

### Passo 1: Verificar no Console do Navegador

1. Abra o console (F12)
2. Tente enviar uma avaliação
3. Procure por estas mensagens:

```
Tentando inserir review: { ... }
Erro ao inserir review diretamente: { ... }
Tentando inserir via API route...
```

**Anote:**
- Qual o código de erro? (`42501`, `PGRST301`, outro?)
- Qual a mensagem de erro completa?
- O que aparece em `error.details` e `error.hint`?

### Passo 2: Verificar se é Admin

No console do navegador, execute:

```javascript
// Você precisa estar na página do produto e logado
// Abra o console e execute:
const { user, profile } = await fetch('/api/auth/session').then(r => r.json());
console.log('User:', user);
console.log('Profile:', profile);
console.log('Is Admin?', profile?.user_type === 'admin');
```

Ou adicione temporariamente no componente:

```javascript
useEffect(() => {
  console.log('ReviewForm Debug:', {
    userId: user?.id,
    userType: profile?.user_type,
    isAdmin: profile?.user_type === 'admin',
    productId
  });
}, [user, profile, productId]);
```

### Passo 3: Testar a API Route Diretamente

No console do navegador ou Postman:

```javascript
fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'SEU_PRODUCT_ID',
    stars: 5,
    comment: 'Teste',
    userId: 'SEU_USER_ID',
    isAdmin: true
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Resumo: Onde Está o Problema?

### ✅ NÃO está no problema:
1. ❌ **page.tsx** - Apenas renderiza, não processa
2. ❌ **ReviewForm** - Está enviando dados corretos
3. ❌ **addReview** - A lógica está correta

### ⚠️ Pode estar no problema:
1. ⚠️ **API Route** - Se o Supabase estiver bloqueando mesmo via servidor

### ❌ ESTÁ no problema:
1. ✅ **Supabase RLS** - Políticas não configuradas ou bloqueando admins

---

## Solução Imediata

**99% de certeza que o problema é RLS no Supabase.**

1. Acesse o Supabase Dashboard
2. Vá em Table Editor → `reviews` → RLS
3. Execute as políticas SQL acima
4. Teste novamente

**Se ainda não funcionar:**
- Verifique os logs no console do navegador
- Compartilhe o erro completo (código, mensagem, details, hint)
- Verifique se a tabela `profiles` também tem RLS permitindo leitura

