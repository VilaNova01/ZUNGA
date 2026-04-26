import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { MapPin, Package, Star, Calendar } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function VendedorPage({ params }: Props) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id, role: 'SELLER', status: 'ACTIVE' },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: { category: { select: { name: true, icon: true } }, _count: { select: { likes: true } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!seller) notFound();

  const totalViews = seller.products.reduce((s, p) => s + p.views, 0);
  const totalLikes = seller.products.reduce((s, p) => s + p._count.likes, 0);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Profile header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl font-black text-orange-500">
              {seller.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-800">{seller.name}</h1>
                {seller.isPremium && (
                  <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                    <Star size={11} fill="currentColor" /> Premium
                  </span>
                )}
              </div>
              {seller.bio && <p className="text-slate-500 text-sm mb-2">{seller.bio}</p>}
              <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                {(seller.city || seller.province) && (
                  <span className="flex items-center gap-1"><MapPin size={13} /> {[seller.city, seller.province].filter(Boolean).join(', ')}</span>
                )}
                <span className="flex items-center gap-1"><Calendar size={13} /> Desde {new Date(seller.createdAt).toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            {[
              { label: 'Produtos', value: seller.products.length },
              { label: 'Visualizações', value: totalViews },
              { label: 'Likes', value: totalLikes },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Package size={18} /> Produtos de {seller.name.split(' ')[0]}
        </h2>
        {seller.products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Este vendedor não tem produtos activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {seller.products.map(p => (
              <ProductCard key={p.id} product={{ ...p, seller: { name: seller.name, isPremium: seller.isPremium } } as any} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
