'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, StarOff, Trash2, ExternalLink, Eye } from 'lucide-react';

interface Product {
  id: string; title: string; price: number; status: string;
  featured: boolean; isOffer: boolean; views: number;
  images: string;
  seller: { name: string };
  category: { name: string; icon: string };
  _count: { likes: number };
  createdAt: string;
}

export default function AdminProdutos({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  async function updateProduct(productId: string, data: object) {
    setLoading(productId);
    const res = await fetch('/api/admin/produtos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, ...data }),
    });
    const result = await res.json();
    if (res.ok) setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...result.product } : p));
    setLoading(null);
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Tens a certeza que queres eliminar este produto?')) return;
    setLoading(productId);
    const res = await fetch('/api/admin/produtos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== productId));
    setLoading(null);
  }

  const filtered = filter === 'ALL' ? products
    : filter === 'FEATURED' ? products.filter(p => p.featured)
    : filter === 'OFFER' ? products.filter(p => p.isOffer)
    : products.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
        {[['ALL', 'Todos'], ['ACTIVE', 'Activos'], ['FEATURED', 'Destaque'], ['OFFER', 'Ofertas'], ['PENDING', 'Pendentes']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${filter === val ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-50">
        {filtered.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Nenhum produto encontrado.</p>}
        {filtered.map(product => {
          const thumb = (() => { try { const imgs = JSON.parse(product.images); return imgs[0] || null; } catch { return null; } })();
          return (
            <div key={product.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
              <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                {thumb ? <img src={thumb} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">{product.category.icon}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate text-sm">{product.title}</p>
                <p className="text-xs text-slate-500">{product.price.toLocaleString('pt-AO')} Kz · {product.category.name}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  <span>por {product.seller.name}</span>
                  <span className="flex items-center gap-0.5"><Eye size={10} /> {product.views}</span>
                  <span>❤️ {product._count.likes}</span>
                  {product.featured && <span className="text-orange-500 font-medium">⭐ Destaque</span>}
                  {product.isOffer && <span className="text-red-500 font-medium">🔖 Oferta</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/produto/${product.id}`} target="_blank"
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                  <ExternalLink size={13} />
                </Link>
                <button onClick={() => updateProduct(product.id, { featured: !product.featured })} disabled={loading === product.id}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full disabled:opacity-50 ${product.featured ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {product.featured ? <><StarOff size={11} /> Remover</> : <><Star size={11} /> Destacar</>}
                </button>
                <button onClick={() => deleteProduct(product.id)} disabled={loading === product.id}
                  className="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1.5 rounded-full hover:bg-red-100 disabled:opacity-50">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
