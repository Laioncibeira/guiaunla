/**
 * Coteja cada plan JSON contra la tabla original de unla.edu.ar, leyéndola por
 * otro camino que el extractor: si los dos coinciden, el JSON no perdió filas
 * ni correlativas. Las carreras sin tabla (PDF o lista) se saltan con aviso.
 *
 * Uso:  node tools/cotejar-fuente.mjs [slug ...]
 * Necesita el HTML cacheado en tools/cache/ (lo baja tools/extraer-plan.mjs).
 * Cuando el cotejo pasa, deja `cotejado: true` en el JSON.
 */
import fs from 'node:fs';
import { CARRERAS, columnasDe } from './extraer-plan.mjs';

const texto = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const sinAcentos = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

/** Filas de materia de la tabla original con su celda de correlativas. */
function filasCrudas(html, cfg) {
  const tabla = html.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? '';
  const filas = [...tabla.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) =>
    [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => texto(c[1])),
  );
  const cols = cfg.columnas ?? columnasDe(filas[0] ?? []);
  const ancho = (filas[0] ?? []).length;
  return filas
    .filter((f) => f.length >= 4 && /^\d{1,5}$/.test(f[0]))
    .map((f) => {
      // Misma corrección que el extractor: una celda de más corre las columnas.
      const g = !cfg.columnas && f.length === ancho + 1 ? [f[0], f[1] + ' ' + f[2], ...f.slice(3)] : f;
      return { codigo: f[0], correlativas: g[cols.correl] ?? '' };
    });
}

let problemas = 0;
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CARRERAS);

for (const slug of slugs) {
  const cfg = CARRERAS[slug];
  const rutaJson = `src/data/carreras/${slug}.json`;
  if (!cfg || !fs.existsSync(rutaJson)) {
    console.log(`----  ${slug}: sin config o sin JSON`);
    continue;
  }
  const json = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
  if (cfg.parser) {
    console.log(`----  ${slug}: plan sin tabla (${cfg.parser}); no se coteja, queda marcado`);
    continue;
  }
  const rutaHtml = `tools/cache/${slug}.html`;
  if (!fs.existsSync(rutaHtml)) {
    console.log(`----  ${slug}: sin HTML cacheado`);
    continue;
  }
  // Los códigos se comparan normalizados a dos dígitos cuando el plan es de dos.
  const anchoMax = Math.max(0, ...json.materias.map((m) => m.codigo).filter((c) => /^\d+$/.test(c)).map((c) => c.length));
  const pad = (c) => (anchoMax <= 2 ? c.padStart(2, '0') : c);
  // Algunas tablas repiten la numeración en un bloque de electivas al final:
  // como el extractor, se queda con la primera aparición de cada código.
  const vistos = new Set();
  const crudas = filasCrudas(fs.readFileSync(rutaHtml, 'utf8'), cfg).filter((f) => {
    const c = pad(f.codigo);
    if (vistos.has(c)) return false;
    vistos.add(c);
    return true;
  });
  const codigosFuente = new Set(crudas.map((f) => pad(f.codigo)));
  const codigosJson = new Set(json.materias.map((m) => m.codigo).filter((c) => /^\d+$/.test(c)));
  const faltan = [...codigosFuente].filter((c) => !codigosJson.has(c));
  const sobran = [...codigosJson].filter((c) => !codigosFuente.has(c));

  // Cuenta como correlativa lo que trae algún código (dígitos). Lo demás son
  // notas al pie "(*)", nombres de materias o condiciones en texto, que el
  // extractor resuelve o descarta por su cuenta.
  const nombres = json.materias.map((m) => sinAcentos(m.nombre));
  const porNombre = (celda) => {
    const b = sinAcentos(celda).replace(/[:\s]+$/, '');
    return !!b && nombres.some((n) => n === b || n.endsWith('· ' + b) || n.endsWith(' ' + b));
  };
  const conCorrFuente = new Set(
    crudas
      .filter((f) => {
        const c = f.correlativas.replace(/\([^)]*\)/g, '').trim();
        return /\d/.test(c) || (c && c !== '-' && porNombre(c));
      })
      .map((f) => pad(f.codigo)),
  );
  const conCorrJson = new Set(
    json.materias.filter((m) => m.correlativas.length || m.correlativasNoResueltas?.length).map((m) => m.codigo),
  );
  const perdidas = [...conCorrFuente].filter((c) => !conCorrJson.has(c));
  const inventadas = [...conCorrJson].filter((c) => !conCorrFuente.has(c) && codigosFuente.has(c));

  const ok = !faltan.length && !sobran.length && !perdidas.length && !inventadas.length;
  if (!ok) problemas++;
  if (json.cotejado !== ok) {
    json.cotejado = ok;
    fs.writeFileSync(rutaJson, JSON.stringify(json, null, 2) + '\n');
  }
  console.log(
    `${ok ? 'ok  ' : 'REVI'}  ${slug.padEnd(40)} ${codigosJson.size}/${codigosFuente.size} códigos, ${conCorrJson.size}/${conCorrFuente.size} con correlativas` +
      (faltan.length ? ` · faltan ${faltan.join(',')}` : '') +
      (sobran.length ? ` · sobran ${sobran.join(',')}` : '') +
      (perdidas.length ? ` · perdieron correlativas ${perdidas.join(',')}` : '') +
      (inventadas.length ? ` · correlativas de más ${inventadas.join(',')}` : ''),
  );
}

process.exit(problemas ? 1 : 0);
