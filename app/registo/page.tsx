'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { signIn } from 'next-auth/react';

function RegistoForm() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
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
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: mode === 'email' ? email : undefined,
          phone: mode === 'phone' ? phone : undefined,
          password,
          role: 'BUYER',
        }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) { setError(data.error || 'Erro ao criar conta.'); return; }

      const identifier = mode === 'email' ? email : phone;
      const result = await signIn('credentials', { email: identifier, password, redirect: false });
      if (result?.error) { setError('Conta criada mas não foi possível entrar. Tenta fazer login.'); return; }
      router.push('/escolha');
      router.refresh();
    } catch {
      setError('Erro de ligação. Tenta novamente.');
    } finally {
      setLoading(false);
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
          <p className="text-sm text-slate-500 mt-1">É rápido e gratuito</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}

          {/* Toggle Email / Telefone */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'email' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Mail size={15} /> Email
            </button>
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'phone' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Phone size={15} /> Telefone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="O teu nome" />
            </div>

            {mode === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="o-teu@email.com" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de Telefone / WhatsApp</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="+244 9XX XXX XXX" />
              </div>
            )}

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
