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

// -------------------------------------------------------------- horarios
const DIAS_OK = new Set(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
const TURNOS_OK = new Set(['manana', 'tarde', 'noche']);
let totalClases = 0;
let fueraDePlan = 0;

for (const archivo of fs.existsSync('src/data/horarios') ? fs.readdirSync('src/data/horarios') : []) {
  const h = leer('src/data/horarios/' + archivo);
  const donde = 'horarios/' + h.carrera;
  if (archivo !== h.carrera + '.json') fallar(`${archivo}: el nombre no coincide con la carrera`);
  if (!slugsDeclarados.includes(h.carrera)) fallar(`${donde}: carrera desconocida`);

  const plan = leer('src/data/carreras/' + h.carrera + '.json');
  const codigos = new Set(plan.materias.map((m) => m.codigo));

  for (const c of h.clases) {
    totalClases++;
    if (!DIAS_OK.has(c.dia)) fallar(`${donde}: día inválido ${c.dia}`);
    if (!TURNOS_OK.has(c.turno)) fallar(`${donde}: turno inválido ${c.turno}`);
    if (!c.materiaTexto?.trim()) fallar(`${donde}: una clase sin materia`);
    if (c.materiaCodigo && !codigos.has(c.materiaCodigo))
      fallar(`${donde}: la clase de ${c.materiaTexto} apunta al código ${c.materiaCodigo}, que no está en el plan`);
    if (!c.materiaCodigo) fueraDePlan++;
    if (!c.ubicaciones?.length) fallar(`${donde}: ${c.materiaTexto} sin lugar`);
    for (const u of c.ubicaciones) {
      if (u.virtual) continue;
      if (u.edificio && !idsEd.has(u.edificio))
        fallar(`${donde}: edificio desconocido ${u.edificio}`);
      if (!u.edificio) avisar(`${donde}: ${u.aula ?? u.textoOriginal} sin edificio asignado`);
    }
  }
}

// ---------------------------------------------------------------- salida
for (const a of avisos) console.warn('aviso: ' + a);
if (errores.length) {
  for (const e of errores) console.error('error: ' + e);
  console.error(`\n${errores.length} problemas en los datos.`);
  process.exit(1);
}
console.log(
  `datos ok: ${archivos.length} carreras, ${cal.eventos.length} fechas, ${campus.edificios.length} edificios, ` +
    `${totalClases} clases (${fueraDePlan} fuera del plan)` +
    (avisos.length ? ` (${avisos.length} avisos)` : ''),
);
