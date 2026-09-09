/**
 * Convierte la grilla de aulas del Departamento (un PDF con una tabla por
 * carrera) en JSON, emparejando cada materia contra el plan de estudios.
 *
 * Uso:  node tools/extraer-aulas.mjs <grilla.txt> [--escribir]
 * El .txt sale de:  pdftotext -table -enc UTF-8 GRILLA_AULAS.pdf grilla.txt
 *
 * El PDF viene con los nombres RECORTADOS: la planilla original cortó el texto
 * que no entraba en la celda, así que "Aula 1 (TALLER DE LECTUR" es todo lo que
 * hay. Por eso el emparejamiento es por parecido y no por igualdad, y todo lo
 * que no cierra se informa en vez de inventarse.
 */
import fs from 'node:fs';

/** Cada página del PDF es una carrera. */
const PAGINAS = [
  {
    desde: 1,
    hasta: 43,
    slug: 'audiovision',
    edificioPorDefecto: 'jose-hernandez',
    nota: 'Lo que no coincide con el plan vigente son optativas y seminarios que se dictan este cuatrimestre.',
  },
  {
    desde: 44,
    hasta: 88,
    slug: 'diseno-y-comunicacion-visual',
    nota: 'La carrera cambió de plan. La web de la universidad ya publica el vigente, pero la grilla del Departamento todavía nombra materias del plan anterior, a veces con los dos nombres separados por barra. Lo que no coincide con el plan vigente queda marcado.',
  },
  {
    desde: 89,
    hasta: 200,
    slug: 'traductorado-publico-en-idioma-ingles',
    nota: 'Lo que no coincide con el plan vigente son seminarios y cursos que se dictan este cuatrimestre.',
  },
];

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const CABECERAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TURNOS = ['manana', 'tarde', 'noche'];

/** Nombre corto del edificio en la grilla -> id del edificio en el campus. */
const EDIFICIOS = {
  jose: 'jose-hernandez',
  hernandez: 'jose-hernandez',
  audiovision: 'jose-hernandez',
  audio: 'jose-hernandez',
  kirchner: 'escuela-gobierno-nestor-kirchner',
  manso: 'juana-manso',
  ugarte: 'manuel-ugarte',
  jauretche: 'arturo-jauretche',
  marechal: 'leopoldo-marechal',
  macedonio: 'macedonio-fernandez',
  scalabrini: 'raul-scalabrini-ortiz',
  estudio: 'estudio-discepolo',
  humanidades: 'jose-hernandez',
};

/** Lugares de cursada que no están en el predio. */
const EXTERNOS = { mud: 'mud' };

/** Abreviaturas de la grilla que no se parecen al nombre del plan. */
const ALIAS = {
  audiovision: {
    ays: 'Arte y Sociedad',
    'ria 1': 'Realización Integral Audiovisual 1',
    'ria 2': 'Realización Integral Audiovisual 2',
    ted: 'Taller de Edición de Sonido',
    'lav 1': 'Lenguaje Audiovisual 1',
    'lav 2': 'Lenguaje Audiovisual 2',
    foto: 'Fotografía e Iluminación en Audiovisuales',
    elementos: 'Elementos de Audio',
    registro: 'Registro de Sonido en Audiovisuales',
    etica: 'Ética Profesional',
    montaje: 'Taller de Montaje',
    guion: 'Guión',
    semiotica: 'Semiótica',
  },
  'diseno-y-comunicacion-visual': {},
  'traductorado-publico-en-idioma-ingles': {
    'taller de tfi': 'Taller de Trabajo Final Integrador',
    'ppios. grales. de economia y finanzas': 'Principios Generales de Economía y Finanzas',
    'practicas preprof. i y ii': 'Prácticas Pre-profesionales I',
    'estructura comparadas': 'Estructuras comparadas',
  },
};

const sinAcentos = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Dónde empieza cada entrada dentro de una fila de la tabla. */
const INICIO = new RegExp(
  [
    'Aula\\s+\\d+',
    'Estudio(?:\\s+de\\s+Grabaci[oó]n)?',
    'Virtual',
    'MUD',
    'Sala\\s+Humanidades',
    '\\d+\\s{1,2}(?:Manso|Ugarte|Jauretche|Marechal|Hern[aá]ndez|Kirchner|Macedonio|Scalabrini|Audiovisi[oó]n|audio|Jos[eé])',
  ].join('|'),
  'gu',
);

/**
 * Parte una fila de la tabla en entradas.
 *
 * Hay dos formas en que dos entradas quedan pegadas: separadas por el hueco
 * entre columnas (dos o más espacios) o directamente sin espacio, cuando la
 * planilla recortó la anterior a la mitad ("...LECTURAula 1 (..."). En cambio
 * un lugar alternativo ("Virtual / 4 Manso") y un paréntesis interno
 * ("1 Macedonio (50% Virtual)") NO abren una entrada nueva.
 */
function partirEntradas(filaCruda) {
  // La grilla anota la modalidad entre parentesis; sin ellos deja de
  // confundirse con el nombre de una materia.
  const fila = filaCruda.replace(new RegExp("\\((\\d+%\\s*[Vv]irtual)\\)", "g"), "- $1");
  const cortes = [];
  let ultimo = 0;
  for (const m of fila.matchAll(INICIO)) {
    const antes = fila.slice(0, m.index);
    if (antes.trimEnd().endsWith('/')) continue;

    const tramo = fila.slice(ultimo, m.index);
    const abiertos = tramo.split('(').length - tramo.split(')').length;
    const hueco = /s{2,}$/.test(antes);
    const pegado = m.index > 0 && !/s$/.test(antes);
    if (abiertos > 0 && !hueco && !pegado) continue;

    cortes.push(m.index);
    ultimo = m.index;
  }
  return cortes
    .map((c, i) => ({ col: c, texto: fila.slice(c, cortes[i + 1] ?? fila.length).trim() }))
    .filter((e) => e.texto.includes('('));
}

/** "Aula 18 José (ELEMENTOS DE AUDIO)" -> lugar y materia. */
function partirEntrada(texto) {
  const abre = texto.lastIndexOf('(');
  return {
    lugar: texto.slice(0, abre).trim(),
    materia: texto
      .slice(abre + 1)
      .replace(/\)\s*$/, '')
      .trim(),
  };
}

/**
 * Del lugar salen el aula y el edificio. "Virtual" no tiene ninguno.
 *
 * La grilla de Audiovisión escribe "Aula 3" a secas cuando el edificio es el
 * de siempre: José Hernández. Las aulas 1 a 6 de esa grilla son el espacio
 * Audiovisión, que está dentro del mismo edificio.
 */
function ubicar(lugar, porDefecto) {
  return lugar
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^virtual/i.test(p)) return { virtual: true };
      const plano = sinAcentos(p);
      const externo = Object.keys(EXTERNOS).find((k) => plano === k || plano.startsWith(k + ' '));
      if (externo) return { textoOriginal: p, aula: p, externo: EXTERNOS[externo] };
      const clave = Object.keys(EDIFICIOS).find((k) => plano.includes(k));
      const num = p.match(/\d+/)?.[0];
      const espacio = /\baudio\b|audiovisi/i.test(plano);
      const salida = { textoOriginal: p };
      if (num) salida.aula = 'Aula ' + num;
      else salida.aula = p.replace(/\s*\(.*$/, '').trim();
      salida.edificio = clave ? EDIFICIOS[clave] : porDefecto;
      if (!salida.edificio) delete salida.edificio;
      if (espacio || (porDefecto && !clave && Number(num) <= 6)) salida.espacioAudiovision = true;
      return salida;
    });
}

/** Palabras que no distinguen nada y hacían pasar emparejamientos falsos. */
const VACIAS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'en', 'con', 'para', 'por']);

const significativas = (s) =>
  sinAcentos(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 3 && !VACIAS.has(w));

/** Proporción de palabras significativas del texto que aparecen en el nombre. */
function parecido(texto, nombre) {
  const a = significativas(texto);
  const b = new Set(significativas(nombre));
  if (!a.length || !b.size) return 0;
  // La última palabra puede venir cortada a la mitad: vale si es prefijo.
  const palabras = [...b];
  let aciertos = 0;
  for (const w of a) {
    if (b.has(w)) aciertos++;
    else if (palabras.some((x) => x.startsWith(w) || w.startsWith(x))) aciertos++;
  }
  return aciertos / a.length;
}

/** Los numerales del final ("1" vs "2") tienen que coincidir sí o sí. */
function numeralCompatible(texto, nombre) {
  const n = (s) => sinAcentos(s).match(/\b([1234]|i{1,3}|iv)\b\s*$/)?.[1];
  const a = n(texto);
  const b = n(nombre);
  if (!a || !b) return true;
  const romano = { i: '1', ii: '2', iii: '3', iv: '4' };
  return (romano[a] ?? a) === (romano[b] ?? b);
}

function emparejarUno(texto, plan) {
  let mejor = null;
  for (const m of plan) {
    if (!numeralCompatible(texto, m.nombre)) continue;
    const score = parecido(texto, m.nombre);
    if (score >= 0.6 && (!mejor || score > mejor.score)) mejor = { codigo: m.codigo, score };
  }
  return mejor;
}

/** La grilla a veces nombra el plan viejo y el nuevo separados por barra. */
function emparejar(texto, plan, alias) {
  const buscado = alias[sinAcentos(texto)] ?? texto;
  let mejor = null;
  for (const parte of buscado.split('/')) {
    const m = emparejarUno(parte.trim(), plan);
    if (m && (!mejor || m.score > mejor.score)) mejor = m;
  }
  return mejor;
}

// --------------------------------------------------------------------------
const archivo = process.argv[2];
if (!archivo) throw new Error('falta el .txt de la grilla (pdftotext -table)');
const lineas = fs.readFileSync(archivo, 'utf8').split(/\r?\n/);
const escribir = process.argv.includes('--escribir');
const sinPlan = [];

for (const pagina of PAGINAS) {
  const plan = JSON.parse(fs.readFileSync(`src/data/carreras/${pagina.slug}.json`, 'utf8')).materias;
  const alias = ALIAS[pagina.slug] ?? {};
  const bloque = lineas.slice(pagina.desde - 1, pagina.hasta);
  const cabecera = bloque.find((l) => l.includes('Lunes')) ?? '';
  const columnas = CABECERAS.map((d) => cabecera.indexOf(d));

  const clases = [];
  let turno = null;
  for (const fila of bloque) {
    const t = fila.match(/TURNO\s+(MAÑANA|TARDE|NOCHE)/);
    if (t) {
      turno = { MAÑANA: 'manana', TARDE: 'tarde', NOCHE: 'noche' }[t[1]];
      continue;
    }
    if (!turno || fila.includes('Lunes')) continue;

    for (const entrada of partirEntradas(fila)) {
      const { lugar, materia } = partirEntrada(entrada.texto);
      let dia = 0;
      for (let i = 0; i < columnas.length; i++)
        if (columnas[i] >= 0 && entrada.col >= columnas[i] - 3) dia = i;

      const m = emparejar(materia, plan, alias);
      if (!m) sinPlan.push({ carrera: pagina.slug, materia, lugar });
      else if (process.argv.includes('--dudosos') && m.score < 0.999)
        console.log(
          '  ' + m.score.toFixed(2), (materia.slice(0, 46) + ' ').padEnd(48, '.'),
          plan.find((x) => x.codigo === m.codigo).nombre,
        );
      clases.push({
        dia: DIAS[dia],
        turno,
        materiaTexto: materia,
        ...(m ? { materiaCodigo: m.codigo } : { fueraDePlan: true }),
        ubicaciones: ubicar(lugar, pagina.edificioPorDefecto),
      });
    }
  }

  clases.sort(
    (a, b) =>
      DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia) ||
      TURNOS.indexOf(a.turno) - TURNOS.indexOf(b.turno) ||
      a.materiaTexto.localeCompare(b.materiaTexto),
  );

  if (escribir) {
    const salida = {
      carrera: pagina.slug,
      periodo: '2026-2',
      periodoNombre: '2° cuatrimestre 2026',
      fuente: 'Grilla de aulas del Departamento de Humanidades y Artes',
      fuenteFecha: '2026-09-09',
      nota:
        'Los nombres vienen recortados en la planilla original; se emparejaron contra el plan por parecido. ' +
        pagina.nota,
      clases,
    };
    fs.writeFileSync(`src/data/horarios/${pagina.slug}.json`, JSON.stringify(salida, null, 2) + '\n');
  }

  const con = clases.filter((c) => c.materiaCodigo).length;
  console.log(
    `${pagina.slug}: ${clases.length} clases · ${con} emparejadas con el plan · ${clases.length - con} sin emparejar`,
  );
}

if (sinPlan.length) {
  console.log('\nSin emparejar (optativas, seminarios, o algo para revisar):');
  for (const s of sinPlan) console.log(`  ${s.carrera.slice(0, 12).padEnd(13)} ${s.lugar.padEnd(34)} ${s.materia}`);
}
