/**
 * Extrae el plan de estudios de una carrera desde unla.edu.ar y lo emite como JSON.
 *
 * Uso:  node tools/extraer-plan.mjs [slug ...]
 * El HTML se cachea en tools/cache/ para no golpear el sitio en cada corrida.
 *
 * La web publica los planes como tabla HTML, pero con DOS formatos distintos:
 *   A) Audiovisión / Diseño y Comunicación Visual / Diseño Industrial
 *      Código | Unidad curricular | Formato | Modalidad | Hs semanales | Hs totales | Correlatividad
 *      Las filas de una sola celda son secciones ("Primer Año", "Asignaturas Mención ...").
 *      El nivel que da la fuente es el AÑO; no dice cuatrimestre.
 *   B) Traductorado
 *      Código | Asignatura | Dedic. | Hs semanal | Hs total | Correlat. | Modalidad
 *      Las secciones son CUATRIMESTRES y las materias anuales aparecen repetidas
 *      en los dos cuatrimestres del año: se deduplican por código.
 */
import fs from 'node:fs';
import path from 'node:path';

const CACHE = 'tools/cache';
const BASE = 'https://www.unla.edu.ar/carreras/grado/licenciaturas';

const limpiar = (h) =>
  h
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const ORDINALES = {
  primer: 1,
  segundo: 2,
  tercer: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6,
  septimo: 7,
  octavo: 8,
};

const sinAcentos = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** "Tercer Año" -> {nivel:3,tipo:'anio'} ; "Quinto cuatrimestre" -> {nivel:5,tipo:'cuatrimestre'} */
function nivelDeSeccion(texto) {
  const t = sinAcentos(texto);
  const m = t.match(
    /\b(primer|segundo|tercer|cuarto|quinto|sexto|septimo|octavo)\b\s*(ano|cuatrimestre)/,
  );
  return m ? { nivel: ORDINALES[m[1]], tipo: m[2] === 'ano' ? 'anio' : 'cuatrimestre' } : null;
}

async function html(slug) {
  const f = path.join(CACHE, slug + '.html');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const r = await fetch(BASE + '/' + slug, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(slug + ': HTTP ' + r.status);
  const t = await r.text();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(f, t);
  return t;
}

const tablas = (doc) => [...doc.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);

const filas = (tabla) =>
  [...tabla.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) =>
    [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => limpiar(c[1])),
  );

/** Separa "01 - 02 - 04", "10 - 11 -12", "13305 / 13306" en códigos sueltos. */
function partirCorrelativas(celda, ancho) {
  if (!celda || celda === '-') return [];
  return celda
    .split(/[\s/,;-]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .map((s) => (ancho === 2 ? s.padStart(2, '0') : s));
}

export function parsearPlan(doc, cfg = {}) {
  const tabla = tablas(doc)[cfg.tablaIndice ?? 0];
  if (!tabla) throw new Error('no se encontró la tabla del plan');
  const todas = filas(tabla);
  const encabezado = todas[0] ?? [];
  const varianteB = sinAcentos(encabezado.join(' ')).includes('dedic');

  const materias = [];
  const vistos = new Set();
  let nivel = 1;
  let tipoNivel = varianteB ? 'cuatrimestre' : 'anio';
  let mencion = null;
  let cicloOrientado = false;

  for (const fila of todas.slice(1)) {
    const conTexto = fila.filter((c) => c !== '');

    // Fila de sección: una sola celda con texto.
    if (conTexto.length <= 1) {
      const txt = conTexto[0] ?? '';
      if (!txt) continue;
      const n = nivelDeSeccion(txt);
      if (n) {
        nivel = n.nivel;
        tipoNivel = n.tipo;
        mencion = null;
        continue;
      }
      const s = sinAcentos(txt);
      if (s.includes('mencion')) mencion = txt.replace(/^Asignaturas\s+/i, '').trim();
      else if (s.includes('ciclo de formacion orientada')) cicloOrientado = true;
      else if (
        s.includes('asignaturas comunes') ||
        s.includes('otros requisitos') ||
        s.includes('nucleo optativo')
      )
        mencion = null;
      continue;
    }

    // Las dos variantes ordenan las columnas distinto:
    //   A: código, nombre, formato, modalidad, hs semanales, hs totales, correlativas
    //   B: código, nombre, dedicación, hs semanales, hs totales, correlativas, régimen
    const [codigo, nombre] = fila;
    const formato = varianteB ? '' : fila[2];
    const dedicCelda = varianteB ? fila[2] : fila[3];
    const hSem = varianteB ? fila[3] : fila[4];
    const hTot = varianteB ? fila[4] : fila[5];
    const corr = varianteB ? fila[5] : fila[6];
    const regimen = varianteB ? fila[6] : '';

    const nn = sinAcentos(nombre ?? '');
    if (!nombre || nn === 'unidad curricular' || nn === 'asignatura') continue;

    const dedicacion = sinAcentos(dedicCelda ?? '').startsWith('anual') ? 'anual' : 'cuatrimestral';

    const cod = (codigo ?? '').trim();
    const clave = cod || 's-' + sinAcentos(nombre).slice(0, 30);
    if (vistos.has(clave)) continue; // anuales repetidas en los dos cuatrimestres
    vistos.add(clave);

    const m = {
      codigo: cod,
      _sinCodigo: !cod,
      nombre: norm(nombre),
      dedicacion,
      nivel,
      _correl: corr ?? '',
    };
    if (norm(formato ?? '')) m.formato = norm(formato);
    if (Number(hSem)) m.horasSemanales = Number(hSem);
    if (Number(hTot)) m.horasTotales = Number(hTot);
    if (norm(regimen ?? '')) m.regimen = norm(regimen);
    if (mencion) m.mencion = mencion;
    if (cicloOrientado) m.cicloOrientado = true;
    if (/^optativa/i.test(m.nombre)) m.optativa = true;
    materias.push(m);
  }

  // Códigos sintéticos para las filas sin código oficial (los seminarios del Traductorado).
  let sinCod = 0;
  for (const m of materias) {
    if (m._sinCodigo) {
      m.codigo = 'S' + String(++sinCod).padStart(2, '0');
      m.sinCodigoOficial = true;
    }
    delete m._sinCodigo;
  }

  // Los códigos de 2 dígitos vienen a veces sin el cero ("3" por "03"): se emparejan por ancho.
  const anchos = new Set(materias.filter((m) => /^\d+$/.test(m.codigo)).map((m) => m.codigo.length));
  const ancho = anchos.size === 1 ? [...anchos][0] : 0;
  const existentes = new Set(materias.map((m) => m.codigo));
  for (const m of materias) {
    const todos = partirCorrelativas(m._correl, ancho);
    m.correlativas = todos.filter((c) => existentes.has(c));
    const perdidas = todos.filter((c) => !existentes.has(c));
    if (perdidas.length) m.correlativasNoResueltas = perdidas;
    delete m._correl;
  }

  return { materias, tipoNivel };
}

export const CARRERAS = {
  audiovision: {
    nombre: 'Licenciatura en Audiovisión',
    nombreCorto: 'Audiovisión',
    titulo: 'Licenciado/a en Audiovisión',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Audiovisión', hastaNivel: 3 },
    duracionAnios: 5,
    horasTotales: 2880,
    menciones: ['Sonido y Grabación', 'Postproducción de Imagen'],
  },
  'diseno-y-comunicacion-visual': {
    nombre: 'Licenciatura en Diseño y Comunicación Visual',
    nombreCorto: 'Diseño y Comunicación Visual',
    titulo: 'Licenciado/a en Diseño y Comunicación Visual',
    duracionAnios: 5,
  },
  'diseno-industrial': {
    nombre: 'Licenciatura en Diseño Industrial',
    nombreCorto: 'Diseño Industrial',
    titulo: 'Licenciado/a en Diseño Industrial',
    tituloIntermedio: { nombre: 'Técnico/a en Diseño Industrial', hastaNivel: 3 },
    duracionAnios: 5,
    horasTotales: 2912,
    orientaciones: [
      'Maquinaria, equipos y vehículos',
      'Textil e indumentaria',
      'Metales básicos y productos de metal',
    ],
    nota: 'La carrera tiene tres orientaciones. Comparten códigos, correlativas y carga horaria; solo cambia el nombre de los talleres y de Tecnología, Materiales y Procesos. Acá se muestra el plan común.',
    limpiarNombre: true,
  },
  'traductorado-publico-en-idioma-ingles': {
    nombre: 'Traductorado Público en Idioma Inglés',
    nombreCorto: 'Traductorado en Inglés',
    titulo: 'Traductor/a Público/a en Idioma Inglés',
    tituloIntermedio: {
      nombre: 'Traductor/a Técnico/a Universitario/a en Idioma Inglés',
      hastaNivel: 6,
    },
    duracionAnios: 4,
  },
};

async function main() {
  const pedidos = process.argv.slice(2);
  const slugs = pedidos.length ? pedidos : Object.keys(CARRERAS);
  for (const slug of slugs) {
    const cfg = CARRERAS[slug];
    if (!cfg) throw new Error('carrera desconocida: ' + slug);
    const { materias, tipoNivel } = parsearPlan(await html(slug), cfg);
    if (cfg.limpiarNombre) {
      for (const m of materias)
        m.nombre = m.nombre.replace(/\s*\(Orientaci[oó]n[^)]*\)\s*$/i, '').trim();
    }
    const carrera = {
      slug,
      nombre: cfg.nombre,
      nombreCorto: cfg.nombreCorto,
      departamento: 'humanidades-y-artes',
      titulo: cfg.titulo,
      ...(cfg.tituloIntermedio ? { tituloIntermedio: cfg.tituloIntermedio } : {}),
      duracionAnios: cfg.duracionAnios,
      ...(cfg.horasTotales ? { horasTotales: cfg.horasTotales } : {}),
      ...(cfg.menciones ? { menciones: cfg.menciones } : {}),
      ...(cfg.orientaciones ? { orientaciones: cfg.orientaciones } : {}),
      ...(cfg.nota ? { nota: cfg.nota } : {}),
      tipoNivel,
      niveles: Math.max(...materias.map((m) => m.nivel)),
      fuenteUrl: BASE + '/' + slug,
      fuenteFecha: new Date().toISOString().slice(0, 10),
      // Lo pone en true tools/cotejar-fuente.mjs cuando el JSON coincide con la tabla.
      cotejado: false,
      materias,
    };
    const out = 'src/data/carreras/' + slug + '.json';
    fs.writeFileSync(out, JSON.stringify(carrera, null, 2) + '\n');
    const conCorr = materias.filter((m) => m.correlativas.length).length;
    const noRes = materias.filter((m) => m.correlativasNoResueltas).length;
    console.log(
      out +
        ': ' +
        materias.length +
        ' materias, ' +
        conCorr +
        ' con correlativas, ' +
        noRes +
        ' sin resolver, ' +
        carrera.niveles +
        ' niveles (' +
        tipoNivel +
        ')',
    );
  }
}

if (process.argv[1] && process.argv[1].endsWith('extraer-plan.mjs')) main();
