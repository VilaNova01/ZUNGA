'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Store, Loader2 } from 'lucide-react';

export default function EscolhaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<'BUYER' | 'SELLER' | null>(null);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  async function escolher(role: 'BUYER' | 'SELLER') {
    setLoading(role);
    await fetch('/api/auth/escolha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    if (role === 'BUYER') {
      router.push('/');
      router.refresh();
    } else {
      // SELLER vai para o dashboard (vai mostrar mensagem de aprovação pendente)
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag size={26} className="text-white" />
            </div>
            <span className="text-3xl font-black text-orange-500">ZUNGA</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            Olá{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 mt-2">Como queres usar a Zunga?</p>
        </div>

        {/* Cards de escolha */}
        <div className="grid grid-cols-2 gap-4">

          {/* Comprar */}
          <button
            onClick={() => escolher('BUYER')}
            disabled={!!loading}
            className="group bg-white rounded-2xl border-2 border-slate-100 p-6 text-left hover:border-orange-400 hover:shadow-lg transition-all disabled:opacity-60 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              {loading === 'BUYER'
                ? <Loader2 size={28} className="text-blue-500 animate-spin" />
                : <ShoppingCart size={28} className="text-blue-500" />
              }
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-lg">Comprar</p>
              <p className="text-xs text-slate-500 mt-1">Explora produtos e faz compras</p>
            </div>
          </button>

          {/* Vender */}
          <button
            onClick={() => escolher('SELLER')}
            disabled={!!loading}
            className="group bg-white rounded-2xl border-2 border-slate-100 p-6 text-left hover:border-orange-400 hover:shadow-lg transition-all disabled:opacity-60 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              {loading === 'SELLER'
                ? <Loader2 size={28} className="text-orange-500 animate-spin" />
                : <Store size={28} className="text-orange-500" />
              }
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-lg">Vender</p>
              <p className="text-xs text-slate-500 mt-1">Publica produtos e gere as tuas vendas</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Podes sempre mudar mais tarde nas definições da conta.
        </p>
      </div>
    </div>
  );
}
