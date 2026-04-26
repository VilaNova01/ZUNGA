'use client';
import { useState } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  initial: Record<string, string>;
}

export default function AdminSettings({ initial }: Props) {
  const [form, setForm] = useState({
    contact_whatsapp: initial.contact_whatsapp ?? '',
    bank_iban:        initial.bank_iban ?? '',
    bank_name:        initial.bank_name ?? '',
    bank_holder:      initial.bank_holder ?? '',
    premium_price:    initial.premium_price ?? '5000',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setSaved(false);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError('Erro ao guardar.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const field = (label: string, key: keyof typeof form, placeholder: string, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        {field('WhatsApp de Suporte', 'contact_whatsapp', '244900000000', 'Número sem espaços nem +, ex: 244923456789')}
        {field('Preço Premium (Kz/mês)', 'premium_price', '5000')}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-4">
        <p className="text-sm font-semibold text-slate-600">Dados Bancários (Transferência)</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {field('Banco', 'bank_name', 'BAI')}
          {field('Titular da Conta', 'bank_holder', 'ZUNGA, LDA')}
        </div>
        {field('IBAN', 'bank_iban', 'AO06 0040 0000 0000 0000 0000 0', 'IBAN completo da conta bancária da ZUNGA')}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={loading}
        className="flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60">
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> A guardar...</>
          : saved
          ? <><CheckCircle size={16} /> Guardado!</>
          : <><Save size={16} /> Guardar Configurações</>
        }
      </button>
    </form>
  );
}
