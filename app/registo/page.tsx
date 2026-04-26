'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

function RegistoForm() {
  const params = useSearchParams();
  const [role, setRole] = useState<'BUYER' | 'SELLER'>(params.get('role') === 'seller' ? 'SELLER' : 'BUYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }

    if (role === 'SELLER') {
      router.push('/login?msg=pendente');
    } else {
      await signIn('credentials', { email, password, redirect: false });
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-orange-500">ZUNGA</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Role toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(['BUYER', 'SELLER'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === r ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>
                {r === 'BUYER' ? '🛒 Comprador' : '🏪 Vendedor'}
              </button>
            ))}
          </div>

          {role === 'SELLER' && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-5 text-xs text-orange-700">
              A conta de vendedor requer aprovação do administrador antes de poderes publicar produtos.
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="O teu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="o-teu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone / WhatsApp</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="+244 9XX XXX XXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 mt-2">
              {loading ? 'A criar conta...' : 'Criar Conta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Já tens conta?{' '}
            <Link href="/login" className="text-orange-500 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistoPage() {
  return <Suspense><RegistoForm /></Suspense>;
}
