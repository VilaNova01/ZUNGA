import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LocationBar from '@/components/LocationBar';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, UtensilsCrossed, ImageIcon, Tag, Truck } from 'lucide-react';
import { cookies } from 'next/headers';
import { sortByProximity } from '@/lib/location';
import { mainIcon } from '@/lib/categories';

interface Props { params: Promise<{ slug: string }> }

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const userProvince = cookieStore.get('zunga_province')?.value ?? null;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { include: { children: true } },
      parent: {
        include: {
          children: { include: { children: true } },
          parent: true,
        },
      },
    },
  });
  if (!category) notFound();

  const isRoot = !category.parentId;
  const hasChildren = category.children.length > 0;

  // Build slugs to query products
  let slugsToQuery: string[] = [category.slug];
  if (isRoot) {
    slugsToQuery = [
      category.slug,
      ...category.children.flatMap((c: any) => [c.slug, ...c.children.map((g: any) => g.slug)]),
    ];
  } else if (hasChildren) {
    slugsToQuery = [category.slug, ...category.children.map((c: any) => c.slug)];
  }

  const rawProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE', category: { slug: { in: slugsToQuery } } },
    include: {
      seller: { select: { name: true, isPremium: true } },
      category: { select: { name: true, icon: true } },
      _count: { select: { likes: true } },
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 80,
  });

  const products = userProvince
    ? sortByProximity(rawProducts, userProvince).slice(0, 40)
    : rawProducts.slice(0, 40);

  // Breadcrumbs
  const breadcrumbs: { name: string; slug: string }[] = [];
  if (isRoot) {
    breadcrumbs.push({ name: category.name, slug: category.slug });
  } else if (hasChildren) {
    if (category.parent) breadcrumbs.push({ name: category.parent.name, slug: category.parent.slug });
    breadcrumbs.push({ name: category.name, slug: category.slug });
  } else {
    const grandparent = (category.parent as any)?.parent;
    if (grandparent) breadcrumbs.push({ name: grandparent.name, slug: grandparent.slug });
    if (category.parent) breadcrumbs.push({ name: category.parent.name, slug: category.parent.slug });
    breadcrumbs.push({ name: category.name, slug: category.slug });
  }

  // Pills to show
  const pillParentSlug = hasChildren ? category.slug : category.parent?.slug || null;
  const pills: { name: string; slug: string }[] = hasChildren
    ? category.children as any
    : ((category.parent?.children || []) as any);

  const displayIcon = isRoot
    ? category.icon
    : (category.parent as any)?.parent?.icon || category.parent?.icon || category.icon;

  return (
    <div className="min-h-screen">
      <Header />
      <LocationBar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6 flex-wrap">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.slug} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="shrink-0" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={`/categoria/${bc.slug}`} className="hover:text-orange-500 transition-colors">{bc.name}</Link>
                ) : (
                  <span className="text-slate-800 font-medium">{bc.name}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{mainIcon(displayIcon)}</div>
          <h1 className="text-3xl font-black text-slate-800">{category.name}</h1>
          <p className="text-slate-500 mt-1">
            {products.length} produto{products.length !== 1 ? 's' : ''} disponíve{products.length !== 1 ? 'is' : 'l'}
          </p>
        </div>

        {/* Banner informativo — Restaurantes */}
        {(slug === 'comida' || slug === 'comida-restaurantes') && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed size={18} className="text-orange-500" />
              <p className="font-bold text-slate-800">O que cada restaurante pode fazer</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <ImageIcon size={15} className="text-orange-400 mt-0.5 shrink-0" />
                <span>Publicar fotos dos pratos</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <Tag size={15} className="text-orange-400 mt-0.5 shrink-0" />
                <span>Definir preços por prato</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <Truck size={15} className="text-orange-400 mt-0.5 shrink-0" />
                <span>Oferecer serviço de entrega</span>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory / sibling pills */}
        {pills.length > 0 && pillParentSlug && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Link
              href={`/categoria/${pillParentSlug}`}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                slug === pillParentSlug
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              Todos
            </Link>
            {pills.map((pill: any) => (
              <Link
                key={pill.slug}
                href={`/categoria/${pill.slug}`}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  slug === pill.slug
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {pill.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-medium">Ainda não há produtos nesta categoria.</p>
            <Link href="/produtos" className="mt-4 inline-block text-orange-500 hover:underline text-sm">
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
