export const ANGOLA_PROVINCES: Record<string, { lat: number; lng: number }> = {
  'Luanda':         { lat: -8.8368,  lng: 13.2343 },
  'Benguela':       { lat: -12.5763, lng: 13.4055 },
  'Huambo':         { lat: -12.7761, lng: 15.7395 },
  'Bié':            { lat: -12.3590, lng: 17.3490 },
  'Malanje':        { lat: -9.5404,  lng: 16.3411 },
  'Lunda Norte':    { lat: -8.0000,  lng: 20.4000 },
  'Lunda Sul':      { lat: -10.0000, lng: 20.4000 },
  'Moxico':         { lat: -11.8667, lng: 19.9167 },
  'Cuando Cubango': { lat: -14.6667, lng: 19.0000 },
  'Cunene':         { lat: -17.0000, lng: 15.7667 },
  'Namibe':         { lat: -15.2000, lng: 12.1500 },
  'Huíla':          { lat: -14.9186, lng: 13.4917 },
  'Cabinda':        { lat: -5.5500,  lng: 12.2000 },
  'Zaire':          { lat: -6.1000,  lng: 13.5000 },
  'Uíge':           { lat: -7.6079,  lng: 15.0624 },
  'Cuanza Norte':   { lat: -9.3091,  lng: 14.9534 },
  'Cuanza Sul':     { lat: -10.8664, lng: 14.6694 },
  'Bengo':          { lat: -9.1000,  lng: 13.7333 },
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestProvince(lat: number, lng: number): string {
  let nearest = 'Luanda';
  let minDist = Infinity;
  for (const [name, coords] of Object.entries(ANGOLA_PROVINCES)) {
    const d = haversineKm(lat, lng, coords.lat, coords.lng);
    if (d < minDist) { minDist = d; nearest = name; }
  }
  return nearest;
}

export function proximityScore(
  productProvince: string | null,
  productCity: string | null,
  userProvince: string,
  userCity?: string | null,
): number {
  if (!productProvince) return 0;
  if (productCity && userCity && productCity.toLowerCase() === userCity.toLowerCase()) return 20;
  if (productProvince === userProvince) return 10;
  const userCoords = ANGOLA_PROVINCES[userProvince];
  const productCoords = ANGOLA_PROVINCES[productProvince];
  if (!userCoords || !productCoords) return 0;
  const dist = haversineKm(userCoords.lat, userCoords.lng, productCoords.lat, productCoords.lng);
  return Math.max(0, 8 - Math.floor(dist / 150));
}

export function sortByProximity<T extends { province?: string | null; city?: string | null }>(
  items: T[],
  userProvince: string,
  userCity?: string | null,
): T[] {
  return [...items].sort((a, b) =>
    proximityScore(b.province ?? null, b.city ?? null, userProvince, userCity) -
    proximityScore(a.province ?? null, a.city ?? null, userProvince, userCity)
  );
}
