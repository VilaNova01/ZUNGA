import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { Users, Package, Eye, Heart, ShoppingBag, UserCheck, Clock, Settings } from 'lucide-react';
import AdminVendedores from '@/components/AdminVendedores';
import AdminProdutos from '@/components/AdminProdutos';
import AdminSettings from '@/components/AdminSettings';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user || user.role !== 'ADMIN') redirect('/');

  const [totalUsers, totalSellers, pendingSellers, totalProducts, totalViews, totalLikes, recentSellers, allProducts, allSettings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: 'SELLER', status: 'PENDING' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.aggregate({ _sum: { views: true } }),
    prisma.like.count(),
    prisma.user.findMany({
      where: { role: 'SELLER' },
      select: { id: true, name: true, email: true, phone: true, status: true, isPremium: true, premiumUntil: true, province: true, createdAt: true, _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      include: {
        seller: { select: { name: true } },
        category: { select: { name: true, icon: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  allSettings.forEach(s => { settingsMap[s.key] = s.value; });

  const stats = [
    { label: 'Utilizadores', value: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Vendedores', value: totalSellers, icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Pendentes', value: pendingSellers, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', alert: pendingSellers > 0 },
    { label: 'Produtos Activos', value: totalProducts, icon: Package, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Visualizações', value: totalViews._sum.views || 0, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Likes', value: totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500 text-sm">Bem-vindo, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-4 border-2 ${(s as any).alert ? 'border-yellow-300' : 'border-slate-100'}`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sellers management */}
        <div className="bg-white rounded-2xl border border-slate-100 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <UserCheck size={18} /> Gestão de Vendedores
              {pendingSellers > 0 && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingSellers} pendente{pendingSellers > 1 ? 's' : ''}</span>}
            </h2>
          </div>
          <AdminVendedores initialSellers={recentSellers as any} />
        </div>

        {/* Products management */}
        <div className="bg-white rounded-2xl border border-slate-100 mb-6">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Package size={18} /> Gestão de Produtos
            </h2>
          </div>
          <AdminProdutos initialProducts={allProducts as any} />
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Settings size={18} /> Configurações da Plataforma
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">WhatsApp de suporte, dados bancários e preço Premium</p>
          </div>
          <AdminSettings initial={settingsMap} />
        </div>
      </div>
    </div>
  );
}
