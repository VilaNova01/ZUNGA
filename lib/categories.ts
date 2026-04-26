export interface SubCategoryDef {
  name: string;
  children?: string[];
}

export interface CategoryDef {
  name: string;
  slug: string;
  icon: string;
  children: (string | SubCategoryDef)[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    name: 'Moda & Estilo', slug: 'moda', icon: '👔|👗|👟|⌚',
    children: [
      {
        name: 'Masculino',
        children: [
          'Camisetas', 'Camisas', 'Calças', 'Calções', 'Casacos', 'Fatos', 'Conjuntos', 'Roupas Íntimas',
          'Tênis', 'Sapatos', 'Botas', 'Chinelos',
          'Relógios', 'Bonés', 'Óculos', 'Cintos', 'Carteiras', 'Gravatas',
        ],
      },
      {
        name: 'Feminino',
        children: [
          'Vestidos', 'Blusas', 'Calças', 'Saias', 'Conjuntos',
          'Saltos Altos', 'Tênis', 'Sandálias', 'Botas', 'Chinelos',
          'Bolsas de Mão', 'Mochilas', 'Carteiras',
          'Bijuterias', 'Óculos', 'Lenços', 'Cintos', 'Roupas Íntimas',
        ],
      },
    ],
  },
  {
    name: 'Tecnologia & Electrónicos', slug: 'tecnologia', icon: '📱',
    children: ['Telemóveis', 'Acessórios', 'Computadores', 'TVs & Som', 'Gaming'],
  },
  {
    name: 'Beleza & Cuidados', slug: 'beleza', icon: '💄',
    children: ['Maquiagem', 'Cabelo', 'Perfumes', 'Cuidados com a Pele'],
  },
  {
    name: 'Casa & Vida', slug: 'casa', icon: '🏠',
    children: ['Móveis', 'Decoração', 'Cozinha', 'Electrodomésticos'],
  },
  {
    name: 'Restaurantes', slug: 'comida', icon: '🍽️',
    children: ['Restaurantes'],
  },
  {
    name: 'Auto & Mobilidade', slug: 'auto', icon: '🚗',
    children: ['Veículos', 'Peças', 'Acessórios'],
  },
  {
    name: 'Esporte & Lazer', slug: 'esporte', icon: '⚽',
    children: [
      'Roupas Desportivas',
      'Calçados Desportivos',
      'Equipamentos Desportivos',
      'Equipamentos de Treino',
      'Suplementos',
      'Acessórios Desportivos',
    ],
  },
  {
    name: 'Bebés & Crianças', slug: 'bebes', icon: '🍼',
    children: [
      { name: 'Roupas',                 children: ['Conjuntos', 'Pijamas', 'Vestidos', 'Calças'] },
      { name: 'Calçados',               children: ['Tênis', 'Sandálias', 'Botinhas'] },
      { name: 'Brinquedos',             children: ['Brinquedos Educativos', 'Brinquedos de Diversão'] },
      { name: 'Cuidado e Higiene',      children: ['Fraldas', 'Toalitas', 'Cremes', 'Óleos', 'Produtos de Banho'] },
      { name: 'Transporte e Acessórios',children: ['Carrinhos de Bebé', 'Cadeirinhas', 'Mochilas', 'Chapéus', 'Cobertores'] },
      { name: 'Alimentação',            children: ['Mamadeiras', 'Papinhas', 'Leites Infantis'] },
    ],
  },
];

export function mainIcon(icon: string): string {
  return icon.split('|')[0];
}

export const PROVINCES = [
  'Luanda', 'Benguela', 'Huambo', 'Bié', 'Malanje', 'Lunda Norte', 'Lunda Sul',
  'Moxico', 'Cuando Cubango', 'Cunene', 'Namibe', 'Huíla', 'Cabinda',
  'Zaire', 'Uíge', 'Cuanza Norte', 'Cuanza Sul', 'Bengo',
];

export const PREMIUM_PRICE_KZ = 5000;
export const FREE_PRODUCT_LIMIT = 3;

export const PRODUCT_COLORS = [
  { name: 'Preto', hex: '#111111' },
  { name: 'Branco', hex: '#F8F8F8' },
  { name: 'Cinzento', hex: '#6B7280' },
  { name: 'Castanho', hex: '#92400E' },
  { name: 'Vermelho', hex: '#DC2626' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Azul Marinho', hex: '#1E3A5F' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Amarelo', hex: '#EAB308' },
  { name: 'Laranja', hex: '#EA580C' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Roxo', hex: '#7C3AED' },
  { name: 'Bege', hex: '#D4B483' },
  { name: 'Bordeaux', hex: '#7B1E2D' },
];

export const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const SIZES_SHOES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
export const SIZES_GENERIC = ['Único', 'PP', 'P', 'M', 'G', 'GG', 'GGG'];
