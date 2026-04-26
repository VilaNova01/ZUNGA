'use client';
import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Locate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { nearestProvince, ANGOLA_PROVINCES } from '@/lib/location';

const PROVINCES = Object.keys(ANGOLA_PROVINCES);
const COOKIE = 'zunga_province';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
}

export default function LocationBar() {
  const router = useRouter();
  const [province, setProvince] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getCookie(COOKIE);
    if (saved) { setProvince(saved); return; }
    if (navigator.geolocation) {
      setDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const found = nearestProvince(pos.coords.latitude, pos.coords.longitude);
          setCookie(COOKIE, found);
          setProvince(found);
          setDetecting(false);
          router.refresh();
        },
        () => setDetecting(false),
        { timeout: 5000 },
      );
    }
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function choose(p: string) {
    setCookie(COOKIE, p);
    setProvince(p);
    setOpen(false);
    router.refresh();
  }

  function detectLocation() {
    setDetecting(true);
    setOpen(false);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const found = nearestProvince(pos.coords.latitude, pos.coords.longitude);
        choose(found);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000 },
    );
  }

  return (
    <div className="bg-white border-b border-slate-100 relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-sm">
        <MapPin size={14} className="text-orange-500 shrink-0" />
        <span className="text-slate-500 hidden sm:inline">A mostrar produtos perto de:</span>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 font-semibold text-slate-800 hover:text-orange-500 transition-colors"
          >
            {detecting ? 'A detectar...' : (province ?? 'Seleccionar localização')}
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="fixed left-auto mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] max-h-72 overflow-y-auto w-56"
              style={{ top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 'auto' }}
            >
              <button
                onClick={detectLocation}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-orange-500 font-medium hover:bg-orange-50 border-b border-slate-100 text-sm"
              >
                <Locate size={14} /> Detectar automaticamente
              </button>
              {PROVINCES.map(p => (
                <button
                  key={p}
                  onClick={() => choose(p)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${p === province ? 'font-semibold text-orange-500 bg-orange-50' : 'text-slate-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {province && (
          <span className="ml-auto text-xs text-slate-400 hidden sm:inline">
            Ordenado por proximidade
          </span>
        )}
      </div>
    </div>
  );
}
