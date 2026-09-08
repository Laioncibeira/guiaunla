/**
 * Coteja cada plan JSON contra la tabla original de unla.edu.ar, leyéndola por
 * otro camino que el extractor: si los dos coinciden, el JSON no perdió filas
 * ni correlativas.
 *
 * Uso:  node tools/cotejar-fuente.mjs [slug ...]
 * Necesita el HTML cacheado en tools/cache/ (lo baja tools/extraer-plan.mjs).
 */
import fs from 'node:fs';
import { CARRERAS } from './extraer-plan.mjs';

const texto = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const sinAcentos = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

/**
 * Filas de materia de la tabla original, con la celda de correlativas ya
 * ubicada: las dos variantes de tabla la ponen en columnas distintas.
 */
function filasCrudas(html) {
  const tabla = html.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? '';
  const filas = [...tabla.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) =>
    [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => texto(c[1])),
  );
  const encabezado = sinAcentos((filas[0] ?? []).join(' '));
  const col = encabezado.includes('dedic') ? 5 : 6;
  return filas
    .filter((f) => f.length >= 6 && /^\d{2,5}$/.test(f[0]))
    .map((f) => ({ codigo: f[0], correlativas: f[col] ?? '' }));
}

let problemas = 0;
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CARRERAS);

for (const slug of slugs) {
  const ruta = `tools/cache/${slug}.html`;
  if (!fs.existsSync(ruta)) {
    console.warn(`${slug}: sin HTML cacheado, no se puede cotejar`);
    continue;
  }
  const crudas = filasCrudas(fs.readFileSync(ruta, 'utf8'));
  const json = JSON.parse(fs.readFileSync(`src/data/carreras/${slug}.json`, 'utf8'));

  const codigosFuente = new Set(crudas.map((f) => f.codigo));
  const codigosJson = new Set(json.materias.map((m) => m.codigo).filter((c) => /^\d+$/.test(c)));
  const faltan = [...codigosFuente].filter((c) => !codigosJson.has(c));
  const sobran = [...codigosJson].filter((c) => !codigosFuente.has(c));

  // La fuente marca "-" cuando no hay correlativas; cualquier dígito es una.
  const conCorrFuente = new Set(
    crudas.filter((f) => /\d/.test(f.correlativas)).map((f) => f.codigo),
  );
  const conCorrJson = new Set(
    json.materias.filter((m) => m.correlativas.length).map((m) => m.codigo),
  );
  const perdidas = [...conCorrFuente].filter((c) => !conCorrJson.has(c));
  const inventadas = [...conCorrJson].filter((c) => !conCorrFuente.has(c) && codigosFuente.has(c));

  const ok = !faltan.length && !sobran.length && !perdidas.length && !inventadas.length;
  if (!ok) problemas++;
  // El resultado queda escrito en el propio plan, para que la app pueda decirlo.
  if (json.cotejado !== ok) {
    json.cotejado = ok;
    fs.writeFileSync(`src/data/carreras/${slug}.json`, JSON.stringify(json, null, 2) + '\n');
  }
  console.log(
    `${ok ? 'ok  ' : 'REVI'} ${slug}: ${codigosJson.size}/${codigosFuente.size} códigos, ` +
      `${conCorrJson.size}/${conCorrFuente.size} con correlativas` +
      (faltan.length ? ` · faltan ${faltan.join(',')}` : '') +
      (sobran.length ? ` · sobran ${sobran.join(',')}` : '') +
      (perdidas.length ? ` · perdieron correlativas ${perdidas.join(',')}` : '') +
      (inventadas.length ? ` · correlativas de más ${inventadas.join(',')}` : ''),
  );
}

process.exit(problemas ? 1 : 0);
