/**
 * Layout del grafo de correlatividades: columnas por nivel, filas ordenadas
 * para que se crucen menos líneas.
 *
 * Es la implementación de referencia: el componente de Angular usa el mismo
 * algoritmo (src/app/core/grafo/layout.ts). Acá sirve para generar el SVG
 * del mockup con datos reales y para mirar el resultado sin levantar la app.
 *
 * Uso:  node tools/layout-grafo.mjs <slug> [--svg salida.svg]
 */
import fs from 'node:fs';

/** Dos escalas: 'ficha' es la vista general del telefono (solo el codigo);
 *  'tarjeta' es la vista acercada (codigo + nombre). */
export const MEDIDAS = {
  ficha: { ancho: 40, alto: 26, gapX: 34, gapY: 9, margen: 14 },
  tarjeta: { ancho: 132, alto: 40, gapX: 56, gapY: 10, margen: 16 },
};
export const NODO = MEDIDAS.tarjeta;

/**
 * Ordena cada columna con el baricentro de sus vecinos de la columna anterior
 * (heurística clásica de Sugiyama). Pocas pasadas alcanzan: los planes son chicos
 * y el orden del plan ya es una base razonable.
 */
export function calcularLayout(carrera, pasadas = 4, escala = 'tarjeta') {
  const NODO = MEDIDAS[escala];
  const materias = carrera.materias;
  const porCodigo = new Map(materias.map((m) => [m.codigo, m]));
  const niveles = Math.max(...materias.map((m) => m.nivel));

  const columnas = [];
  for (let n = 1; n <= niveles; n++) columnas.push(materias.filter((m) => m.nivel === n));

  const fila = new Map();
  for (const col of columnas) col.forEach((m, i) => fila.set(m.codigo, i));

  const baricentro = (m, vecinas) => {
    const filas = vecinas.map((c) => fila.get(c)).filter((f) => f !== undefined);
    return filas.length ? filas.reduce((a, b) => a + b, 0) / filas.length : null;
  };

  const dependientes = new Map(materias.map((m) => [m.codigo, []]));
  for (const m of materias)
    for (const c of m.correlativas) dependientes.get(c)?.push(m.codigo);

  for (let p = 0; p < pasadas; p++) {
    const haciaAdelante = p % 2 === 0;
    const orden = haciaAdelante ? columnas.slice(1) : columnas.slice(0, -1).reverse();
    for (const col of orden) {
      const claves = new Map(
        col.map((m) => [
          m.codigo,
          baricentro(m, haciaAdelante ? m.correlativas : (dependientes.get(m.codigo) ?? [])),
        ]),
      );
      const conBari = col.filter((m) => claves.get(m.codigo) !== null);
      const sinBari = col.filter((m) => claves.get(m.codigo) === null);
      conBari.sort((a, b) => claves.get(a.codigo) - claves.get(b.codigo));
      // Las que no tienen vecinos quedan al final, en el orden del plan.
      const nuevo = [...conBari, ...sinBari];
      nuevo.forEach((m, i) => fila.set(m.codigo, i));
      col.length = 0;
      col.push(...nuevo);
    }
  }

  const altoCol = (col) => col.length * NODO.alto + Math.max(0, col.length - 1) * NODO.gapY;
  const altoMax = Math.max(...columnas.map(altoCol));

  const nodos = [];
  columnas.forEach((col, ci) => {
    const y0 = NODO.margen + (altoMax - altoCol(col)) / 2;
    col.forEach((m, i) => {
      nodos.push({
        ...m,
        x: NODO.margen + ci * (NODO.ancho + NODO.gapX),
        y: y0 + i * (NODO.alto + NODO.gapY),
        w: NODO.ancho,
        h: NODO.alto,
      });
    });
  });

  const pos = new Map(nodos.map((n) => [n.codigo, n]));
  const aristas = [];
  for (const n of nodos)
    for (const c of n.correlativas) {
      const o = pos.get(c);
      if (o) aristas.push({ de: c, a: n.codigo, nivelDe: o.nivel });
    }

  return {
    nodos,
    aristas,
    porCodigo,
    ancho: NODO.margen * 2 + niveles * NODO.ancho + (niveles - 1) * NODO.gapX,
    alto: NODO.margen * 2 + altoMax,
    niveles,
  };
}

/** Curva de Bézier del borde derecho de una materia al borde izquierdo de la otra. */
export function curva(o, d) {
  const x1 = o.x + o.w;
  const y1 = o.y + o.h / 2;
  const x2 = d.x;
  const y2 = d.y + d.h / 2;
  const dx = Math.max(28, (x2 - x1) * 0.5);
  return `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
}

/** Un color por nivel de origen, para distinguir de dónde sale cada línea. */
export const COLOR_NIVEL = ['#c77dff', '#5da9ff', '#2dd4cf', '#ffa552', '#f783c7', '#4ade80', '#ffd166', '#ff6b6b'];

export function aSvg(layout, opciones = {}) {
  const { seleccion = null, tema = 'oscuro' } = opciones;
  const c =
    tema === 'oscuro'
      ? { fondo: '#1a1a1a', nodo: '#242229', borde: '#3d3844', texto: '#f5f3f7', texto2: '#ab9fb3' }
      : { fondo: '#faf9fb', nodo: '#ffffff', borde: '#e0dce4', texto: '#1a1a1a', texto2: '#5f5768' };

  const pos = new Map(layout.nodos.map((n) => [n.codigo, n]));
  const necesita = seleccion ? new Set(pos.get(seleccion)?.correlativas ?? []) : new Set();
  const habilita = new Set(
    seleccion ? layout.aristas.filter((a) => a.de === seleccion).map((a) => a.a) : [],
  );
  const enFoco = (cod) => !seleccion || cod === seleccion || necesita.has(cod) || habilita.has(cod);

  const lineas = layout.aristas
    .map((a) => {
      const activa = seleccion && (a.de === seleccion || a.a === seleccion);
      const apagada = seleccion && !activa;
      const col = COLOR_NIVEL[(a.nivelDe - 1) % COLOR_NIVEL.length];
      return `<path d="${curva(pos.get(a.de), pos.get(a.a))}" fill="none" stroke="${col}" stroke-width="${activa ? 2.2 : 1}" opacity="${apagada ? 0.06 : activa ? 0.95 : 0.28}"/>`;
    })
    .join('\n');

  const cajas = layout.nodos
    .map((n) => {
      const foco = enFoco(n.codigo);
      const sel = n.codigo === seleccion;
      const acento = COLOR_NIVEL[(n.nivel - 1) % COLOR_NIVEL.length];
      const nombre = n.nombre.length > 34 ? n.nombre.slice(0, 33) + '…' : n.nombre;
      return `<g opacity="${foco ? 1 : 0.22}">
  <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8" fill="${c.nodo}" stroke="${sel ? acento : c.borde}" stroke-width="${sel ? 2 : 1}"/>
  <rect x="${n.x}" y="${n.y + 8}" width="3" height="${n.h - 16}" rx="1.5" fill="${acento}"/>
  <text x="${n.x + 10}" y="${n.y + 15}" font-family="DM Mono, ui-monospace, monospace" font-size="8.5" fill="${c.texto2}" letter-spacing="0.6">${n.codigo}</text>
  <text x="${n.x + 10}" y="${n.y + 28}" font-family="Archivo, system-ui, sans-serif" font-size="9" font-weight="500" fill="${c.texto}">${nombre.length > 22 ? nombre.slice(0, 21) + '…' : nombre}</text>
</g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.ancho} ${layout.alto}" width="${layout.ancho}" height="${layout.alto}">
<rect width="${layout.ancho}" height="${layout.alto}" fill="${c.fondo}"/>
${lineas}
${cajas}
</svg>`;
}

if (process.argv[1] && process.argv[1].endsWith('layout-grafo.mjs')) {
  const slug = process.argv[2] ?? 'audiovision';
  const carrera = JSON.parse(fs.readFileSync(`src/data/carreras/${slug}.json`, 'utf8'));
  const layout = calcularLayout(carrera);
  const cruces = layout.aristas.filter((a) => {
    const o = layout.nodos.find((n) => n.codigo === a.de);
    const d = layout.nodos.find((n) => n.codigo === a.a);
    return d.nivel - o.nivel > 1;
  }).length;
  console.log(
    `${slug}: ${layout.nodos.length} nodos, ${layout.aristas.length} aristas, lienzo ${layout.ancho}x${layout.alto}, ${cruces} aristas que saltan niveles`,
  );
  const i = process.argv.indexOf('--svg');
  if (i > 0) {
    const sel = process.argv[process.argv.indexOf('--sel') + 1];
    fs.writeFileSync(
      process.argv[i + 1],
      aSvg(layout, { seleccion: process.argv.includes('--sel') ? sel : null }),
    );
    console.log('svg ->', process.argv[i + 1]);
  }
}
