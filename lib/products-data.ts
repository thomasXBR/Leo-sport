export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  discountedPrice?: string | null;
  discountPercentage?: string | null;
  imageUrl: string;
  description: string;
  stock: number;
  sku: string;
  brand: string;
  weight: string;
  dimensions: string;
  width?: string;
  height?: string;
  color?: string;
  sport?: string;
  status: 'Ativo' | 'Inativo' | 'Esgotado';
  relevance?: number;
  features?: string[];
  specifications?: Record<string, string>;
}

export const productsData: Product[] = [
  {
    id: 1,
    name: 'Bicicleta Caloi Aro 29',
    category: 'Ciclismo',
    price: 'R$ 1.899,90',
    imageUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Bicicleta de alta qualidade para trilhas e passeios urbanos. Ideal para ciclistas iniciantes e intermediários que buscam conforto e durabilidade.',
    stock: 15,
    sku: 'BIC001',
    brand: 'Caloi',
    weight: '15.5kg',
    dimensions: '180x70x100cm',
    status: 'Ativo',
    features: [
      'Quadro de alumínio resistente',
      'Suspensão dianteira',
      'Freios a disco',
      'Pneus 29" para melhor estabilidade',
      '21 velocidades'
    ],
    specifications: {
      'Quadro': 'Alumínio 6061',
      'Garfo': 'Suspensão com 100mm de curso',
      'Freios': 'Disco hidráulico',
      'Marchas': '21 velocidades',
      'Pneus': '29" x 2.1"'
    }
  },
  {
    id: 2,
    name: 'Raquete de Tênis Wilson',
    category: 'Tênis',
    price: 'R$ 799,90',
    imageUrl: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Raquete profissional para competições e treinos intensivos. Tecnologia avançada para máximo controle e potência.',
    stock: 8,
    sku: 'RAQ001',
    brand: 'Wilson',
    weight: '300g',
    dimensions: '68x32x2cm',
    status: 'Ativo',
    features: [
      'Tecnologia Spin Effect',
      'Quadro de grafite',
      'Cordas pré-tensionadas',
      'Cabo ergonômico',
      'Peso balanceado'
    ],
    specifications: {
      'Peso': '300g',
      'Tamanho da cabeça': '100 polegadas²',
      'Comprimento': '68cm',
      'Material': 'Grafite + Kevlar',
      'Tensão': '50-60 lbs'
    }
  },
  {
    id: 3,
    name: 'Luva de Boxe Everlast',
    category: 'Lutas',
    price: 'R$ 249,90',
    imageUrl: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Luva de boxe profissional para treinos e competições. Proteção superior e conforto garantido.',
    stock: 25,
    sku: 'LUV001',
    brand: 'Everlast',
    weight: '450g',
    dimensions: '30x15x10cm',
    status: 'Ativo',
    features: [
      'Couro genuíno',
      'Preenchimento de espuma de alta densidade',
      'Sistema de ventilação',
      'Velcro ajustável',
      'Certificação profissional'
    ],
    specifications: {
      'Peso': '450g (16oz)',
      'Material': 'Couro genuíno',
      'Preenchimento': 'Espuma de alta densidade',
      'Tamanho': '16oz',
      'Certificação': 'WBC Aprovado'
    }
  },
  {
    id: 4,
    name: 'Skate Completo Profissional',
    category: 'Skate',
    price: 'R$ 499,90',
    imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Skate completo para iniciantes e profissionais. Qualidade superior e componentes de alta performance.',
    stock: 12,
    sku: 'SKT001',
    brand: 'Element',
    weight: '2.5kg',
    dimensions: '80x20x10cm',
    status: 'Ativo',
    features: [
      'Shape de maple canadense',
      'Trucks de alumínio',
      'Rodas de uretano',
      'Lixa profissional',
      'Parafusos de aço'
    ],
    specifications: {
      'Shape': 'Maple canadense 7 camadas',
      'Trucks': 'Alumínio fundido',
      'Rodas': 'Uretano 52mm',
      'Lixa': 'Grip profissional',
      'Parafusos': 'Aço inoxidável'
    }
  },
  {
    id: 5,
    name: 'Tênis Nike Air Max',
    category: 'Corrida',
    price: 'R$ 699,90',
    imageUrl: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Tênis de corrida com tecnologia Air Max para máximo conforto e amortecimento durante os treinos.',
    stock: 20,
    sku: 'TEN001',
    brand: 'Nike',
    weight: '320g',
    dimensions: '32x12x8cm',
    status: 'Ativo',
    features: [
      'Tecnologia Air Max',
      'Sola de borracha',
      'Entressola de espuma',
      'Cabedal respirável',
      'Design moderno'
    ],
    specifications: {
      'Peso': '320g',
      'Drop': '8mm',
      'Sola': 'Borracha de alta durabilidade',
      'Cabedal': 'Mesh respirável',
      'Tecnologia': 'Air Max'
    }
  },
  {
    id: 6,
    name: 'Bola de Futebol Adidas',
    category: 'Futebol',
    price: 'R$ 199,90',
    imageUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Bola oficial de futebol para treinos e jogos. Qualidade profissional e durabilidade garantida.',
    stock: 30,
    sku: 'BOL001',
    brand: 'Adidas',
    weight: '450g',
    dimensions: '22cm diâmetro',
    status: 'Ativo',
    features: [
      'Couro sintético',
      'Costura reforçada',
      'Câmara de ar de borracha',
      'Aprovação FIFA',
      'Resistente à água'
    ],
    specifications: {
      'Peso': '450g',
      'Circunferência': '68-70cm',
      'Pressão': '0.6-1.1 atm',
      'Material': 'Couro sintético',
      'Certificação': 'FIFA Aprovado'
    }
  }
];

export const getProductById = (id: number): Product | undefined => {
  return productsData.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return productsData.filter(product => product.category === category);
};

export const getCategories = (): string[] => {
  return Array.from(new Set(productsData.map(product => product.category)));
};
