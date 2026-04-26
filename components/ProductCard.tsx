'use client';
import Link from 'next/link';
import { Heart, Eye, MapPin, Star, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ANGOLA_PROVINCES } from '@/lib/location';

function getUserProvince(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )zunga_province=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Product {
  id: string;
  title: string;
  price: number;
  offerPrice?: number | null;
  isOffer: boolean;
  images: string;
  colors: string;
  sizes: string;
  condition: string;
  views: number;
  featured: boolean;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hasDelivery?: boolean;
  seller: { name: string; isPremium: boolean };
  category: { name: string; icon: string } | null;
  _count: { likes: number };
}

export default function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(product._count.likes);
  const [liked, setLiked] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    const up = getUserProvince();
    if (!up) return;
    if (product.province === up) setIsNearby(true);

    // Calcular distância via coordenadas do produto ou da província
    const userCoords = ANGOLA_PROVINCES[up];
    if (!userCoords) return;

    if (product.latitude && product.longitude) {
      setDistanceKm(Math.round(calcDistanceKm(userCoords.lat, userCoords.lng, product.latitude, product.longitude)));
    } else if (product.province && ANGOLA_PROVINCES[product.province]) {
      const pc = ANGOLA_PROVINCES[product.province];
      const d = Math.round(calcDistanceKm(userCoords.lat, userCoords.lng, pc.lat, pc.lng));
      if (d < 600) setDistanceKm(d);
    }
  }, [product.province, product.latitude, product.longitude]);

  const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
  const colors: string[] = (() => { try { return JSON.parse(product.colors || '[]'); } catch { return []; } })();
  const sizes: string[] = (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();
  const thumb = images[0] || null;

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!session) { router.push('/login'); return; }
    const res = await fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) });
    const data = await res.json();
    setLiked(data.liked);
    setLikes(l => data.liked ? l + 1 : l - 1);
  }

  return (
    <Link href={`/produto/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100">
        {/* Image */}
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          {thumb ? (
            <img src={thumb} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">{product.category?.icon ?? '📦'}</div>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star size={10} /> Destaque
            </span>
          )}
          {isNearby && !product.featured && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <MapPin size={10} /> Próximo
            </span>
          )}
          {product.hasDelivery && (
            <span className="absolute bottom-9 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Truck size={10} /> Entrega
            </span>
          )}
          {distanceKm !== null && (
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              ~{distanceKm} km
            </span>
          )}
          {product.isOffer && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Oferta</span>
          )}
          <button onClick={handleLike} className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:scale-110 transition-transform">
            <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-orange-500 font-medium mb-0.5">{product.category?.name ?? ''}</p>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1">{product.title}</h3>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-base font-black text-slate-900">
              {(product.isOffer && product.offerPrice ? product.offerPrice : product.price).toLocaleString('pt-AO')} Kz
            </span>
            {product.isOffer && product.offerPrice && (
              <span className="text-xs text-slate-400 line-through">{product.price.toLocaleString('pt-AO')} Kz</span>
            )}
          </div>

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {colors.slice(0, 6).map(hex => (
                <span
                  key={hex}
                  className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-xs text-slate-400">+{colors.length - 6}</span>
              )}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {sizes.slice(0, 5).map(size => (
                <span key={size} className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 leading-none">
                  {size}
                </span>
              ))}
              {sizes.length > 5 && (
                <span className="text-xs text-slate-400">+{sizes.length - 5}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {product.city || product.province || 'Angola'}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5"><Eye size={11} /> {product.views}</span>
              <span className="flex items-center gap-0.5"><Heart size={11} /> {likes}</span>
            </div>
          </div>

          {product.seller.isPremium && (
            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1">
              <Star size={10} className="text-orange-400 fill-orange-400" />
              <span className="text-xs text-orange-500 font-medium">Vendedor Premium</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
