/**
 * Revisa que el build no traiga JavaScript escrito dentro del HTML.
 *
 * La CSP de firebase.json dice `script-src 'self'`: el navegador sólo ejecuta
 * scripts que vengan en archivos del sitio. Un `<script>` inline o un
 * atributo `onload="..."` se bloquean en producción sin que se note en
 * `npm start` (ahí no hay CSP). Ya pasó una vez: el `onload` que activaba la
 * hoja de estilos quedó bloqueado y se perdieron el tema claro y el diseño
 * de escritorio. Esto lo detecta antes de publicar.
 *
 * Uso:  node tools/revisar-csp.mjs   (después de npm run build)
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = 'dist/guiaunla/browser';
/** Tipos de <script> que el navegador no ejecuta: son datos. */
const SOLO_DATOS = /type\s*=\s*"application\/(?:json|ld\+json)"/i;

if (!fs.existsSync(RAIZ)) {
  console.error(`No existe ${RAIZ}: corré npm run build antes.`);
  process.exit(1);
}

const csp = JSON.parse(fs.readFileSync('firebase.json', 'utf8'))
  .hosting.headers.flatMap((h) => h.headers)
  .find((h) => h.key === 'Content-Security-Policy')?.value;
if (!csp || !/script-src 'self'(;|$)/.test(csp)) {
  console.error("firebase.json no tiene la CSP con script-src 'self' que este control supone.");
  process.exit(1);
}

const html = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? html(p) : p.endsWith('.html') ? [p] : [];
  });

const problemas = [];
const archivos = html(RAIZ);
for (const archivo of archivos) {
  const texto = fs.readFileSync(archivo, 'utf8');
  for (const m of texto.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, atributos, cuerpo] = m;
    if (/\bsrc\s*=/.test(atributos) || SOLO_DATOS.test(atributos) || !cuerpo.trim()) continue;
    problemas.push(`${archivo}: <script> inline (${cuerpo.trim().slice(0, 60)}…)`);
  }
  for (const m of texto.matchAll(/<[a-z][^>]*\s(on[a-z]+)\s*=\s*"([^"]*)"/gi))
    problemas.push(`${archivo}: atributo ${m[1]}="${m[2].slice(0, 40)}"`);
}

if (problemas.length) {
  console.error(`La CSP bloquearía ${problemas.length} script(s) inline:`);
  for (const p of problemas.slice(0, 20)) console.error('  ' + p);
  process.exit(1);
}
console.log(`csp ok: ${archivos.length} páginas sin scripts inline`);
