import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import Link from 'next/link';
import { Eye, MapPin, MessageCircle, Phone, Star, Package, Calendar } from 'lucide-react';
import { PRODUCT_COLORS, mainIcon } from '@/lib/categories';

interface Props { params: Promise<{ id: string }> }

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, phone: true, city: true, province: true, isPremium: true, createdAt: true, _count: { select: { products: true } } } },
      category: true,
      _count: { select: { likes: true } },
    },
  });

  if (!product || product.status !== 'ACTIVE') notFound();

  await prisma.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
  const colors: string[] = (() => { try { return JSON.parse(product.colors || '[]'); } catch { return []; } })();
  const sizes: string[] = (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();

  // Buscar candidatos: mesma categoria + categoria irmã (mesmo pai)
  const candidates = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: id },
      OR: [
        { categoryId: product.categoryId },
        { category: { parentId: product.category.parentId ?? product.category.id } },
      ],
    },
    include: {
      seller: { select: { name: true, isPremium: true } },
      category: { select: { name: true, icon: true } },
      _count: { select: { likes: true } },
    },
    take: 30,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });

  // Scoring de similaridade
  const titleWords = product.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const recommendations = candidates
    .map(c => {
      let score = 0;
      if (c.categoryId === product.categoryId) score += 4;

      const cColors: string[] = (() => { try { return JSON.parse(c.colors || '[]'); } catch { return []; } })();
      score += cColors.filter(col => colors.includes(col)).length * 2;

      const cSizes: string[] = (() => { try { return JSON.parse(c.sizes || '[]'); } catch { return []; } })();
      score += cSizes.filter(sz => sizes.includes(sz)).length;

      const cTitle = c.title.toLowerCase();
      score += titleWords.filter(w => cTitle.includes(w)).length * 2;

      if (c.featured) score += 1;
      score += Math.min(c._count.likes, 5);

      return { ...c, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  const whatsappNum = (product.whatsapp || product.seller.phone || '').replace(/\D/g, '');
  const whatsappMsg = encodeURIComponent(`Olá! Vi o teu produto "${product.title}" na ZUNGA por ${product.price.toLocaleString('pt-AO')} Kz. Ainda está disponível?`);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-3">
              {images[0] ? (
                <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">{mainIcon(product.category.icon)}</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img: string, i: number) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-orange-400 cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <Link href={`/categoria/${product.category.slug}`} className="text-sm text-orange-500 font-medium">{mainIcon(product.category.icon)} {product.category.name}</Link>
                <h1 className="text-2xl font-black text-slate-900 mt-1">{product.title}</h1>
              </div>
              {product.featured && (
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Star size={11} fill="currentColor" /> Destaque
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-black text-slate-900">
                {(product.isOffer && product.offerPrice ? product.offerPrice : product.price).toLocaleString('pt-AO')} Kz
              </span>
              {product.isOffer && product.offerPrice && (
                <span className="text-lg text-slate-400 line-through">{product.price.toLocaleString('pt-AO')} Kz</span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
              <span className="flex items-center gap-1"><Eye size={15} /> {product.views} visualizações</span>
              <LikeButton productId={product.id} initialLikes={product._count.likes} />
              <span className="flex items-center gap-1"><Package size={15} /> {product.condition}</span>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-slate-700 mb-2">Cores disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(hex => {
                    const colorDef = PRODUCT_COLORS.find(c => c.hex === hex);
                    return (
                      <div key={hex} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs text-slate-600">{colorDef?.name || hex}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-slate-700 mb-2">Tamanhos disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <span key={size} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-slate-50">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <h3 className="font-semibold text-slate-800 mb-2">Descrição</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Location */}
            {(product.city || product.province) && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
                <MapPin size={15} className="text-orange-400" />
                <span>{[product.city, product.province].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Contact */}
            <div className="space-y-3">
              {whatsappNum && (
                <a href={`https://wa.me/${whatsappNum.startsWith('244') ? whatsappNum : '244' + whatsappNum}?text=${whatsappMsg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors">
                  <MessageCircle size={18} /> Contactar via WhatsApp
                </a>
              )}
              {whatsappNum && (
                <a href={`tel:+${whatsappNum.startsWith('244') ? whatsappNum : '244' + whatsappNum}`}
                  className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <Phone size={16} /> Chamada directa
                </a>
              )}
              <div className="text-center text-xs text-slate-400 bg-slate-50 rounded-xl py-2">
                💡 O pagamento é feito presencialmente na entrega
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                <span className="text-base leading-none">🚚</span>
                <span>A taxa de entrega é definida por cada vendedor, variando de acordo com a distância.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Card */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sobre o Vendedor</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500">
              {product.seller.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{product.seller.name}</p>
                {product.seller.isPremium && (
                  <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{product.seller._count.products} produto{product.seller._count.products !== 1 ? 's' : ''} publicados</p>
              {(product.seller.city || product.seller.province) && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {[product.seller.city, product.seller.province].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <Link href={`/vendedor/${product.seller.id}`}
              className="text-sm text-orange-500 font-medium border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50">
              Ver perfil
            </Link>
          </div>
        </div>

        {/* Recomendações inteligentes */}
        {recommendations.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-xl font-bold text-slate-800">Produtos Semelhantes</h3>
              <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">Sugeridos para si</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.map(p => {
                const pImgs = (() => { try { return JSON.parse(p.images); } catch { return []; } })();
                const pColors: string[] = (() => { try { return JSON.parse(p.colors || '[]'); } catch { return []; } })();
                const sharedColors = pColors.filter(col => colors.includes(col));
                return (
                  <Link key={p.id} href={`/produto/${p.id}`} className="block group">
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-200">
                      <div className="relative aspect-square bg-slate-100">
                        {pImgs[0]
                          ? <img src={pImgs[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">{p.category?.icon ?? '📦'}</div>
                        }
                        {sharedColors.length > 0 && (
                          <div className="absolute bottom-1.5 left-1.5 flex gap-0.5">
                            {sharedColors.slice(0, 3).map(hex => (
                              <span key={hex} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs text-orange-500 font-medium mb-0.5">{p.category?.name}</p>
                        <p className="text-xs font-semibold line-clamp-2 text-slate-700 leading-tight">{p.title}</p>
                        <p className="text-sm font-black text-slate-900 mt-1.5">
                          {(p.isOffer && p.offerPrice ? p.offerPrice : p.price).toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
