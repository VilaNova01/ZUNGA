'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { PROVINCES, PRODUCT_COLORS, SIZES_CLOTHING, SIZES_SHOES, SIZES_GENERIC, mainIcon } from '@/lib/categories';
import { Upload, X, Loader2, Palette, Ruler, Truck } from 'lucide-react';

const FASHION_SLUGS = ['moda', 'moda-masculino', 'moda-feminino', 'moda-infantil', 'moda-calcados', 'moda-acessorios'];

export default function NovoProdutoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', offerPrice: '',
    condition: 'Novo', categoryId: '', province: '', city: '', whatsapp: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeType, setSizeType] = useState<'clothing' | 'shoes' | 'generic'>('clothing');
  const [hasDelivery, setHasDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formata "10000" → "10.000" e aceita input com ponto (separador de milhares angolano)
  function formatPrice(val: string): string {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('pt-AO');
  }
  function handlePriceChange(field: 'price' | 'offerPrice', val: string) {
    setForm(f => ({ ...f, [field]: formatPrice(val) }));
  }
  // Remove pontos antes de enviar: "10.000" → 10000
  function parsePrice(val: string): number {
    return parseFloat(val.replace(/\./g, '')) || 0;
  }

  const selectedCategory = categories
    .flatMap((c: any) => [c, ...(c.children || []).flatMap((ch: any) => [ch, ...(ch.children || [])])])
    .find((c: any) => c.id === form.categoryId);

  const isFashion = selectedCategory
    ? FASHION_SLUGS.some(s => selectedCategory.slug?.startsWith(s))
    : false;

  const isShoes = selectedCategory?.slug?.includes('calcados') || selectedCategory?.slug?.includes('sapatos') || selectedCategory?.slug?.includes('tenis') || false;

  const activeSizes = isShoes ? SIZES_SHOES : sizeType === 'generic' ? SIZES_GENERIC : SIZES_CLOTHING;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    fetch('/api/categorias').then(r => r.json()).then(setCategories);
  }, [status]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.slice(0, 5 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function toggleColor(hex: string) {
    setSelectedColors(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]);
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { setError('Selecciona uma categoria.'); return; }
    if (images.length === 0) { setError('Adiciona pelo menos uma imagem.'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parsePrice(form.price),
        offerPrice: form.offerPrice ? parsePrice(form.offerPrice) : null,
        images,
        colors: JSON.stringify(selectedColors),
        sizes: JSON.stringify(selectedSizes),
        hasDelivery,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-slate-800 mb-6">Publicar Produto</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block font-semibold text-slate-800 mb-3">Fotos do produto</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 text-slate-400 hover:text-orange-400">
                  <Upload size={20} />
                  <span className="text-xs mt-1">Foto</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Máximo 5 fotos · A primeira será a imagem principal</p>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Informação do produto</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={100}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                placeholder="Ex: Camisa Social Azul Slim Fit" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
                placeholder="Descreve o produto em detalhe..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria *</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option value="">Seleccionar categoria</option>
                {categories.map((cat: any) => (
                  <optgroup key={cat.id} label={`${mainIcon(cat.icon)} ${cat.name}`}>
                    {cat.children?.map((mid: any) =>
                      mid.children?.length > 0 ? (
                        <optgroup key={mid.id} label={`  ↳ ${mid.name}`}>
                          {mid.children.map((child: any) => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                          ))}
                          <option value={mid.id}>{mid.name} (Geral)</option>
                        </optgroup>
                      ) : (
                        <option key={mid.id} value={mid.id}>{mid.name}</option>
                      )
                    )}
                    <option value={cat.id}>{cat.name} (Geral)</option>
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Condição</label>
              <div className="flex gap-2">
                {['Novo', 'Usado', 'Recondicionado'].map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, condition: c }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${form.condition === c ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Palette size={17} className="text-orange-400" /> Cores disponíveis
            </h3>
            <p className="text-xs text-slate-400 mb-3">Selecciona todas as cores que tens em stock (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_COLORS.map(color => {
                const active = selectedColors.includes(color.hex);
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => toggleColor(color.hex)}
                    title={color.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                );
              })}
            </div>
            {selectedColors.length > 0 && (
              <p className="text-xs text-orange-600 mt-2">{selectedColors.length} cor{selectedColors.length !== 1 ? 'es' : ''} seleccionada{selectedColors.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Ruler size={17} className="text-orange-400" /> Tamanhos disponíveis
            </h3>
            <p className="text-xs text-slate-400 mb-3">Selecciona os tamanhos disponíveis em stock (opcional)</p>

            {!isShoes && (
              <div className="flex gap-2 mb-3">
                {(['clothing', 'shoes', 'generic'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setSizeType(t); setSelectedSizes([]); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${sizeType === t ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {t === 'clothing' ? 'Roupa (XS-XXXL)' : t === 'shoes' ? 'Calçado (35-46)' : 'Geral (P/M/G)'}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {activeSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    selectedSizes.includes(size) ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 text-slate-600 hover:border-orange-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSizes.length > 0 && (
              <p className="text-xs text-orange-600 mt-2">{selectedSizes.length} tamanho{selectedSizes.length !== 1 ? 's' : ''} seleccionado{selectedSizes.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Preço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Preço (Kz) *</label>
                <div className="relative">
                  <input
                    type="text" inputMode="numeric" value={form.price} required
                    onChange={e => handlePriceChange('price', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-orange-400"
                    placeholder="Ex: 10.000" />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">Kz</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Preço de Oferta (opcional)</label>
                <div className="relative">
                  <input
                    type="text" inputMode="numeric" value={form.offerPrice}
                    onChange={e => handlePriceChange('offerPrice', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-orange-400"
                    placeholder="Deixar vazio" />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">Kz</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">Usa o ponto como separador de milhares — ex: 10.000 · 250.000</p>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <button
              type="button"
              onClick={() => setHasDelivery(d => !d)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${hasDelivery ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3">
                <Truck size={20} className={hasDelivery ? 'text-green-500' : 'text-slate-400'} />
                <div className="text-left">
                  <p className={`font-semibold text-sm ${hasDelivery ? 'text-green-700' : 'text-slate-700'}`}>Oferece serviço de entrega</p>
                  <p className="text-xs text-slate-400">O vendedor entrega ao cliente</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${hasDelivery ? 'bg-green-500' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hasDelivery ? 'left-5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Location & Contact */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Localização & Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Província</label>
                <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="">Seleccionar</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade / Município</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                  placeholder="Ex: Viana, Talatona..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp para contacto</label>
              <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                placeholder="+244 9XX XXX XXX" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base">
            {loading ? <><Loader2 size={18} className="animate-spin" /> A publicar...</> : 'Publicar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}
