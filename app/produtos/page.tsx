import { prisma } from '@/lib/prisma';
import { CATEGORIES, PROVINCES, mainIcon } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LocationBar from '@/components/LocationBar';
import Link from 'next/link';
import { SlidersHorizontal, Truck } from 'lucide-react';
import { cookies } from 'next/headers';
import { sortByProximity } from '@/lib/location';

interface Props {
  searchParams: Promise<{
    q?: string; category?: string; featured?: string; offer?: string;
    province?: string; page?: string; delivery?: string;
    minPrice?: string; maxPrice?: string; sort?: string;
  }>;
}

export default async function ProdutosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parseInt(sp.page || '1');
  const take = 20;
  const skip = (page - 1) * take;

  const cookieStore = await cookies();
  const userProvince = cookieStore.get('zunga_province')?.value ?? null;

  const where: any = { status: 'ACTIVE' };
  if (sp.category)        where.category = { slug: sp.category };
  if (sp.q)               where.OR = [{ title: { contains: sp.q } }, { description: { contains: sp.q } }];
  if (sp.featured === '1') where.featured = true;
  if (sp.offer === '1')   where.isOffer = true;
  if (sp.province)        where.province = sp.province;
  if (sp.delivery === '1') where.hasDelivery = true;
  if (sp.minPrice)        where.price = { ...where.price, gte: parseFloat(sp.minPrice) };
  if (sp.maxPrice)        where.price = { ...where.price, lte: parseFloat(sp.maxPrice) };

  const sort = sp.sort || 'recente';
  const orderBy: any =
    sort === 'preco-asc'  ? [{ price: 'asc' }]
    : sort === 'preco-desc' ? [{ price: 'desc' }]
    : sort === 'popular'  ? [{ views: 'desc' }, { createdAt: 'desc' }]
    :                       [{ featured: 'desc' }, { createdAt: 'desc' }];

  const fetchTake = userProvince && sort === 'recente' && !sp.province ? take * 3 : take;

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { seller: { select: { name: true, isPremium: true } }, category: { select: { name: true, icon: true } }, _count: { select: { likes: true } } },
      orderBy, take: fetchTake, skip: userProvince && sort === 'recente' && !sp.province ? 0 : skip,
    }),
    prisma.product.count({ where }),
  ]);

  const products = userProvince && sort === 'recente' && !sp.province
    ? sortByProximity(rawProducts, userProvince).slice(skip, skip + take)
    : rawProducts;

  const totalPages = Math.ceil(total / take);

  function buildUrl(extra: Record<string, string>) {
    const p = new URLSearchParams({ ...sp, ...extra } as any);
    p.delete('page');
    Object.keys(extra).forEach(k => { if (!extra[k]) p.delete(k); });
    return `/produtos?${p.toString()}`;
  }

  const activeCategory = CATEGORIES.find(c => c.slug === sp.category);
  const sortLabel: Record<string, string> = {
    recente: 'Mais Recente', 'preco-asc': 'Preço ↑', 'preco-desc': 'Preço ↓', popular: 'Mais Popular',
  };

  return (
    <div className="min-h-screen">
      <Header />
      <LocationBar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {sp.q ? `"${sp.q}"` : activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : sp.featured === '1' ? '⭐ Em Destaque' : sp.offer === '1' ? '🏷️ Ofertas' : 'Todos os Produtos'}
            </h1>
            <p className="text-sm text-slate-500">{total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
          </div>
          {/* Sort */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span>Ordenar:</span>
            {Object.entries(sortLabel).map(([key, label]) => (
              <Link key={key} href={buildUrl({ sort: key })}
                className={`px-3 py-1.5 rounded-full border transition-colors ${sort === key ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sticky top-20 space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><SlidersHorizontal size={16} /> Filtros</h3>

              {/* Entrega */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Entrega</p>
                <Link href={buildUrl({ delivery: sp.delivery === '1' ? '' : '1' })}
                  className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg transition-colors ${sp.delivery === '1' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Truck size={14} /> Com Entrega
                </Link>
              </div>

              {/* Preço */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Preço (Kz)</p>
                <form method="get" action="/produtos" className="flex gap-1 items-center">
                  {Object.entries(sp).filter(([k]) => k !== 'minPrice' && k !== 'maxPrice' && k !== 'page').map(([k, v]) =>
                    <input key={k} type="hidden" name={k} value={v as string} />
                  )}
                  <input name="minPrice" type="number" defaultValue={sp.minPrice} placeholder="Min" min="0"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" />
                  <span className="text-slate-400 shrink-0">—</span>
                  <input name="maxPrice" type="number" defaultValue={sp.maxPrice} placeholder="Max" min="0"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" />
                  <button type="submit" className="bg-orange-500 text-white text-xs px-2 py-1.5 rounded-lg hover:bg-orange-600 shrink-0">OK</button>
                </form>
              </div>

              {/* Categoria */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Categoria</p>
                <Link href="/produtos" className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${!sp.category ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>Todas</Link>
                {CATEGORIES.map(cat => (
                  <Link key={cat.slug} href={buildUrl({ category: cat.slug })}
                    className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${sp.category === cat.slug ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {mainIcon(cat.icon)} {cat.name.split(' ')[0]}
                  </Link>
                ))}
              </div>

              {/* Província */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Província</p>
                <Link href={buildUrl({ province: '' })} className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${!sp.province ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>Todas</Link>
                {PROVINCES.map(p => (
                  <Link key={p} href={buildUrl({ province: p })}
                    className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${sp.province === p ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {p}
                  </Link>
                ))}
              </div>

              {/* Tipo */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Tipo</p>
                <Link href={buildUrl({ featured: '1' })} className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${sp.featured === '1' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>⭐ Em Destaque</Link>
                <Link href={buildUrl({ offer: '1' })} className={`block text-sm py-1 px-2 rounded-lg mb-0.5 ${sp.offer === '1' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>🏷️ Ofertas</Link>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="font-medium text-lg">Nenhum produto encontrado.</p>
                <Link href="/produtos" className="mt-4 inline-block text-orange-500 font-medium hover:underline">Ver todos os produtos</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => <ProductCard key={p.id} product={p as any} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                      <Link key={pg} href={`?${new URLSearchParams({ ...sp, page: String(pg) } as any)}`}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${pg === page ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'}`}>
                        {pg}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
