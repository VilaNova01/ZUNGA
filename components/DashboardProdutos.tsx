'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, Star, Trash2, Package } from 'lucide-react';

interface Product {
  id: string; title: string; price: number; status: string;
  featured: boolean; views: number; images: string;
  category: { name: string; icon: string };
  _count: { likes: number };
}

export default function DashboardProdutos({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(productId: string, title: string) {
    if (!confirm(`Eliminar "${title}"? Esta acção é irreversível.`)) return;
    setDeleting(productId);
    const res = await fetch(`/api/produtos/${productId}`, { method: 'DELETE' });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== productId));
    setDeleting(null);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">Ainda não publicaste nenhum produto.</p>
        <Link href="/dashboard/novo-produto" className="mt-4 inline-block bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium">Publicar primeiro produto</Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {products.map(product => {
        const imgs = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
        return (
          <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
            <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
              {imgs[0] ? <img src={imgs[0]} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">{product.category.icon}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{product.title}</p>
              <p className="text-sm text-slate-500">{product.price.toLocaleString('pt-AO')} Kz · {product.category.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-0.5"><Eye size={11} /> {product.views}</span>
                <span className="flex items-center gap-0.5"><Heart size={11} /> {product._count.likes}</span>
                {product.featured && <span className="text-orange-500 font-medium flex items-center gap-0.5"><Star size={11} /> Destaque</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'}`}>
                {product.status === 'ACTIVE' ? 'Activo' : product.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
              </span>
              <Link href={`/produto/${product.id}`} className="text-xs text-slate-400 hover:text-orange-500">Ver</Link>
              <button onClick={() => handleDelete(product.id, product.title)} disabled={deleting === product.id}
                className="text-red-400 hover:text-red-600 disabled:opacity-40 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
