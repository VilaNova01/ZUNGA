import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category  = searchParams.get('category');
  const search    = searchParams.get('q');
  const featured  = searchParams.get('featured');
  const offer     = searchParams.get('offer');
  const province  = searchParams.get('province');
  const delivery  = searchParams.get('delivery');
  const minPrice  = searchParams.get('minPrice');
  const maxPrice  = searchParams.get('maxPrice');
  const sort      = searchParams.get('sort') || 'recente';
  const take      = parseInt(searchParams.get('take') || '20');
  const skip      = parseInt(searchParams.get('skip') || '0');

  const where: any = { status: 'ACTIVE' };
  if (category)           where.category = { slug: category };
  if (search)             where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
  if (featured === '1')   where.featured = true;
  if (offer === '1')      where.isOffer = true;
  if (province)           where.province = province;
  if (delivery === '1')   where.hasDelivery = true;
  if (minPrice)           where.price = { ...where.price, gte: parseFloat(minPrice) };
  if (maxPrice)           where.price = { ...where.price, lte: parseFloat(maxPrice) };

  const orderBy: any =
    sort === 'preco-asc'     ? [{ price: 'asc' }]
    : sort === 'preco-desc'  ? [{ price: 'desc' }]
    : sort === 'popular'     ? [{ views: 'desc' }, { createdAt: 'desc' }]
    :                          [{ featured: 'desc' }, { createdAt: 'desc' }];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, city: true, province: true, isPremium: true } },
        category: { select: { name: true, slug: true, icon: true } },
        _count: { select: { likes: true } },
      },
      orderBy,
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role !== 'SELLER') return NextResponse.json({ error: 'Apenas vendedores podem publicar.' }, { status: 403 });
  if (user.status !== 'ACTIVE') return NextResponse.json({ error: 'Conta pendente de aprovação.' }, { status: 403 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      title:       body.title,
      description: body.description,
      price:       parseFloat(body.price),
      images:      JSON.stringify(body.images || []),
      colors:      body.colors || '[]',
      sizes:       body.sizes || '[]',
      condition:   body.condition || 'Novo',
      categoryId:  body.categoryId,
      province:    body.province,
      city:        body.city,
      whatsapp:    body.whatsapp,
      offerPrice:  body.offerPrice ? parseFloat(body.offerPrice) : null,
      isOffer:     !!body.offerPrice,
      hasDelivery: !!body.hasDelivery,
      sellerId:    user.id,
    },
  });

  return NextResponse.json({ ok: true, productId: product.id });
}
