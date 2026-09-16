/**
 * Los 24 planes leídos del disco, sólo para las pruebas: la app los carga de
 * a uno con `import()`, pero acá conviene recorrerlos todos.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Carrera } from './datos';

const carpeta = join(__dirname, '..', '..', 'data', 'carreras');

export const TODAS: readonly Carrera[] = readdirSync(carpeta)
  .filter((f) => f.endsWith('.json') && f !== 'indice.json')
  .sort()
  .map((f) => JSON.parse(readFileSync(join(carpeta, f), 'utf8')) as Carrera);

export const planDe = (slug: string): Carrera => {
  const c = TODAS.find((x) => x.slug === slug);
  if (!c) throw new Error('no hay plan ' + slug);
  return c;
};
