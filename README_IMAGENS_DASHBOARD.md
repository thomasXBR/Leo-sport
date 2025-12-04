# Sistema de Gerenciamento de Imagens do Site

## 📋 Visão Geral

Este sistema permite que administradores gerenciem as imagens do site diretamente pela dashboard administrativa, similar ao sistema de edição de textos já existente.

## 🚀 Como Configurar

### 1. Criar a Tabela no Banco de Dados

Execute o script SQL `CRIAR_TABELA_SITE_IMAGES.sql` no Supabase:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Copie e cole o conteúdo do arquivo `CRIAR_TABELA_SITE_IMAGES.sql`
4. Execute o script

### 2. Criar o Bucket de Storage

O sistema precisa de um bucket no Supabase Storage para armazenar as imagens:

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **Create Bucket**
3. Nome: `site-images`
4. Marque como **Público** (para que as imagens possam ser acessadas pelo site)
5. Clique em **Create bucket**

### 3. Configurar Políticas de Acesso (Opcional)

Se quiser mais controle, você pode configurar políticas específicas no bucket, mas as imagens precisam ser públicas para funcionarem no site.

## 📝 Como Usar

### Na Dashboard Administrativa

1. Acesse a dashboard administrativa
2. Clique na aba **"Imagens"**
3. Você verá todas as imagens editáveis organizadas por seção:
   - **Página Inicial**: Imagem de fundo do hero
   - **Sobre Nós**: Imagem de fundo e imagem de conteúdo
   - **Contato**: Imagem de fundo
   - **Venda na LeoSport**: Imagem de fundo
   - **Produtos**: Imagem de fundo
   - **Header**: Logo do site

### Upload de Imagens

1. Para cada imagem, clique no botão **"Upload Imagem"** ou **"Trocar Imagem"**
2. Selecione uma imagem do seu computador (JPG, PNG ou WEBP)
3. A imagem será enviada automaticamente e salva no Supabase Storage
4. O sistema suporta imagens de até 5MB

### Visualizar Imagens

- Clique em **"Visualizar"** para ver a imagem atual em uma nova aba
- As imagens são exibidas em preview na própria dashboard

### Deletar Imagens

- Clique no botão de lixeira para remover a imagem do banco de dados
- **Nota**: Isso remove a referência no banco, mas a imagem permanece no storage

## 🔧 Imagens Disponíveis

O sistema já vem pré-configurado com as seguintes imagens editáveis:

| Chave | Seção | Descrição |
|-------|-------|-----------|
| `hero_background` | Página Inicial | Imagem de fundo da seção principal |
| `sobre_background` | Sobre Nós | Imagem de fundo da página sobre |
| `sobre_content_image` | Sobre Nós | Imagem do conteúdo da página sobre |
| `contato_background` | Contato | Imagem de fundo da página contato |
| `venda_background` | Venda na LeoSport | Imagem de fundo da página venda |
| `produtos_background` | Produtos | Imagem de fundo da página produtos |
| `logo` | Header | Logo principal do site |

## 💻 Como Funciona

### No Backend

- **Tabela `site_images`**: Armazena metadados das imagens (chave, seção, URL, etc.)
- **Supabase Storage**: Armazena os arquivos de imagem físicos
- **Funções CRUD**: Gerenciam as operações no banco de dados

### No Frontend

- **Hook `useSiteImages`**: Carrega e fornece acesso às imagens
- **Dashboard**: Interface para upload e gerenciamento
- **Páginas do Site**: Usam as imagens do banco quando disponíveis, com fallback para imagens padrão

## 🎨 Adicionar Novas Imagens

Se precisar adicionar uma nova imagem editável:

1. Insira um novo registro na tabela `site_images` via SQL ou pela dashboard:
   ```sql
   INSERT INTO site_images (image_key, section, label, alt_text, description)
   VALUES ('nova_imagem_key', 'Nova Seção', 'Nome da Imagem', 'Texto alternativo', 'Descrição');
   ```

2. A imagem aparecerá automaticamente na dashboard para upload

3. Use no código:
   ```tsx
   const { getImage } = useSiteImages();
   <Image src={getImage('nova_imagem_key', '/fallback/image.jpg')} />
   ```

## ⚠️ Importante

- As imagens devem ter no máximo **5MB**
- Formatos suportados: **JPG, PNG, WEBP**
- O bucket `site-images` precisa existir no Supabase Storage
- As imagens antigas em `/public/images/` continuam funcionando como fallback
- Apenas usuários com perfil de **admin** podem gerenciar imagens

## 🔍 Troubleshooting

### "Bucket not found"
- Certifique-se de criar o bucket `site-images` no Supabase Storage

### "Erro ao enviar imagem"
- Verifique o tamanho da imagem (máximo 5MB)
- Verifique o formato (JPG, PNG ou WEBP)
- Verifique as permissões do bucket

### Imagem não aparece no site
- Verifique se o bucket é público
- Verifique se a chave da imagem está correta
- Verifique o console do navegador para erros

