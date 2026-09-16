/**
 * Explorar el plan: selección múltiple, ramas de correlativas y simulación.
 *
 * Funciones puras sobre el plan y el conjunto de materias aprobadas. No tocan
 * el DOM ni guardan estado: la pantalla les pasa qué está prendido y ellas
 * devuelven qué mostrar. Se testean sin navegador.
 *
 * El modelo viene del grafo de la plataforma de Sistemas, adaptado a estos
 * planes: acá los códigos son texto ("01", "8134", "S01") y el eje del mapa es
 * el año, porque de las cuatro carreras sólo el Traductorado publica en qué
 * cuatrimestre se cursa cada materia.
 */
import type { Carrera, Materia } from './datos';
import { anioDe, cuatrimestreDe } from './datos';
import { habilita, necesita, puedeCursar, vincular, type Vinculos } from './correlatividades';

/**
 * Las prendidas más sus correlativas directas y lo que destraban directo.
 * Un salto en cada dirección. `null` cuando no hay nada prendido, que es
 * distinto de "no quedó nada": sin selección no se atenúa nada.
 */
export function calcularRelacionadas(
  seleccion: ReadonlySet<string>,
  carrera: Carrera,
  v: Vinculos = vincular(carrera),
): ReadonlySet<string> | null {
  if (seleccion.size === 0) return null;
  const set = new Set<string>(seleccion);
  for (const codigo of seleccion) {
    for (const m of necesita(v, codigo)) set.add(m.codigo);
    for (const m of habilita(v, codigo)) set.add(m.codigo);
  }
  return set;
}

/**
 * La rama completa de cada prendida: toda la cadena de correlativas hacia
 * atrás, más lo que destraba directo hacia adelante.
 */
export function calcularRama(
  seleccion: ReadonlySet<string>,
  carrera: Carrera,
  v: Vinculos = vincular(carrera),
): ReadonlySet<string> | null {
  if (seleccion.size === 0) return null;
  const set = new Set<string>();
  const haciaAtras = (codigo: string): void => {
    if (set.has(codigo)) return;
    set.add(codigo);
    for (const m of necesita(v, codigo)) haciaAtras(m.codigo);
  };
  for (const codigo of seleccion) {
    haciaAtras(codigo);
    for (const m of habilita(v, codigo)) set.add(m.codigo);
  }
  return set;
}

/** Un nodo del árbol de correlativas: la materia y, de hijos, lo que pide. */
export interface Nodo {
  readonly materia: Materia;
  /** Profundidad desde la raíz. 0 es la materia elegida. */
  readonly nivel: number;
  readonly aprobada: boolean;
  readonly hijos: readonly Nodo[];
}

/**
 * El árbol de correlativas de una materia: la raíz es ella y cada hijo es una
 * correlativa, hacia atrás hasta las que no piden nada.
 *
 * `ancestros` corta ciclos. El plan es un grafo sin ciclos y el validador lo
 * verifica, pero si un dato llegara mal esto no se cuelga.
 */
export function construirArbol(
  codigo: string,
  carrera: Carrera,
  aprobadas: ReadonlySet<string> = new Set(),
  v: Vinculos = vincular(carrera),
): Nodo | null {
  const armar = (cod: string, nivel: number, ancestros: ReadonlySet<string>): Nodo | null => {
    const materia = v.porCodigo.get(cod);
    if (!materia || ancestros.has(cod)) return null;
    const siguientes = new Set(ancestros).add(cod);
    return {
      materia,
      nivel,
      aprobada: aprobadas.has(cod),
      hijos: necesita(v, cod)
        .map((m) => armar(m.codigo, nivel + 1, siguientes))
        .filter((n): n is Nodo => n !== null),
    };
  };
  return armar(codigo, 0, new Set());
}

/** Una fila del explorador: la materia con lo que pide y lo que destraba. */
export interface Fila {
  readonly materia: Materia;
  readonly anio: number;
  readonly cuatrimestre: number | null;
  readonly aprobada: boolean;
  readonly puedeCursar: boolean;
  readonly necesita: readonly Materia[];
  readonly destraba: readonly Materia[];
  /** No pasa el filtro activo: se muestra apagada, no se esconde. */
  readonly atenuada: boolean;
}

/**
 * Las filas del explorador, ordenadas como el plan.
 * `codigosFiltrados` en `null` significa sin filtro: no se atenúa nada.
 */
export function construirFilas(
  carrera: Carrera,
  aprobadas: ReadonlySet<string>,
  codigosFiltrados: ReadonlySet<string> | null,
  v: Vinculos = vincular(carrera),
): readonly Fila[] {
  return carrera.materias.map((materia) => ({
    materia,
    anio: anioDe(carrera, materia),
    cuatrimestre: cuatrimestreDe(carrera, materia),
    aprobada: aprobadas.has(materia.codigo),
    puedeCursar: puedeCursar(v, materia.codigo, aprobadas),
    necesita: necesita(v, materia.codigo),
    destraba: habilita(v, materia.codigo),
    atenuada: codigosFiltrados !== null && !codigosFiltrados.has(materia.codigo),
  }));
}

/** Una materia que lo seleccionado destraba sólo en parte. */
export interface Parcial {
  readonly materia: Materia;
  /** Lo que todavía le falta, sin contar lo seleccionado. */
  readonly faltan: readonly Materia[];
}

export interface Simulacion {
  /** Lo que las seleccionadas destraban directo (dependientes inmediatas). */
  readonly habilitaDirecto: readonly Materia[];
  /** Lo que pasaría a poder cursarse si aprobaras lo seleccionado. */
  readonly desbloqueadas: readonly Materia[];
  /** Dependientes directas que igual seguirían pidiendo otra correlativa. */
  readonly parciales: readonly Parcial[];
  readonly aprobadasAntes: number;
  readonly aprobadasDespues: number;
  readonly total: number;
}

/**
 * "Si apruebo las seleccionadas, ¿qué se me abre?".
 *
 * Distingue tres cosas que en la pantalla se confundían: lo que las
 * seleccionadas destraban DIRECTO (son correlativa de eso), lo que de verdad
 * pasa a poder cursarse (todas sus correlativas cubiertas) y lo que queda a
 * medias porque además pide otra que no está. Las seleccionadas no se cuentan
 * a sí mismas: ya las estás dando por aprobadas.
 */
export function simular(
  carrera: Carrera,
  aprobadas: ReadonlySet<string>,
  seleccion: ReadonlySet<string>,
  v: Vinculos = vincular(carrera),
): Simulacion {
  const despues = new Set([...aprobadas, ...seleccion]);

  const directas = new Map<string, Materia>();
  for (const codigo of seleccion)
    for (const m of habilita(v, codigo)) if (!despues.has(m.codigo)) directas.set(m.codigo, m);
  const habilitaDirecto = [...directas.values()];

  const desbloqueadas = carrera.materias.filter(
    (m) =>
      !despues.has(m.codigo) &&
      !puedeCursar(v, m.codigo, aprobadas) &&
      puedeCursar(v, m.codigo, despues),
  );

  const parciales: Parcial[] = habilitaDirecto
    .filter((m) => !puedeCursar(v, m.codigo, despues))
    .map((m) => ({
      materia: m,
      faltan: necesita(v, m.codigo).filter((x) => !despues.has(x.codigo)),
    }));

  return {
    habilitaDirecto,
    desbloqueadas,
    parciales,
    aprobadasAntes: aprobadas.size,
    aprobadasDespues: despues.size,
    total: carrera.materias.length,
  };
}

export type Filtro = 'puedo-cursar' | 'se-dicta';

/**
 * Los códigos que pasan los filtros prendidos. `null` sin filtros.
 * Varios filtros suman: una materia pasa si cumple alguno.
 */
export function aplicarFiltros(
  filas: readonly Fila[],
  filtros: ReadonlySet<Filtro>,
  seDicta: ReadonlySet<string>,
): ReadonlySet<string> | null {
  if (filtros.size === 0) return null;
  const pasa = (f: Fila) =>
    (filtros.has('puedo-cursar') && f.puedeCursar) ||
    (filtros.has('se-dicta') && seDicta.has(f.materia.codigo));
  return new Set(filas.filter(pasa).map((f) => f.materia.codigo));
}
