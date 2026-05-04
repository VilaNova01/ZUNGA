import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LocationBar from '@/components/LocationBar';
import Link from 'next/link';
import { Tag, Flame, MapPin, ChevronRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { cookies } from 'next/headers';
import { sortByProximity } from '@/lib/location';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getData(province: string | null) {
  const include = { seller: { select: { name: true, isPremium: true } }, category: { select: { name: true, icon: true } }, _count: { select: { likes: true } } };

  const [featured, offers, recent, nearby] = await Promise.all([
    prisma.product.findMany({ where: { status: 'ACTIVE', featured: true }, include, orderBy: { createdAt: 'desc' }, take: 24 }),
    prisma.product.findMany({ where: { status: 'ACTIVE', isOffer: true }, include, orderBy: { createdAt: 'desc' }, take: 24 }),
    prisma.product.findMany({ where: { status: 'ACTIVE' }, include, orderBy: { createdAt: 'desc' }, take: 40 }),
    province
      ? prisma.product.findMany({ where: { status: 'ACTIVE', province }, include, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }], take: 8 })
      : Promise.resolve([]),
  ]);

  if (!province) return { featured: featured.slice(0, 8), offers: offers.slice(0, 8), recent: recent.slice(0, 12), nearby: [] };

  return {
    featured: sortByProximity(featured, province).slice(0, 8),
    offers:   sortByProximity(offers, province).slice(0, 8),
    recent:   sortByProximity(recent, province).slice(0, 12),
    nearby,
  };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const province = cookieStore.get('zunga_province')?.value ?? null;
  const { featured, offers, recent, nearby } = await getData(province);
  const session = await getServerSession(authOptions);
  const venderHref = session ? '/vender' : '/registo?role=seller';

  return (
    <div className="min-h-screen">
      <Header />

      <LocationBar />
      <HeroSection />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-slate-800 mb-5">Categorias</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => {
            const icons = cat.icon.split('|');
            const isGrid = icons.length > 1;
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md hover:border-orange-200 border border-slate-100 transition-all group text-center">
                {isGrid ? (
                  <div className="grid grid-cols-2 gap-0.5 w-10 h-10">
                    {icons.map((ic, i) => (
                      <span key={i} className="text-lg flex items-center justify-center leading-none">{ic}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-3xl">{cat.icon}</span>
                )}
                <span className="text-xs font-medium text-slate-600 group-hover:text-orange-500 leading-tight">{cat.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Perto de Si */}
      {nearby.length > 0 && province && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-green-500" /> Perto de Si · <span className="text-green-600">{province}</span>
            </h2>
            <Link href={`/produtos?province=${encodeURIComponent(province)}`} className="text-sm text-orange-500 font-medium flex items-center gap-1">Ver todos <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {nearby.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Flame size={20} className="text-orange-500" /> Produtos em Destaque</h2>
            <Link href="/produtos?featured=1" className="text-sm text-orange-500 font-medium flex items-center gap-1">Ver todos <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Tag size={20} className="text-red-500" /> Ofertas do Dia</h2>
            <Link href="/produtos?offer=1" className="text-sm text-orange-500 font-medium flex items-center gap-1">Ver todas <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {offers.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><MapPin size={20} className="text-slate-500" /> Publicações Recentes</h2>
          <Link href="/produtos" className="text-sm text-orange-500 font-medium flex items-center gap-1">Ver todos <ChevronRight size={14} /></Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-5xl mb-4 block">🛒</span>
            <p className="font-medium">Ainda não há produtos publicados.</p>
            <Link href={venderHref} className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600">Seja o primeiro a vender</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-2">Quer vender na ZUNGA?</h3>
          <p className="text-slate-400 mb-6">Plano gratuito com 3 produtos. Premium ilimitado por apenas 5.000 Kz/mês.</p>
          <Link href={venderHref} className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition-colors inline-block">Começar a Vender Agora</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
