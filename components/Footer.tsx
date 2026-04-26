import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-orange-500">ZUNGA</span>
            </div>
            <p className="text-sm leading-relaxed">O marketplace angolano. Compra e vende produtos perto de ti.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categorias</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 5).map(c => (
                <li key={c.slug}><Link href={`/categoria/${c.slug}`} className="hover:text-orange-400 transition-colors">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Vendedores</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/registo?role=seller" className="hover:text-orange-400">Registar como Vendedor</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-400">Meu Painel</Link></li>
              <li><Link href="/dashboard/assinatura" className="hover:text-orange-400">Plano Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-orange-400">Entrar</Link></li>
              <li><Link href="/registo" className="hover:text-orange-400">Criar Conta</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} ZUNGA. Feito em Angola 🇦🇴
        </div>
      </div>
    </footer>
  );
}
