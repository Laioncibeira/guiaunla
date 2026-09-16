/** Funciones puras del contador de visitas, sin Angular: se prueban solas. */

/**
 * Clave de pantalla para el contador: '/' → 'inicio',
 * '/carreras/audiovision' → 'carreras-audiovision'. Sin parámetros ni
 * mayúsculas ni acentos, y acotada a lo que aceptan las reglas.
 */
export function claveDeRuta(url: string): string | null {
  const limpia = url.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  if (limpia === 'admin' || limpia.startsWith('admin/')) return null;
  const clave = (limpia || 'inicio')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return clave || 'inicio';
}

/** 'yyyy-mm-dd' en UTC, igual que lo calculan las reglas. */
export const diaUtc = (d = new Date()) => d.toISOString().slice(0, 10);

