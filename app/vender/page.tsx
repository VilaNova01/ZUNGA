'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, Store, CheckCircle, Clock, ArrowRight, Loader2, Package, TrendingUp, Shield } from 'lucide-react';
import Header from '@/components/Header';

export default function VenderPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = session?.user as any;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-orange-400 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Already an active seller → go to dashboard
  if (user?.role === 'SELLER' && user?.status === 'ACTIVE') {
    router.push('/dashboard');
    return null;
  }

  // Pending seller → show waiting message
  if (user?.role === 'SELLER' && user?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={36} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Conta em análise</h1>
          <p className="text-slate-500 mb-8">
            A tua conta de vendedor está a ser verificada pela nossa equipa.
            Receberás uma notificação assim que for aprovada.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:underline">
            <ShoppingBag size={16} /> Continuar a comprar enquanto esperas
          </Link>
        </div>
      </div>
    );
  }

  async function activarVendedor() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/escolha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'SELLER' }),
      });
      if (!res.ok) { setError('Erro ao activar. Tenta novamente.'); return; }
      await update();
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro de ligação. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Store size={40} className="text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Começa a vender na Zunga</h1>
          <p className="text-slate-500 text-lg">Publica os teus produtos e chega a milhares de compradores em Angola.</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Package, title: 'Publica facilmente', desc: 'Adiciona produtos em minutos com fotos e preços', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: TrendingUp, title: 'Aumenta as vendas', desc: 'Expõe os teus produtos a compradores activos', color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Shield, title: 'Processo seguro', desc: 'Verificação rápida para garantir confiança', color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className={`w-12 h-12 ${b.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <b.icon size={22} className={b.color} />
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{b.title}</p>
              <p className="text-xs text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Process steps */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          <h2 className="font-bold text-slate-800 mb-4">Como funciona?</h2>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Clica em "Activar conta de vendedor" abaixo', done: false },
              { step: '2', text: 'A nossa equipa verifica o teu perfil (normalmente em 24h)', done: false },
              { step: '3', text: 'Recebes aprovação e podes publicar produtos!', done: false },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <p className="text-sm text-slate-600 pt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <button
          onClick={activarVendedor}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-60 text-lg shadow-lg shadow-orange-200"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Store size={20} />}
          {loading ? 'A activar...' : 'Activar conta de vendedor'}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="text-center text-sm text-slate-400 mt-4">
          Queres primeiro{' '}
          <Link href="/" className="text-orange-500 hover:underline font-medium">explorar produtos</Link>?
        </p>
      </div>
    </div>
  );
}
