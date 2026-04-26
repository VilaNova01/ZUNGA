'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

const QUICK_CATS = [
  { label: 'Telemóveis', icon: '📱', href: '/categoria/tecnologia-telemveis' },
  { label: 'Moda', icon: '👗', href: '/categoria/moda' },
  { label: 'Carros', icon: '🚗', href: '/categoria/auto-veculos' },
  { label: 'Beleza', icon: '💄', href: '/categoria/beleza' },
  { label: 'Casa', icon: '🏠', href: '/categoria/casa' },
  { label: 'Desporto', icon: '⚽', href: '/categoria/esporte' },
];

const FLOATING_CARDS = [
  { emoji: '📱', label: 'iPhone 14 Pro', price: '520.000 Kz', top: '8%', left: '2%', rotate: '-6deg' },
  { emoji: '👗', label: 'Vestido Ankara', price: '12.000 Kz', top: '5%', right: '3%', rotate: '5deg' },
  { emoji: '🚗', label: 'Toyota Corolla', price: '14.500.000 Kz', bottom: '20%', left: '0%', rotate: '-4deg' },
  { emoji: '💄', label: 'Kit MAC', price: '65.000 Kz', bottom: '15%', right: '1%', rotate: '6deg' },
];


export default function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/produtos?q=${encodeURIComponent(query.trim())}`);
    else router.push('/produtos');
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Glow blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-red-500 rounded-full blur-3xl opacity-15" />

      {/* Floating product cards — hidden on small screens */}
      <div className="hidden xl:block">
        {FLOATING_CARDS.map((card, i) => (
          <div key={i} className="absolute bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-10 animate-pulse"
            style={{ top: card.top, left: card.left, right: card.right, bottom: card.bottom, transform: `rotate(${card.rotate})`, animationDuration: `${3 + i * 0.7}s` }}>
            <span className="text-2xl">{card.emoji}</span>
            <div>
              <p className="text-xs font-bold text-slate-800 whitespace-nowrap">{card.label}</p>
              <p className="text-xs font-black text-orange-500 whitespace-nowrap">{card.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative max-w-4xl mx-auto px-4 pt-7 pb-4 text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-1 tracking-tight">
          Compra e vende perto de ti 🇦🇴
        </h1>

        <p className="text-orange-100 text-sm mb-4 max-w-lg mx-auto">
          O marketplace angolano — vendedores reais, pagamento na entrega.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="O que estás à procura?"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg"
            />
          </div>
          <button type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-colors whitespace-nowrap text-sm">
            Pesquisar
          </button>
        </form>

        {/* Quick category pills */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {QUICK_CATS.map(cat => (
            <Link key={cat.href} href={cat.href}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full transition-all">
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-10 overflow-hidden">
        <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="rgb(248 250 252)" />
        </svg>
      </div>
    </section>
  );
}
