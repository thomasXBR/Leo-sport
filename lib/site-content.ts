// Sistema de Gerenciamento de Conteúdo do Site
// Este arquivo define todos os textos editáveis do site

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'html';
}

export const defaultSiteContent: SiteContent[] = [
  // Header
  {
    id: 'header-1',
    section: 'Header',
    key: 'site_title',
    label: 'Nome do Site',
    value: 'LeoSport',
    type: 'text',
  },
  
  // Página Inicial
  {
    id: 'home-1',
    section: 'Página Inicial',
    key: 'hero_title',
    label: 'Título Principal',
    value: 'Bem-vindo à LeoSport',
    type: 'text',
  },
  {
    id: 'home-2',
    section: 'Página Inicial',
    key: 'hero_subtitle',
    label: 'Subtítulo',
    value: 'O maior marketplace de produtos esportivos do Brasil',
    type: 'textarea',
  },
  {
    id: 'home-3',
    section: 'Página Inicial',
    key: 'hero_description',
    label: 'Descrição',
    value: 'Encontre os melhores equipamentos esportivos com os melhores preços. Qualidade garantida e entrega rápida para todo o Brasil.',
    type: 'textarea',
  },
  
  // Sobre
  {
    id: 'about-1',
    section: 'Sobre Nós',
    key: 'about_title',
    label: 'Título da Página Sobre',
    value: 'Sobre a LeoSport',
    type: 'text',
  },
  {
    id: 'about-2',
    section: 'Sobre Nós',
    key: 'about_description',
    label: 'Descrição da Empresa',
    value: 'Somos uma empresa dedicada a fornecer os melhores produtos esportivos para atletas de todos os níveis.',
    type: 'textarea',
  },
  {
    id: 'about-3',
    section: 'Sobre Nós',
    key: 'mission',
    label: 'Missão',
    value: 'Tornar o esporte acessível para todos os brasileiros.',
    type: 'textarea',
  },
  {
    id: 'about-4',
    section: 'Sobre Nós',
    key: 'vision',
    label: 'Visão',
    value: 'Ser o marketplace esportivo número 1 da América Latina.',
    type: 'textarea',
  },
  
  // Contato
  {
    id: 'contact-1',
    section: 'Contato',
    key: 'contact_title',
    label: 'Título da Página Contato',
    value: 'Entre em Contato',
    type: 'text',
  },
  {
    id: 'contact-2',
    section: 'Contato',
    key: 'contact_description',
    label: 'Descrição',
    value: 'Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.',
    type: 'textarea',
  },
  
  // Footer
  {
    id: 'footer-1',
    section: 'Footer',
    key: 'footer_description',
    label: 'Descrição do Footer',
    value: 'LeoSport - Sua loja de equipamentos esportivos',
    type: 'text',
  },
  {
    id: 'footer-2',
    section: 'Footer',
    key: 'copyright',
    label: 'Copyright',
    value: '© 2025 LeoSport. Todos os direitos reservados.',
    type: 'text',
  },
  
  // Venda na LeoSport
  {
    id: 'seller-1',
    section: 'Venda na LeoSport',
    key: 'seller_title',
    label: 'Título',
    value: 'Venda na LeoSport',
    type: 'text',
  },
  {
    id: 'seller-2',
    section: 'Venda na LeoSport',
    key: 'seller_description',
    label: 'Descrição',
    value: 'Alcance milhares de clientes e faça parte do maior marketplace esportivo do Brasil.',
    type: 'textarea',
  },
  {
    id: 'seller-3',
    section: 'Venda na LeoSport',
    key: 'seller_benefits',
    label: 'Benefícios',
    value: 'Zero taxa de adesão, comissão competitiva, suporte dedicado e muito mais.',
    type: 'textarea',
  },
];

// Função para obter conteúdo por chave
export function getContentByKey(key: string, contents: SiteContent[]): string {
  const content = contents.find(c => c.key === key);
  return content?.value || '';
}

// Função para obter conteúdo por seção
export function getContentBySection(section: string, contents: SiteContent[]): SiteContent[] {
  return contents.filter(c => c.section === section);
}

