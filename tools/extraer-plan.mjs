/**
 * Extrae el plan de estudios de cada carrera desde unla.edu.ar y lo deja como
 * JSON en src/data/carreras/, más el índice liviano que usa la app.
 *
 * Uso:  node tools/extraer-plan.mjs [slug ...]
 * El HTML se cachea en tools/cache/ para no golpear el sitio en cada corrida
 * (la web corta con 429 si se le pide rápido).
 *
 * La universidad publica los planes de seis formas distintas, y todas con
 * tabla HTML salvo dos. Las columnas se reconocen por el NOMBRE del
 * encabezado, no por su posición, así una tabla nueva casi siempre entra sola:
 *   - "Código" | "Unidad curricular / Asignatura / Materia" | "Formato"
 *   - "Modalidad" es la dedicación (anual/cuatrimestral)... salvo en el
 *     Traductorado, donde "Dedic." es la dedicación y "Modalidad" el régimen.
 *   - "Horas semanales / Carga horaria semanal", "Horas totales / ... total"
 *   - "Correlatividad(es) / Correlativa / Correlatividad para cursar"
 *   - "Correlatividad para rendir final" (Nutrición) va aparte.
 * Ingeniería Ferroviaria tiene encabezado de dos filas: se le fija el mapa.
 * Trabajo Social publica el plan en PDF y Tecnologías Ferroviarias como lista:
 * cada una tiene su parser chico abajo.
 *
 * Las filas de una sola celda son secciones: "Primer Año", "Segundo
 * cuatrimestre", "1° Año", "Cuatrimestre 1", "Asignaturas Mención ...".
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CACHE = 'tools/cache';
const SALIDA = 'src/data/carreras';
const BASE = 'https://www.unla.edu.ar/carreras/';

// ----------------------------------------------------------------- texto
const limpiar = (h) =>
  h
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const sinAcentos = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const ORDINALES = {
  primer: 1, primero: 1, segundo: 2, tercer: 3, tercero: 3, cuarto: 4, quinto: 5,
  sexto: 6, septimo: 7, octavo: 8, noveno: 9, decimo: 10,
};

/**
 * Qué sección abre una fila de una sola celda, o null.
 *   "Primer Año" / "1° Año" / "PRIMER AÑO — 672 horas" -> { anio: 1 }
 *   "Segundo cuatrimestre" / "2° Cuatrimestre" / "Cuatrimestre 2" -> { cuatrimestre: 2 }
 *   "1° - 2° cuatrimestres" -> { cuatrimestre: 1, abarcaAnio: true }
 */
export function seccionDe(texto) {
  const t = sinAcentos(texto);
  const num = (s) => (ORDINALES[s] ?? Number(s.replace(/\D/g, '')) ?? null) || null;
  let m = t.match(/^\s*(primer|primero|segundo|tercer|tercero|cuarto|quinto|sexto|septimo|octavo|noveno|decimo|\d+°?)\s*(ano|año|anio)\b/);
  if (m) return { anio: num(m[1]) };
  m = t.match(/^\s*(\d+)°?\s*-\s*(\d+)°?\s*cuatrimestres?/);
  if (m) return { cuatrimestre: Number(m[1]), abarcaAnio: true };
  m = t.match(/^\s*(primer|primero|segundo|tercer|tercero|cuarto|quinto|sexto|septimo|octavo|noveno|decimo|\d+°?)\s*cuatrimestre/);
  if (m) return { cuatrimestre: num(m[1]) };
  m = t.match(/^\s*cuatrimestre\s*(\d+)/);
  if (m) return { cuatrimestre: Number(m[1]) };
  return null;
}

/** Índice de cada columna según el texto de su encabezado. */
export function columnasDe(encabezado) {
  const n = encabezado.map(sinAcentos);
  const busca = (re) => n.findIndex((h) => re.test(h));
  const hayDedic = n.some((h) => /dedic/.test(h));
  const cols = {
    codigo: busca(/^codigo$/),
    nombre: busca(/unidad curricular|asignatura|^materia$/),
    formato: busca(/^formato/),
    dedicacion: hayDedic ? busca(/dedic/) : busca(/^modalidad$|regimen de cursada/),
    regimen: hayDedic ? busca(/^modalidad$/) : busca(/^condicion/),
    hSem: busca(/semanal/),
    hTot: busca(/total/),
    correl: busca(/correlatividad para cursar|^correlativ|^correlat\./),
    correlRendir: busca(/rendir/),
    area: busca(/^area$/),
  };
  return cols;
}

/** "01 - 02", "13305 / 13306", "9; 22", "04 (Regular)" -> ["01","02"] ... */
export function partirCorrelativas(celda) {
  if (!celda || celda.trim() === '-' || celda.trim() === '') return [];
  return celda
    .replace(/\([^)]*\)/g, ' ') // (Regular), (Aprobada con final)
    .replace(/m[oó]dulo\s+\d+\s+de\s+\w+/gi, ' ') // "Módulo 15 de Informática"
    .split(/[\s/,;–-]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
}

const fila = (tr) => [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => limpiar(c[1]));
const filasDe = (tabla) => [...tabla.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => fila(r[0]));
const tablasDe = (doc) => [...doc.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);

// --------------------------------------------------------- tabla html
export function parsearTabla(doc, cfg = {}) {
  const tabla = tablasDe(doc)[cfg.tablaIndice ?? 0];
  if (!tabla) throw new Error('no se encontró la tabla del plan');
  const todas = filasDe(tabla);
  const cols = cfg.columnas ?? columnasDe(todas[0] ?? []);
  if (cols.codigo < 0 || cols.nombre < 0) throw new Error('encabezado sin código o nombre');

  const materias = [];
  const vistos = new Set();
  let anio = 0; // 0 = todavía no apareció ninguna sección de año
  let cuatLocal = 0;
  let huboAnio = false;
  let mencion = null;
  let cicloOrientado = false;

  const anchoEncabezado = (todas[0] ?? []).length;
  for (let f of todas.slice(1)) {
    // "Idioma extranjero I | Inglés I | Cuatrimestral | ..." trae una celda de
    // más con el idioma: se pega al nombre para que las columnas no corran.
    if (!cfg.columnas && anchoEncabezado && f.length === anchoEncabezado + 1 && f[1] && f[2]) {
      f = [f[0], `${f[1].replace(/:$/, '')} · ${f[2]}`, ...f.slice(3)];
    }
    const conTexto = f.filter((c) => c !== '');
    if (conTexto.length <= 1) {
      const txt = conTexto[0] ?? '';
      if (!txt) continue;
      const sec = seccionDe(txt);
      if (sec?.anio) {
        anio = sec.anio;
        huboAnio = true;
        cuatLocal = 0;
        mencion = null;
        continue;
      }
      if (sec?.cuatrimestre) {
        cuatLocal = sec.cuatrimestre;
        continue;
      }
      const s = sinAcentos(txt);
      if (s.includes('mencion')) mencion = txt.replace(/^Asignaturas\s+/i, '').trim();
      else if (s.includes('ciclo de formacion orientada')) cicloOrientado = true;
      else if (s.includes('asignaturas comunes') || s.includes('otros requisitos') || s.includes('nucleo optativo'))
        mencion = null;
      continue;
    }

    const codigo = (f[cols.codigo] ?? '').trim();
    const nombre = norm(f[cols.nombre] ?? '');
    if (!nombre) continue;
    const nn = sinAcentos(nombre);
    if (/^(unidad curricular|asignatura|materia)$/.test(nn)) continue;
    // Encabezado partido en dos filas (Ingeniería): "Semanal | Total | Teoría".
    if (/^(semanal|total|teoria)$/.test(sinAcentos(codigo))) continue;

    // "1" y "01" son el mismo código: algunas tablas repiten la numeración en un
    // bloque de electivas al final, y las anuales aparecen en los dos cuatrimestres.
    const clave = codigo ? codigo.replace(/^0+(?=\d)/, '') : 's-' + nn.slice(0, 30);
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    const dedicTxt = sinAcentos(cols.dedicacion >= 0 ? (f[cols.dedicacion] ?? '') : '');
    const dedicacion = /^a(nual)?\b/.test(dedicTxt) ? 'anual' : 'cuatrimestral';

    // Nivel. Bajo secciones de año, algunos planes numeran el cuatrimestre
    // dentro del año (Primer/Segundo) y otros de corrido (1° a 10°): si el
    // número es mayor que 2 ya es global.
    let nivel;
    let tipoNivel;
    if (huboAnio && cuatLocal) {
      nivel = cuatLocal <= 2 ? (anio - 1) * 2 + cuatLocal : cuatLocal;
      tipoNivel = 'cuatrimestre';
    } else if (huboAnio) {
      nivel = anio;
      tipoNivel = 'anio';
    } else if (cuatLocal) {
      nivel = cuatLocal;
      tipoNivel = 'cuatrimestre';
    } else {
      nivel = 1;
      tipoNivel = 'anio';
    }

    const m = { codigo, _sinCodigo: !codigo, nombre, dedicacion, nivel, _tipoNivel: tipoNivel, _correl: f[cols.correl] ?? '' };
    if (cols.formato >= 0 && norm(f[cols.formato] ?? '')) m.formato = norm(f[cols.formato]);
    const hSem = cols.hSem >= 0 ? parseFloat(String(f[cols.hSem] ?? '').replace(',', '.')) : NaN;
    const hTot = cols.hTot >= 0 ? parseInt(String(f[cols.hTot] ?? ''), 10) : NaN;
    if (hSem) m.horasSemanales = hSem;
    if (hTot) m.horasTotales = hTot;
    if (cols.regimen >= 0 && norm(f[cols.regimen] ?? '')) m.regimen = norm(f[cols.regimen]);
    if (cols.area >= 0 && norm(f[cols.area] ?? '')) m.area = norm(f[cols.area]);
    if (cols.correlRendir >= 0) m._correlRendir = f[cols.correlRendir] ?? '';
    if (mencion) m.mencion = mencion;
    if (cicloOrientado) m.cicloOrientado = true;
    if (/^optativa|^seminario optativo|^electiva/i.test(nombre)) m.optativa = true;
    materias.push(m);
  }
  return terminar(materias);
}

/** Códigos sintéticos, ancho uniforme, correlativas resueltas contra el plan. */
function terminar(materias) {
  let sinCod = 0;
  for (const m of materias) {
    if (m._sinCodigo) {
      m.codigo = 'S' + String(++sinCod).padStart(2, '0');
      m.sinCodigoOficial = true;
    }
    delete m._sinCodigo;
  }
  const numericos = materias.filter((m) => /^\d+$/.test(m.codigo));
  const anchoMax = Math.max(0, ...numericos.map((m) => m.codigo.length));
  // Planes con códigos de hasta dos dígitos: todo a dos ("3" y "03" son la misma).
  const pad = (c) => (anchoMax <= 2 && /^\d+$/.test(c) ? c.padStart(2, '0') : c);
  for (const m of materias) m.codigo = pad(m.codigo);
  const existentes = new Set(materias.map((m) => m.codigo));

  const tipos = new Set(materias.map((m) => m._tipoNivel));
  const tipoNivel = tipos.has('cuatrimestre') ? 'cuatrimestre' : 'anio';
  for (const m of materias) {
    // Si el plan mezcla (raro), lo que sólo tenía año se lleva a su primer cuatrimestre.
    if (tipoNivel === 'cuatrimestre' && m._tipoNivel === 'anio') m.nivel = (m.nivel - 1) * 2 + 1;
    delete m._tipoNivel;

    let todos = partirCorrelativas(m._correl).map(pad);
    // Algunas tablas escriben la correlativa por nombre ("Inglés I"): se
    // busca una materia cuyo nombre termine así.
    if (!todos.length && m._correl && !/\d/.test(m._correl) && m._correl.trim() !== '-') {
      const buscado = sinAcentos(m._correl).replace(/[:\s]+$/, '');
      const hallada = materias.find((x) => {
        const n = sinAcentos(x.nombre);
        return x !== m && (n === buscado || n.endsWith('· ' + buscado) || n.endsWith(' ' + buscado));
      });
      if (hallada) todos = [hallada.codigo];
    }
    m.correlativas = [...new Set(todos.filter((c) => existentes.has(c) && c !== m.codigo))];
    const perdidas = todos.filter((c) => !existentes.has(c));
    if (perdidas.length) m.correlativasNoResueltas = perdidas;
    delete m._correl;
    if (m._correlRendir !== undefined) {
      const r = partirCorrelativas(m._correlRendir).map(pad).filter((c) => existentes.has(c));
      if (r.length) m.correlativasParaRendir = r;
      delete m._correlRendir;
    }
  }
  return { materias, tipoNivel };
}

// ------------------------------------------------- trabajo social (pdf)
/**
 * El PDF es una tabla con columnas fijas. `pdftotext -table` la deja en
 * texto alineado; cada materia empieza con su código y trae la dedicación
 * como ancla. Los nombres que ocupan dos líneas quedan con la primera.
 */
export function parsearPdfTrabajoSocial(texto) {
  const materias = [];
  let anio = 0;
  let cuat = 0;
  const re =
    /^\s*(\d{1,2})\*?\s+(.+?)\s{2,}(Anual|Cuatrimestral|Bimestral)\s+(\S+)\s+(\d+(?:\s*\([^)]*\))?)\s+(\d+)\s*([\d\s\-–,]*?)\s*(Regular|Libre)?\s*$/;
  for (const linea of texto.split(/\r?\n/)) {
    const sec = seccionDe(linea);
    const s = sinAcentos(linea);
    const mAnio = s.match(/(primer|segundo|tercer|cuarto|quinto)\s+ano\s*-\s*(primer|segundo)\s+cuatrimestre/);
    if (mAnio) {
      anio = ORDINALES[mAnio[1]];
      cuat = ORDINALES[mAnio[2]];
      continue;
    }
    if (sec?.anio) {
      anio = sec.anio;
      continue;
    }
    const m = linea.match(re);
    if (!m) continue;
    const [, codigo, nombre, dedic, formato, hSem, hTot, correl] = m;
    materias.push({
      codigo,
      _sinCodigo: false,
      nombre: norm(nombre.replace(/:\s*$/, '')),
      dedicacion: dedic === 'Anual' ? 'anual' : 'cuatrimestral',
      nivel: anio ? (anio - 1) * 2 + (cuat || 1) : 1,
      _tipoNivel: 'cuatrimestre',
      _correl: correl ?? '',
      formato,
      horasSemanales: parseInt(hSem, 10) || undefined,
      horasTotales: parseInt(hTot, 10) || undefined,
    });
  }
  for (const m of materias) for (const k of Object.keys(m)) if (m[k] === undefined) delete m[k];
  return terminar(materias);
}

// ------------------------------------ tecnologías ferroviarias (texto)
/** `<p><strong>Primer cuatrimestre</strong><br>Materia<br>Materia</p>` */
export function parsearListaFerroviaria(doc) {
  const materias = [];
  let n = 0;
  let cuatrimestre = 0;
  // El título puede traer un <br> adentro, y la web repite "Octavo" donde va
  // "Séptimo": los cuatrimestres se numeran por orden de aparición.
  for (const parrafo of doc.split(/<p[\s>]/i).slice(1)) {
    const cuerpo = parrafo.split(/<\/p>/i)[0];
    const titulo = cuerpo.match(/^\s*<strong>([\s\S]*?)<\/strong>/i);
    if (!titulo || !seccionDe(limpiar(titulo[1]))?.cuatrimestre) continue;
    cuatrimestre++;
    const resto = cuerpo.slice(titulo[0].length);
    for (const nombre of resto.split(/<br\s*\/?>/i).map(limpiar).filter(Boolean)) {
      materias.push({
        codigo: String(++n).padStart(2, '0'),
        _sinCodigo: false,
        sinCodigoOficial: true,
        nombre: nombre.replace(/\s*\(\*\)\s*$/, ''),
        dedicacion: 'cuatrimestral',
        nivel: cuatrimestre,
        _tipoNivel: 'cuatrimestre',
        _correl: '',
      });
    }
  }
  return terminar(materias);
}

// --------------------------------------------------------- catálogo
const HYA = 'humanidades-y-artes';
const SALUD = 'salud-comunitaria';
const DPYT = 'desarrollo-productivo-y-tecnologico';
const PYPP = 'planificacion-y-politicas-publicas';

export const CARRERAS = {
  // ---- Humanidades y Artes
  audiovision: {
    url: 'grado/licenciaturas/audiovision', departamento: HYA, tipo: 'licenciatura',
    nombre: 'Licenciatura en Audiovisión', nombreCorto: 'Audiovisión',
    titulo: 'Licenciado/a en Audiovisión',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Audiovisión', hastaNivel: 3 },
    duracionAnios: 5, horasTotales: 2880, menciones: ['Sonido y Grabación', 'Postproducción de Imagen'],
  },
  'diseno-y-comunicacion-visual': {
    url: 'grado/licenciaturas/diseno-y-comunicacion-visual', departamento: HYA, tipo: 'licenciatura',
    nombre: 'Licenciatura en Diseño y Comunicación Visual', nombreCorto: 'Diseño y Comunicación Visual',
    titulo: 'Licenciado/a en Diseño y Comunicación Visual', duracionAnios: 5,
  },
  'diseno-industrial': {
    url: 'grado/licenciaturas/diseno-industrial', departamento: HYA, tipo: 'licenciatura',
    nombre: 'Licenciatura en Diseño Industrial', nombreCorto: 'Diseño Industrial',
    titulo: 'Licenciado/a en Diseño Industrial',
    tituloIntermedio: { nombre: 'Técnico/a en Diseño Industrial', hastaNivel: 3 },
    duracionAnios: 5, horasTotales: 2912,
    orientaciones: ['Maquinaria, equipos y vehículos', 'Textil e indumentaria', 'Metales básicos y productos de metal'],
    nota: 'La carrera tiene tres orientaciones. Comparten códigos, correlativas y carga horaria; solo cambia el nombre de los talleres y de Tecnología, Materiales y Procesos. Acá se muestra el plan común.',
    limpiarNombre: true,
  },
  'musica-de-camara-y-sinfonica': {
    url: 'grado/licenciaturas/musica-de-camara-y-sinfonica', departamento: HYA, tipo: 'licenciatura',
    nombre: 'Licenciatura en Música de Cámara y Sinfónica', nombreCorto: 'Música de Cámara y Sinfónica',
    titulo: 'Licenciado/a en Música de Cámara y Sinfónica',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Interpretación Musical', hastaNivel: 4 },
    duracionAnios: 4, horasTotales: 2752,
    nota: 'El plan publicado no informa correlatividades entre materias.',
  },
  'traductorado-publico-en-idioma-ingles': {
    url: 'grado/licenciaturas/traductorado-publico-en-idioma-ingles', departamento: HYA, tipo: 'traductorado',
    nombre: 'Traductorado Público en Idioma Inglés', nombreCorto: 'Traductorado en Inglés',
    titulo: 'Traductor/a Público/a en Idioma Inglés',
    tituloIntermedio: { nombre: 'Traductor/a Técnico/a Universitario/a en Idioma Inglés', hastaNivel: 6 },
    duracionAnios: 4,
  },
  // ---- Salud Comunitaria
  enfermeria: {
    url: 'grado/licenciaturas/enfermeria', departamento: SALUD, tipo: 'licenciatura',
    nombre: 'Licenciatura en Enfermería', nombreCorto: 'Enfermería', titulo: 'Licenciado/a en Enfermería',
    tituloIntermedio: { nombre: 'Enfermero/a', hastaNivel: 3 }, duracionAnios: 5,
  },
  'trabajo-social': {
    url: 'grado/licenciaturas/trabajo-social', departamento: SALUD, tipo: 'licenciatura',
    nombre: 'Licenciatura en Trabajo Social', nombreCorto: 'Trabajo Social', titulo: 'Licenciado/a en Trabajo Social',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Formulación de Proyectos Sociales', hastaNivel: 6 },
    duracionAnios: 5, parser: 'pdf-trabajo-social',
    pdf: 'https://www.unla.edu.ar/documentos/licenciaturas/trabajo_social/Plan%20de%20estudios.pdf',
    nota: 'La web publica este plan como PDF; los nombres que ocupaban dos renglones quedaron con el primero.',
  },
  nutricion: {
    url: 'grado/licenciaturas/nutricion', departamento: SALUD, tipo: 'licenciatura',
    nombre: 'Licenciatura en Nutrición', nombreCorto: 'Nutrición', titulo: 'Licenciado/a en Nutrición',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Nutrición Comunitaria', hastaNivel: 6 },
    duracionAnios: 5,
    nota: 'Este plan distingue correlativas para cursar (con la materia regular) y para rendir el final (con la correlativa aprobada). El mapa usa las de cursar.',
  },
  // ---- Desarrollo Productivo y Tecnológico
  'gestion-ambiental-urbana': {
    url: 'grado/licenciaturas/gestion-ambiental-urbana', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Gestión Ambiental Urbana', nombreCorto: 'Gestión Ambiental Urbana',
    titulo: 'Licenciado/a en Gestión Ambiental Urbana', duracionAnios: 5,
  },
  'economia-empresarial': {
    url: 'grado/licenciaturas/economia-empresarial', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Economía Empresarial', nombreCorto: 'Economía Empresarial',
    titulo: 'Licenciado/a en Economía Empresarial', duracionAnios: 4,
  },
  'economia-politica': {
    url: 'grado/licenciaturas/economia-politica', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Economía Política', nombreCorto: 'Economía Política',
    titulo: 'Licenciado/a en Economía Política', duracionAnios: 4,
  },
  'ciencia-y-tecnologia-de-los-alimentos': {
    url: 'grado/licenciaturas/ciencia-y-tecnologia-de-los-alimentos', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Ciencia y Tecnología de los Alimentos', nombreCorto: 'Ciencia y Tecnología de los Alimentos',
    titulo: 'Licenciado/a en Ciencia y Tecnología de los Alimentos', duracionAnios: 5,
  },
  turismo: {
    url: 'grado/licenciaturas/turismo', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Turismo', nombreCorto: 'Turismo', titulo: 'Licenciado/a en Turismo',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Turismo', hastaNivel: 6 }, duracionAnios: 5, horasTotales: 3264,
  },
  sistemas: {
    url: 'grado/licenciaturas/sistemas', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Sistemas', nombreCorto: 'Sistemas', titulo: 'Licenciado/a en Sistemas',
    tituloIntermedio: { nombre: 'Analista Programador/a Universitario/a', hastaNivel: 6 }, duracionAnios: 5,
  },
  'tecnologias-ferroviarias': {
    url: 'grado/licenciaturas/tecnologias-ferroviarias', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Tecnologías Ferroviarias', nombreCorto: 'Tecnologías Ferroviarias',
    titulo: 'Licenciado/a en Tecnologías Ferroviarias',
    tituloIntermedio: { nombre: 'Técnico/a Universitario en Tecnologías Ferroviarias', hastaNivel: 6 },
    duracionAnios: 4, parser: 'lista-ferroviaria',
    orientaciones: ['Electromecánica Ferroviaria', 'Infraestructura Ferroviaria'],
    nota: 'La web publica sólo la lista de materias de la Tecnicatura, sin códigos ni correlatividades. Los dos cuatrimestres de la Licenciatura y sus orientaciones no están detallados.',
  },
  'planificacion-logistica': {
    url: 'grado/licenciaturas/planificacion-logistica', departamento: DPYT, tipo: 'licenciatura',
    nombre: 'Licenciatura en Planificación Logística', nombreCorto: 'Planificación Logística',
    titulo: 'Licenciado/a en Planificación Logística', duracionAnios: 5,
  },
  'ingenieria-ferroviaria': {
    url: 'grado/ingenierias/ferroviaria', departamento: DPYT, tipo: 'ingenieria',
    nombre: 'Ingeniería Ferroviaria', nombreCorto: 'Ingeniería Ferroviaria', titulo: 'Ingeniero/a Ferroviario/a',
    duracionAnios: 5,
    // Encabezado de dos filas: "Carga horaria" y "Horas" se abren en Semanal/Total y Teoría/Práctica.
    columnas: { codigo: 0, nombre: 1, formato: 2, dedicacion: 3, regimen: -1, hSem: 4, hTot: 5, correl: 9, correlRendir: -1, area: -1 },
  },
  // ---- Planificación y Políticas Públicas
  'seguridad-ciudadana': {
    url: 'grado/licenciaturas/seguridad-ciudadana', departamento: PYPP, tipo: 'licenciatura',
    nombre: 'Licenciatura en Seguridad Ciudadana', nombreCorto: 'Seguridad Ciudadana',
    titulo: 'Licenciado/a en Seguridad Ciudadana', duracionAnios: 4,
  },
  'ciencia-politica-y-gobierno': {
    url: 'grado/licenciaturas/ciencia-politica-y-gobierno', departamento: PYPP, tipo: 'licenciatura',
    nombre: 'Licenciatura en Ciencia Política y Gobierno', nombreCorto: 'Ciencia Política y Gobierno',
    titulo: 'Licenciado/a en Ciencia Política y Gobierno', duracionAnios: 4, horasTotales: 2688,
  },
  educacion: {
    url: 'grado/licenciaturas/educacion', departamento: PYPP, tipo: 'licenciatura',
    nombre: 'Licenciatura en Educación', nombreCorto: 'Educación', titulo: 'Licenciado/a en Educación',
    duracionAnios: 4, horasTotales: 2656,
  },
  'justicia-y-derechos-humanos': {
    url: 'grado/licenciaturas/justicia-y-derechos-humanos', departamento: PYPP, tipo: 'licenciatura',
    nombre: 'Licenciatura en Justicia y Derechos Humanos', nombreCorto: 'Justicia y Derechos Humanos',
    titulo: 'Licenciado/a en Justicia y Derechos Humanos', duracionAnios: 4,
  },
  'relaciones-internacionales': {
    url: 'grado/licenciaturas/relaciones-internacionales', departamento: PYPP, tipo: 'licenciatura',
    nombre: 'Licenciatura en Relaciones Internacionales', nombreCorto: 'Relaciones Internacionales',
    titulo: 'Licenciado/a en Relaciones Internacionales', duracionAnios: 4,
  },
  'gestion-de-gobierno-local': {
    url: 'pregrado/tecnicaturas/gestion-de-gobierno-local', departamento: PYPP, tipo: 'tecnicatura',
    nombre: 'Tecnicatura Universitaria en Gestión de Gobierno Local', nombreCorto: 'Gestión de Gobierno Local',
    titulo: 'Técnico/a Universitario/a en Gestión de Gobierno Local', duracionAnios: 3,
  },
  'gestion-y-administracion-universitaria': {
    url: 'pregrado/tecnicaturas/gestion-y-administracion-universitaria', departamento: PYPP, tipo: 'tecnicatura',
    nombre: 'Tecnicatura Superior en Gestión y Administración Universitaria', nombreCorto: 'Gestión y Administración Universitaria',
    titulo: 'Técnico/a Superior en Gestión y Administración Universitaria', duracionAnios: 2,
  },
};

// ------------------------------------------------------------- red
async function html(slug, cfg) {
  const f = path.join(CACHE, slug + '.html');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const r = await fetch(BASE + cfg.url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(slug + ': HTTP ' + r.status);
  const t = await r.text();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(f, t);
  await new Promise((res) => setTimeout(res, 4000)); // la web corta con 429
  return t;
}

async function textoPdf(slug, url) {
  const f = path.join(CACHE, slug + '-plan.pdf');
  if (!fs.existsSync(f)) {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error(slug + ' pdf: HTTP ' + r.status);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', f, '-'], { encoding: 'utf8' });
}

// ------------------------------------------------------------ armado
export async function extraer(slug) {
  const cfg = CARRERAS[slug];
  if (!cfg) throw new Error('carrera desconocida: ' + slug);
  let plan;
  if (cfg.parser === 'pdf-trabajo-social') plan = parsearPdfTrabajoSocial(await textoPdf(slug, cfg.pdf));
  else if (cfg.parser === 'lista-ferroviaria') plan = parsearListaFerroviaria(await html(slug, cfg));
  else plan = parsearTabla(await html(slug, cfg), cfg);

  const { materias, tipoNivel } = plan;
  if (cfg.limpiarNombre)
    for (const m of materias) m.nombre = m.nombre.replace(/\s*\(Orientaci[oó]n[^)]*\)\s*$/i, '').trim();

  const carrera = {
    slug,
    nombre: cfg.nombre,
    nombreCorto: cfg.nombreCorto,
    departamento: cfg.departamento,
    tipo: cfg.tipo,
    titulo: cfg.titulo,
    ...(cfg.tituloIntermedio ? { tituloIntermedio: cfg.tituloIntermedio } : {}),
    duracionAnios: cfg.duracionAnios,
    ...(cfg.horasTotales ? { horasTotales: cfg.horasTotales } : {}),
    ...(cfg.menciones ? { menciones: cfg.menciones } : {}),
    ...(cfg.orientaciones ? { orientaciones: cfg.orientaciones } : {}),
    ...(cfg.nota ? { nota: cfg.nota } : {}),
    tipoNivel,
    niveles: Math.max(1, ...materias.map((m) => m.nivel)),
    fuenteUrl: cfg.pdf ?? BASE + cfg.url,
    fuenteFecha: new Date().toISOString().slice(0, 10),
    cotejado: false,
    materias,
  };
  return carrera;
}

/** El índice liviano que la app importa de forma estática. */
export function armarIndice(carreras) {
  return carreras.map((c) => ({
    slug: c.slug,
    nombre: c.nombre,
    nombreCorto: c.nombreCorto,
    departamento: c.departamento,
    tipo: c.tipo,
    materias: c.materias.length,
    duracionAnios: c.duracionAnios,
    tieneCorrelativas: c.materias.some((m) => m.correlativas.length > 0),
    tituloIntermedio: !!c.tituloIntermedio,
  }));
}

async function main() {
  const pedidos = process.argv.slice(2);
  const slugs = pedidos.length ? pedidos : Object.keys(CARRERAS);
  fs.mkdirSync(SALIDA, { recursive: true });
  const todas = [];
  for (const slug of slugs) {
    try {
      const carrera = await extraer(slug);
      // Se conserva el cotejo anterior si ya estaba hecho y el plan no cambió de tamaño.
      const previo = path.join(SALIDA, slug + '.json');
      if (fs.existsSync(previo)) {
        const p = JSON.parse(fs.readFileSync(previo, 'utf8'));
        if (p.cotejado && p.materias.length === carrera.materias.length) carrera.cotejado = true;
      }
      fs.writeFileSync(previo, JSON.stringify(carrera, null, 2) + '\n');
      todas.push(carrera);
      const conCorr = carrera.materias.filter((m) => m.correlativas.length).length;
      const noRes = carrera.materias.filter((m) => m.correlativasNoResueltas).length;
      console.log(
        `${slug.padEnd(40)} ${String(carrera.materias.length).padStart(3)} materias, ${String(conCorr).padStart(3)} con correlativas, ${noRes} sin resolver, ${carrera.niveles} ${carrera.tipoNivel}s`,
      );
    } catch (e) {
      console.error(`${slug.padEnd(40)} ERROR: ${e.message}`);
    }
  }
  // El índice se arma con todos los JSON del disco, así extraer una sola
  // carrera no lo deja desactualizado.
  const enDisco = Object.keys(CARRERAS)
    .map((s) => path.join(SALIDA, s + '.json'))
    .filter((r) => fs.existsSync(r))
    .map((r) => JSON.parse(fs.readFileSync(r, 'utf8')));
  fs.writeFileSync(path.join(SALIDA, 'indice.json'), JSON.stringify(armarIndice(enDisco), null, 2) + '\n');
  console.log(`indice.json: ${enDisco.length} carreras`);
}

if (process.argv[1] && process.argv[1].endsWith('extraer-plan.mjs')) main();
