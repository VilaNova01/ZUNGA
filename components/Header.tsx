'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const user = session?.user as any;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/produtos?q=${encodeURIComponent(search)}`);
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-orange-500 tracking-tight">ZUNGA</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 hidden sm:flex">
            <div className="relative w-full">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar produtos..."
                className="w-full border border-slate-200 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-orange-500">
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {session ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="hidden sm:flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-700">
                    <Shield size={15} /> Admin
                  </Link>
                )}
                {user?.role === 'SELLER' && (
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-1 text-sm text-orange-600 font-medium hover:text-orange-700">
                    <LayoutDashboard size={15} /> Painel
                  </Link>
                )}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-slate-200"
                >
                  <User size={15} />
                  <span className="hidden sm:inline max-w-24 truncate">{session.user?.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-44 z-50">
                    {user?.role === 'ADMIN' && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"><Shield size={14} /> Admin</Link>}
                    {user?.role === 'SELLER' && <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"><LayoutDashboard size={14} /> Meu Painel</Link>}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 w-full">
                      <LogOut size={14} /> Sair
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-orange-500">Entrar</Link>
                <Link href="/registo" className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-orange-600">Criar Conta</Link>
              </>
            )}
          </div>

          <button className="sm:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="sm:hidden pb-3">
          <div className="relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full border border-slate-200 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:border-orange-400"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400"><Search size={16} /></button>
          </div>
        </form>
      </div>
    </header>
  );
}
