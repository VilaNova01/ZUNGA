import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Imagens de placeholder realistas por categoria (picsum.photos — gratuito, sem autenticação)
const IMGS = {
  tech: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  ],
  moda: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=400&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  ],
  casa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  ],
  auto: [
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
  ],
  beleza: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
  ],
  comida: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
  ],
  esporte: [
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
  ],
};

async function seedDemo() {
  console.log('🌱 A criar dados de demonstração...\n');

  const pw = await bcrypt.hash('demo1234', 10);

  // ─── Vendedores ───────────────────────────────────────────────────────────
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria@demo.ao' },
      update: {},
      create: {
        name: 'Maria Fernanda', email: 'maria@demo.ao', password: pw,
        role: 'SELLER', status: 'ACTIVE', isPremium: true,
        premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        phone: '+244 923 456 789', province: 'Luanda', city: 'Talatona',
        bio: 'Vendo roupa de qualidade importada. Entrega em Luanda!',
      },
    }),
    prisma.user.upsert({
      where: { email: 'joao@demo.ao' },
      update: {},
      create: {
        name: 'João Silva', email: 'joao@demo.ao', password: pw,
        role: 'SELLER', status: 'ACTIVE', isPremium: false,
        phone: '+244 912 345 678', province: 'Luanda', city: 'Viana',
        bio: 'Técnico de informática. Vendo telemóveis e acessórios usados.',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana@demo.ao' },
      update: {},
      create: {
        name: 'Ana Rodrigues', email: 'ana@demo.ao', password: pw,
        role: 'SELLER', status: 'ACTIVE', isPremium: true,
        premiumUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        phone: '+244 934 567 890', province: 'Benguela', city: 'Benguela',
        bio: 'Beleza e cuidados pessoais. Produtos 100% originais.',
      },
    }),
    prisma.user.upsert({
      where: { email: 'pedro@demo.ao' },
      update: {},
      create: {
        name: 'Pedro Lopes', email: 'pedro@demo.ao', password: pw,
        role: 'SELLER', status: 'ACTIVE', isPremium: false,
        phone: '+244 945 678 901', province: 'Luanda', city: 'Cacuaco',
        bio: 'Vendo peças e acessórios auto. Preços justos.',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carla@demo.ao' },
      update: {},
      create: {
        name: 'Carla Mendes', email: 'carla@demo.ao', password: pw,
        role: 'SELLER', status: 'PENDING', isPremium: false,
        phone: '+244 956 789 012', province: 'Huambo', city: 'Huambo',
      },
    }),
  ]);

  const [maria, joao, ana, pedro] = sellers;

  // ─── Comprador ────────────────────────────────────────────────────────────
  const buyer = await prisma.user.upsert({
    where: { email: 'comprador@demo.ao' },
    update: {},
    create: {
      name: 'Carlos Buyer', email: 'comprador@demo.ao', password: pw,
      role: 'BUYER', status: 'ACTIVE',
    },
  });

  // ─── Categorias (buscar IDs do DB) ───────────────────────────────────────
  const cats = await prisma.category.findMany();
  const cat = (slug: string) => cats.find(c => c.slug === slug)!;

  // ─── Produtos ─────────────────────────────────────────────────────────────
  type ProductCreate = Parameters<typeof prisma.product.create>[0]['data'];

  const products: ProductCreate[] = [
    // MARIA — moda (premium, destaque)
    {
      title: 'iPhone 14 Pro 256GB — Space Black',
      description: 'iPhone 14 Pro em excelente estado. Sem riscos, bateria 97%. Acompanha caixa original, cabo e carregador. Comprado nos EUA há 8 meses. Garantia de hardware.',
      price: 520000, images: JSON.stringify([IMGS.tech[0], IMGS.tech[1]]),
      condition: 'Usado', categoryId: cat('tecnologia-telemoveis').id,
      province: 'Luanda', city: 'Talatona', whatsapp: '244923456789',
      featured: true, isOffer: false, views: 342, sellerId: joao.id, status: 'ACTIVE',
    },
    {
      title: 'Vestido Ankara Africano — Tamanho M',
      description: 'Vestido estampado Ankara, tecido de alta qualidade, feito à medida. Disponível nos tamanhos S, M, L. Cores vibrantes, ideal para festas e eventos tradicionais.',
      price: 15000, images: JSON.stringify([IMGS.moda[0], IMGS.moda[2]]),
      condition: 'Novo', categoryId: cat('moda-feminino').id,
      province: 'Luanda', city: 'Talatona', whatsapp: '244923456789',
      featured: true, isOffer: true, offerPrice: 12000, views: 218, sellerId: maria.id, status: 'ACTIVE',
    },
    {
      title: 'Conjunto Masculino Casual — Camisa + Calças',
      description: 'Conjunto elegante para o dia a dia. Camisa de algodão respirável e calças slim fit. Cor: bege. Tamanho disponível: S a XL.',
      price: 22000, images: JSON.stringify([IMGS.moda[1]]),
      condition: 'Novo', categoryId: cat('moda-masculino').id,
      province: 'Luanda', city: 'Talatona', whatsapp: '244923456789',
      featured: false, isOffer: false, views: 89, sellerId: maria.id, status: 'ACTIVE',
    },
    {
      title: 'Sapatilhas Nike Air Max 270 — n.42',
      description: 'Nike Air Max 270 originais, compradas na África do Sul. Usadas apenas 3 vezes. Estado impecável. Tamanho 42. Cor: branco/preto.',
      price: 45000, images: JSON.stringify([IMGS.moda[3]]),
      condition: 'Usado', categoryId: cat('moda-masculino-tenis').id,
      province: 'Luanda', city: 'Talatona', whatsapp: '244923456789',
      featured: false, isOffer: true, offerPrice: 38000, views: 156, sellerId: maria.id, status: 'ACTIVE',
    },

    // JOÃO — tecnologia
    {
      title: 'Samsung Galaxy S23 — 128GB',
      description: 'Samsung Galaxy S23 128GB, cor Phantom Black. Usado com cuidado, tela sem riscos. Desbloquado para todas as redes. Bateria em bom estado.',
      price: 320000, images: JSON.stringify([IMGS.tech[1], IMGS.tech[0]]),
      condition: 'Usado', categoryId: cat('tecnologia-telemoveis').id,
      province: 'Luanda', city: 'Viana', whatsapp: '244912345678',
      featured: false, isOffer: false, views: 201, sellerId: joao.id, status: 'ACTIVE',
    },
    {
      title: 'Laptop Lenovo ThinkPad i5 — 16GB RAM',
      description: 'ThinkPad E14 Gen 4, Intel i5 12ª geração, 16GB RAM, SSD 512GB. Windows 11 activado. Ideal para trabalho e estudos. Carregador incluído.',
      price: 380000, images: JSON.stringify([IMGS.tech[4], IMGS.tech[2]]),
      condition: 'Usado', categoryId: cat('tecnologia-computadores').id,
      province: 'Luanda', city: 'Viana', whatsapp: '244912345678',
      featured: true, isOffer: false, views: 445, sellerId: joao.id, status: 'ACTIVE',
    },
    {
      title: 'Auriculares JBL Tune 760NC — Bluetooth',
      description: 'JBL Tune 760NC com cancelamento de ruído activo. Autonomia até 35h. Dobráveis, compactos. Cor preta. Em excelente estado.',
      price: 28000, images: JSON.stringify([IMGS.tech[3]]),
      condition: 'Usado', categoryId: cat('tecnologia-acessorios').id,
      province: 'Luanda', city: 'Viana', whatsapp: '244912345678',
      featured: false, isOffer: true, offerPrice: 22000, views: 134, sellerId: joao.id, status: 'ACTIVE',
    },

    // ANA — beleza (premium)
    {
      title: 'Kit Maquiagem MAC — 12 Peças',
      description: 'Kit completo MAC: base, corretivo, contorno, paleta de sombras 12 cores, rímel, delineador, batom nude e gloss. Tudo original, nunca usado.',
      price: 65000, images: JSON.stringify([IMGS.beleza[0]]),
      condition: 'Novo', categoryId: cat('beleza-maquiagem').id,
      province: 'Benguela', city: 'Benguela', whatsapp: '244934567890',
      featured: true, isOffer: false, views: 312, sellerId: ana.id, status: 'ACTIVE',
    },
    {
      title: 'Perfume Chanel N°5 — 100ml EDP',
      description: 'Chanel N°5 Eau de Parfum 100ml original. Comprado em viagem a Paris. Caixa lacrada, nunca aberta. Autenticidade garantida.',
      price: 85000, images: JSON.stringify([IMGS.beleza[1]]),
      condition: 'Novo', categoryId: cat('beleza-perfumes').id,
      province: 'Benguela', city: 'Benguela', whatsapp: '244934567890',
      featured: false, isOffer: true, offerPrice: 72000, views: 289, sellerId: ana.id, status: 'ACTIVE',
    },
    {
      title: 'Extensões de Cabelo Natural — 50cm',
      description: 'Extensões 100% cabelo natural, comprimento 50cm. Cor: preto natural. Pode tingir e pentear normalmente. Duração mínima de 12 meses com cuidados adequados.',
      price: 35000, images: JSON.stringify([IMGS.beleza[0]]),
      condition: 'Novo', categoryId: cat('beleza-cabelo').id,
      province: 'Benguela', city: 'Benguela', whatsapp: '244934567890',
      featured: false, isOffer: false, views: 178, sellerId: ana.id, status: 'ACTIVE',
    },

    // PEDRO — auto
    {
      title: 'Toyota Corolla 2018 — 1.8L Automático',
      description: 'Toyota Corolla 2018, motor 1.8L automático, cor branca. 87.000 km feitos, revisões em dia. Ac, vidros eléctricos, sensores de estacionamento. Sem acidentes.',
      price: 14500000, images: JSON.stringify([IMGS.auto[0], IMGS.auto[1]]),
      condition: 'Usado', categoryId: cat('auto-veiculos').id,
      province: 'Luanda', city: 'Cacuaco', whatsapp: '244945678901',
      featured: true, isOffer: false, views: 623, sellerId: pedro.id, status: 'ACTIVE',
    },
    {
      title: 'Pneus Michelin 205/55 R16 — Jogo de 4',
      description: 'Jogo de 4 pneus Michelin Energy Saver+ 205/55 R16 91H. Usados apenas 8.000km. Estado excelente. Compatíveis com Toyota, Honda, Hyundai e outros.',
      price: 95000, images: JSON.stringify([IMGS.auto[2]]),
      condition: 'Usado', categoryId: cat('auto-pecas').id,
      province: 'Luanda', city: 'Cacuaco', whatsapp: '244945678901',
      featured: false, isOffer: true, offerPrice: 80000, views: 97, sellerId: pedro.id, status: 'ACTIVE',
    },
    {
      title: 'Sofá em L — 6 Lugares',
      description: 'Sofá em L moderno, 6 lugares, revestimento em couro sintético cinza. Estrutura sólida em madeira. Dimensões: 280x180cm. Excelente estado, 1 ano de uso.',
      price: 180000, images: JSON.stringify([IMGS.casa[0], IMGS.casa[1]]),
      condition: 'Usado', categoryId: cat('casa-moveis').id,
      province: 'Luanda', city: 'Cacuaco', whatsapp: '244945678901',
      featured: false, isOffer: false, views: 145, sellerId: pedro.id, status: 'ACTIVE',
    },
  ];

  let created = 0;
  for (const data of products) {
    const exists = await prisma.product.findFirst({
      where: { title: data.title as string, sellerId: data.sellerId as string },
    });
    if (!exists) {
      await prisma.product.create({ data: data as any });
      created++;
    }
  }

  // ─── Likes aleatórios ────────────────────────────────────────────────────
  const allProducts = await prisma.product.findMany({ take: 20 });
  const likers = [buyer.id, maria.id, joao.id];

  for (const p of allProducts) {
    for (const userId of likers) {
      if (userId === p.sellerId) continue;
      if (Math.random() > 0.5) {
        await prisma.like.upsert({
          where: { userId_productId: { userId, productId: p.id } },
          update: {},
          create: { userId, productId: p.id },
        });
      }
    }
  }

  console.log(`✅ Demo criado com sucesso!`);
  console.log(`   ${created} produtos inseridos`);
  console.log(`\n📋 Contas de teste:`);
  console.log(`   Admin:      admin@zunga.ao      / admin123`);
  console.log(`   Vendedor 1: maria@demo.ao        / demo1234  (Premium, Luanda)`);
  console.log(`   Vendedor 2: joao@demo.ao         / demo1234  (Gratuito, Luanda)`);
  console.log(`   Vendedor 3: ana@demo.ao          / demo1234  (Premium, Benguela)`);
  console.log(`   Vendedor 4: pedro@demo.ao        / demo1234  (Gratuito, Luanda)`);
  console.log(`   Pendente:   carla@demo.ao        / demo1234  (aguarda aprovação)`);
  console.log(`   Comprador:  comprador@demo.ao    / demo1234`);
}

seedDemo().catch(console.error).finally(() => prisma.$disconnect());
