# Configuração do Supabase - LeoSport

## 1. Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome do projeto: `leosport`
   - Senha do banco de dados (guarde esta senha!)
   - Região: escolha a mais próxima do Brasil (South America)

## 2. Configurar Variáveis de Ambiente

1. No projeto Supabase, vá em `Settings` > `API`
2. Copie:
   - **Project URL** (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (chave pública)

3. No arquivo `.env.local` do projeto, substitua:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

## 3. Criar Tabela de Perfis

1. No Supabase, vá em `SQL Editor`
2. Execute o seguinte SQL:

```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  description TEXT,
  user_type TEXT NOT NULL DEFAULT 'comprador' CHECK (user_type IN ('comprador', 'vendedor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Todos podem ler perfis públicos
CREATE POLICY "Perfis são visíveis publicamente"
  ON profiles FOR SELECT
  USING (true);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 4. Configurar Autenticação

1. No Supabase, vá em `Authentication` > `Settings`
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:3000/**`
3. Em `Email Templates`, personalize os emails de confirmação (opcional)

## 5. Testar a Integração

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000/inicio`

3. Teste:
   - Criar uma nova conta
   - Fazer login
   - Visualizar o perfil
   - Atualizar informações do perfil
   - Alterar senha
   - Fazer logout

## 6. Funcionalidades Implementadas

### Header Dinâmico
- **Não logado**: Mostra botão "Entrar" com formulário de login/cadastro
- **Logado**: Mostra nome e avatar do usuário com dropdown contendo:
  - Botão "Meu Perfil" (redireciona para `/perfil`)
  - Botão "Sair" (faz logout)

### Página de Perfil (`/perfil`)
- **Foto de Perfil**: Avatar personalizável via URL
- **Informações Pessoais**:
  - Nome completo
  - Descrição/Bio
  - Tipo de usuário (Comprador, Vendedor, Admin)
- **Informações da Conta**:
  - Email
  - ID do usuário
  - Tipo de conta
  - Data de criação
  - Data da última atualização
- **Segurança**:
  - Alterar senha
  - Confirmação de senha

### Contexto de Autenticação
O `AuthContext` gerencia:
- Estado do usuário logado
- Perfil do usuário
- Sessão ativa
- Funções: `signUp`, `signIn`, `signOut`, `updateProfile`, `updatePassword`

## 7. Estrutura do Banco de Dados

### Tabela: `profiles`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do usuário (FK para auth.users) |
| `email` | TEXT | Email do usuário |
| `name` | TEXT | Nome completo |
| `avatar_url` | TEXT | URL da foto de perfil |
| `description` | TEXT | Descrição/Bio do usuário |
| `user_type` | TEXT | Tipo: 'comprador', 'vendedor' ou 'admin' |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

## 8. Segurança

- **Row Level Security (RLS)** ativado
- Usuários só podem editar seus próprios perfis
- Todos podem visualizar perfis (público)
- Senhas são gerenciadas pelo Supabase Auth de forma segura

## 9. Próximos Passos (Opcional)

1. **Upload de Imagens**: Implementar upload de avatar usando Supabase Storage
2. **Validação de Email**: Ativar confirmação de email
3. **Recuperação de Senha**: Implementar fluxo de "Esqueci minha senha"
4. **OAuth**: Adicionar login social (Google, GitHub, etc.)
5. **2FA**: Implementar autenticação de dois fatores

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou corretamente as credenciais do Supabase
- Certifique-se de que o arquivo `.env.local` está na raiz do projeto

### Erro: "Failed to fetch profile"
- Verifique se executou o SQL para criar a tabela `profiles`
- Confira se as políticas RLS estão configuradas corretamente

### Erro: "User already registered"
- Este email já está cadastrado
- Use outro email ou faça login

## Suporte

Para mais informações, consulte a documentação oficial:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

