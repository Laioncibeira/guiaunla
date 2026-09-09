/**
 * Layout del grafo de correlatividades.
 *
 * Los años son columnas de izquierda a derecha y cada materia es una tarjeta.
 * Dentro de cada columna las materias se reordenan por el baricentro de sus
 * vecinas (heurística de Sugiyama): con dos o tres pasadas las líneas dejan de
 * cruzarse entre sí y el plan se lee de un vistazo, que es todo el punto.
 *
 * Nada de esto toca el DOM: es geometría pura y se testea sin navegador.
 */
import type { Carrera, Materia } from './datos';
import { anioDe, cuatrimestreDe } from './datos';

export interface Medidas {
  readonly ancho: number;
  readonly alto: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly margen: number;
}

/** Una tarjeta entra con el código, el nombre en dos líneas y una etiqueta. */
export const TARJETA: Medidas = { ancho: 152, alto: 48, gapX: 64, gapY: 12, margen: 18 };

export interface Nodo {
  readonly materia: Materia;
  readonly codigo: string;
  readonly anio: number;
  readonly cuatrimestre: number | null;
  /** El nombre partido en las líneas que entran en la tarjeta. */
  readonly lineas: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Arista {
  readonly de: string;
  readonly a: string;
  readonly anioDe: number;
  readonly d: string;
}

export interface Layout {
  readonly nodos: readonly Nodo[];
  readonly aristas: readonly Arista[];
  readonly porCodigo: ReadonlyMap<string, Nodo>;
  readonly ancho: number;
  readonly alto: number;
  readonly anios: number;
}

/**
 * Parte el nombre en dos líneas que entren en la tarjeta.
 * El SVG no corta texto solo, así que hay que decidirlo acá.
 */
export function partirNombre(nombre: string, porLinea = 20, lineas = 2): string[] {
  const palabras = nombre.split(' ');
  const salida: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const tentativa = actual ? actual + ' ' + p : p;
    if (tentativa.length <= porLinea) {
      actual = tentativa;
      continue;
    }
    if (actual) salida.push(actual);
    actual = p;
    if (salida.length === lineas - 1) break;
  }
  if (salida.length < lineas && actual) salida.push(actual);
  // Lo que no entró se resume con puntos suspensivos en la última línea.
  const usado = salida.join(' ').length;
  if (usado < nombre.length - 1) {
    const resto = nombre.slice(salida.slice(0, -1).join(' ').length).trim();
    salida[salida.length - 1] =
      resto.length > porLinea ? resto.slice(0, porLinea - 1).trimEnd() + '…' : resto;
  }
  return salida;
}

/** Curva del borde derecho de una materia al borde izquierdo de la otra. */
export function curva(o: Nodo, d: Nodo): string {
  const x1 = o.x + o.w;
  const y1 = o.y + o.h / 2;
  const x2 = d.x;
  const y2 = d.y + d.h / 2;
  const dx = Math.max(26, (x2 - x1) * 0.45);
  return `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
}

export function calcularLayout(carrera: Carrera, medidas: Medidas = TARJETA, pasadas = 4): Layout {
  const materias = carrera.materias;
  const totalAnios = Math.max(...materias.map((m) => anioDe(carrera, m)));

  const columnas: Materia[][] = [];
  for (let n = 1; n <= totalAnios; n++)
    columnas.push(materias.filter((m) => anioDe(carrera, m) === n));

  const fila = new Map<string, number>();
  for (const col of columnas) col.forEach((m, i) => fila.set(m.codigo, i));

  const dependientes = new Map<string, string[]>(materias.map((m) => [m.codigo, []]));
  for (const m of materias) for (const c of m.correlativas) dependientes.get(c)?.push(m.codigo);

  const baricentro = (vecinas: readonly string[]): number | null => {
    const filas = vecinas.map((c) => fila.get(c)).filter((f): f is number => f !== undefined);
    return filas.length ? filas.reduce((a, b) => a + b, 0) / filas.length : null;
  };

  for (let p = 0; p < pasadas; p++) {
    const haciaAdelante = p % 2 === 0;
    const orden = haciaAdelante ? columnas.slice(1) : columnas.slice(0, -1).reverse();
    for (const col of orden) {
      const clave = new Map<string, number | null>(
        col.map((m) => [
          m.codigo,
          baricentro(haciaAdelante ? m.correlativas : (dependientes.get(m.codigo) ?? [])),
        ]),
      );
      const conVecinas = col.filter((m) => clave.get(m.codigo) !== null);
      const sueltas = col.filter((m) => clave.get(m.codigo) === null);
      conVecinas.sort((a, b) => (clave.get(a.codigo) as number) - (clave.get(b.codigo) as number));
      const nuevo = [...conVecinas, ...sueltas];
      nuevo.forEach((m, i) => fila.set(m.codigo, i));
      col.length = 0;
      col.push(...nuevo);
    }
  }

  const altoCol = (col: Materia[]) =>
    col.length * medidas.alto + Math.max(0, col.length - 1) * medidas.gapY;
  const altoMax = Math.max(...columnas.map(altoCol), 0);

  const nodos: Nodo[] = [];
  columnas.forEach((col, ci) => {
    const y0 = medidas.margen + (altoMax - altoCol(col)) / 2;
    col.forEach((m, i) => {
      nodos.push({
        materia: m,
        codigo: m.codigo,
        anio: anioDe(carrera, m),
        cuatrimestre: cuatrimestreDe(carrera, m),
        lineas: partirNombre(m.nombre),
        x: medidas.margen + ci * (medidas.ancho + medidas.gapX),
        y: y0 + i * (medidas.alto + medidas.gapY),
        w: medidas.ancho,
        h: medidas.alto,
      });
    });
  });

  const porCodigo = new Map(nodos.map((n) => [n.codigo, n]));
  const aristas: Arista[] = [];
  for (const n of nodos)
    for (const c of n.materia.correlativas) {
      const o = porCodigo.get(c);
      if (o) aristas.push({ de: c, a: n.codigo, anioDe: o.anio, d: curva(o, n) });
    }

  return {
    nodos,
    aristas,
    porCodigo,
    ancho: medidas.margen * 2 + totalAnios * medidas.ancho + (totalAnios - 1) * medidas.gapX,
    alto: medidas.margen * 2 + altoMax,
    anios: totalAnios,
  };
}

/** Encuadre que centra una materia sin salirse del lienzo. */
export function encuadrar(
  layout: Layout,
  codigo: string,
  ancho: number,
  alto: number,
): { x: number; y: number; w: number; h: number } {
  const n = layout.porCodigo.get(codigo);
  const w = Math.min(ancho, layout.ancho);
  const h = Math.min(alto, layout.alto);
  if (!n) return { x: 0, y: 0, w, h };
  const tope = (v: number, max: number) => Math.max(0, Math.min(v, Math.max(0, max)));
  return {
    x: tope(n.x + n.w / 2 - w / 2, layout.ancho - w),
    y: tope(n.y + n.h / 2 - h / 2, layout.alto - h),
    w,
    h,
  };
}

/**
 * Cuánto detalle entra en la tarjeta con el zoom actual.
 * Se decide por el ancho del viewBox, que no depende del tamaño de pantalla:
 * cuanto más chico, más cerca está la vista.
 */
export type Detalle = 'completo' | 'medio' | 'lejos';

export function detalleDe(anchoVista: number): Detalle {
  if (anchoVista <= 480) return 'completo';
  if (anchoVista <= 820) return 'medio';
  return 'lejos';
}
