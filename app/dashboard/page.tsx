import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { Package, Plus, Eye, Heart, AlertCircle } from 'lucide-react';
import DashboardProdutos from '@/components/DashboardProdutos';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      products: {
        include: { category: true, _count: { select: { likes: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user || user.role !== 'SELLER') redirect('/');
  if (user.status === 'PENDING') {
    return (
      <div className="min-h-screen"><Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Conta em análise</h1>
          <p className="text-slate-500">A tua conta de vendedor está a ser analisada. Receberás aprovação em breve.</p>
        </div>
      </div>
    );
  }

  const activeProducts = user.products.filter(p => p.status === 'ACTIVE');
  const totalViews = user.products.reduce((s, p) => s + p.views, 0);
  const totalLikes = user.products.reduce((s, p) => s + p._count.likes, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Olá, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-slate-500 text-sm">Painel do vendedor</p>
          </div>
          <Link href="/dashboard/novo-produto" className="flex items-center gap-2 bg-orange-500 text-white font-bold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
            <Plus size={16} /> Novo Produto
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Produtos Activos', value: activeProducts.length, icon: Package, color: 'text-blue-500' },
            { label: 'Visualizações', value: totalViews, icon: Eye, color: 'text-green-500' },
            { label: 'Likes', value: totalLikes, icon: Heart, color: 'text-red-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <stat.icon size={24} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Products list */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Os meus produtos</h2>
          </div>
          <DashboardProdutos initialProducts={user.products as any} />
        </div>
      </div>
    </div>
  );
}
