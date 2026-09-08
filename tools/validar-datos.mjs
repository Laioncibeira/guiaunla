/**
 * Revisa que los JSON de datos sean consistentes antes de publicar.
 * Corre en CI: si algo no cierra, el build falla en vez de salir a producción
 * con un plan roto.
 *
 * Uso:  node tools/validar-datos.mjs
 */
import fs from 'node:fs';

const errores = [];
const avisos = [];
const leer = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const fallar = (msg) => errores.push(msg);
const avisar = (msg) => avisos.push(msg);

// ------------------------------------------------------------- carreras
const departamentos = leer('src/data/departamentos.json').departamentos;
const slugsDeclarados = departamentos.flatMap((d) => d.carreras);
const archivos = fs.readdirSync('src/data/carreras').filter((f) => f.endsWith('.json'));

for (const slug of slugsDeclarados)
  if (!archivos.includes(slug + '.json')) fallar(`falta el plan de ${slug}`);

for (const archivo of archivos) {
  const c = leer('src/data/carreras/' + archivo);
  const donde = c.slug;

  if (archivo !== c.slug + '.json') fallar(`${archivo}: el slug no coincide con el archivo`);
  if (!slugsDeclarados.includes(c.slug)) fallar(`${donde}: no figura en departamentos.json`);
  if (!c.materias?.length) fallar(`${donde}: no tiene materias`);
  if (!c.cotejado) avisar(`${donde}: sin cotejar contra la tabla publicada (node tools/cotejar-fuente.mjs)`);

  const codigos = new Set();
  for (const m of c.materias) {
    if (codigos.has(m.codigo)) fallar(`${donde}: el código ${m.codigo} está repetido`);
    codigos.add(m.codigo);
    if (!m.nombre?.trim()) fallar(`${donde}/${m.codigo}: sin nombre`);
    if (!(m.nivel >= 1 && m.nivel <= c.niveles))
      fallar(`${donde}/${m.codigo}: nivel ${m.nivel} fuera de 1..${c.niveles}`);
    if (m.correlativasNoResueltas?.length)
      avisar(`${donde}/${m.codigo}: correlativas sin resolver ${m.correlativasNoResueltas}`);
  }

  for (const m of c.materias) {
    for (const cor of m.correlativas) {
      if (!codigos.has(cor)) fallar(`${donde}/${m.codigo}: correlativa ${cor} no existe en el plan`);
      if (cor === m.codigo) fallar(`${donde}/${m.codigo}: es correlativa de sí misma`);
    }
  }

  // Un ciclo dejaría materias imposibles de cursar y rompería el grafo.
  const habilita = new Map(c.materias.map((m) => [m.codigo, []]));
  for (const m of c.materias) for (const cor of m.correlativas) habilita.get(cor)?.push(m.codigo);
  for (const m of c.materias) {
    const vistos = new Set();
    const pila = [...(habilita.get(m.codigo) ?? [])];
    while (pila.length) {
      const x = pila.pop();
      if (x === m.codigo) {
        fallar(`${donde}: hay un ciclo de correlatividades que pasa por ${m.codigo}`);
        break;
      }
      if (vistos.has(x)) continue;
      vistos.add(x);
      pila.push(...(habilita.get(x) ?? []));
    }
  }

  const niveles = new Set(c.materias.map((m) => m.nivel));
  for (let n = 1; n <= c.niveles; n++)
    if (!niveles.has(n)) avisar(`${donde}: el nivel ${n} quedó sin materias`);
}

// ------------------------------------------------------------ calendario
const cal = leer('src/data/calendario/2026.json');
const ids = new Set();
for (const e of cal.eventos) {
  if (ids.has(e.id)) fallar(`calendario: id repetido ${e.id}`);
  ids.add(e.id);
  const bien = (f) => /^\d{4}-\d{2}-\d{2}$/.test(f) && !Number.isNaN(Date.parse(f));
  if (!bien(e.desde) || !bien(e.hasta)) fallar(`calendario/${e.id}: fecha inválida`);
  if (e.hasta < e.desde) fallar(`calendario/${e.id}: termina antes de empezar`);
  if (!e.titulo?.trim()) fallar(`calendario/${e.id}: sin título`);
}

// ---------------------------------------------------------------- campus
const campus = leer('src/data/campus/edificios.json');
const [, , anchoMapa, altoMapa] = campus.viewBox.split(' ').map(Number);
const idsEd = new Set();
for (const e of campus.edificios) {
  if (idsEd.has(e.id)) fallar(`campus: id repetido ${e.id}`);
  idsEd.add(e.id);
  if (e.x < 0 || e.y < 0 || e.x + e.w > anchoMapa || e.y + e.h > altoMapa)
    fallar(`campus/${e.id}: se sale del plano`);
  for (const d of e.departamentos ?? [])
    if (!departamentos.some((x) => x.slug === d))
      fallar(`campus/${e.id}: departamento desconocido ${d}`);
}
for (const d of departamentos)
  if (d.edificio && !idsEd.has(d.edificio))
    fallar(`departamentos/${d.slug}: edificio desconocido ${d.edificio}`);

// ---------------------------------------------------------------- salida
for (const a of avisos) console.warn('aviso: ' + a);
if (errores.length) {
  for (const e of errores) console.error('error: ' + e);
  console.error(`\n${errores.length} problemas en los datos.`);
  process.exit(1);
}
console.log(
  `datos ok: ${archivos.length} carreras, ${cal.eventos.length} fechas, ${campus.edificios.length} edificios` +
    (avisos.length ? ` (${avisos.length} avisos)` : ''),
);
