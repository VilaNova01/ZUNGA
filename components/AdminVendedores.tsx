'use client';
import { useState } from 'react';
import { Check, X, Star, StarOff, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Seller {
  id: string; name: string; email: string | null; phone?: string | null;
  status: string; isPremium: boolean; premiumUntil?: string;
  province?: string; createdAt: string; _count: { products: number };
}

export default function AdminVendedores({ initialSellers }: { initialSellers: Seller[] }) {
  const [sellers, setSellers] = useState(initialSellers);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  async function update(userId: string, data: object) {
    setLoading(userId);
    const res = await fetch('/api/admin/vendedores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    const result = await res.json();
    if (res.ok) {
      setSellers(prev => prev.map(s => s.id === userId ? { ...s, ...result.user } : s));
    }
    setLoading(null);
  }

  const filtered = filter === 'ALL' ? sellers : sellers.filter(s => filter === 'PENDING' ? s.status === 'PENDING' : filter === 'PREMIUM' ? s.isPremium : s.status === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
        {[['ALL', 'Todos'], ['PENDING', 'Pendentes'], ['ACTIVE', 'Activos'], ['PREMIUM', 'Premium'], ['SUSPENDED', 'Suspensos']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${filter === val ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-50">
        {filtered.length === 0 && (
          <p className="text-center py-10 text-slate-400 text-sm">Nenhum vendedor encontrado.</p>
        )}
        {filtered.map(seller => (
          <div key={seller.id} className={`flex items-center gap-4 p-4 ${seller.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
              {seller.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 truncate">{seller.name}</p>
                {seller.isPremium && <Star size={13} className="text-orange-400 fill-orange-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 truncate">{[seller.email, seller.phone].filter(Boolean).join(' · ') || 'sem contacto'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${seller.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : seller.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-500'}`}>
                  {seller.status === 'ACTIVE' ? 'Activo' : seller.status === 'PENDING' ? 'Pendente' : 'Suspenso'}
                </span>
                <span className="text-xs text-slate-400">{seller._count.products} produto{seller._count.products !== 1 ? 's' : ''}</span>
                {seller.province && <span className="text-xs text-slate-400">{seller.province}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/vendedor/${seller.id}`} target="_blank"
                className="flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-200">
                <ExternalLink size={12} /> Ver
              </Link>
              {seller.status === 'PENDING' && (
                <button onClick={() => update(seller.id, { status: 'ACTIVE' })} disabled={loading === seller.id}
                  className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-green-600 disabled:opacity-50">
                  <Check size={12} /> Aprovar
                </button>
              )}
              {seller.status === 'ACTIVE' && (
                <button onClick={() => update(seller.id, { status: 'SUSPENDED' })} disabled={loading === seller.id}
                  className="flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-200 disabled:opacity-50">
                  <X size={12} /> Suspender
                </button>
              )}
              {seller.status === 'SUSPENDED' && (
                <button onClick={() => update(seller.id, { status: 'ACTIVE' })} disabled={loading === seller.id}
                  className="flex items-center gap-1 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-200 disabled:opacity-50">
                  <Check size={12} /> Reactivar
                </button>
              )}
              <button onClick={() => update(seller.id, { isPremium: !seller.isPremium })} disabled={loading === seller.id}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-50 ${seller.isPremium ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>
                {seller.isPremium ? <><StarOff size={12} /> Remover Premium</> : <><Star size={12} /> Dar Premium</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
