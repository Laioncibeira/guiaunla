/**
 * Correlatividades: funciones puras sobre el plan de una carrera.
 *
 * La regla de la UNLa es simple: una materia se habilita cuando todas las que
 * figuran en su columna "Correlatividades" están aprobadas. Acá no se decide
 * nada más — el estado del estudiante (qué aprobó) entra como un conjunto de
 * códigos y sale qué puede cursar y qué le falta.
 */
import type { Carrera, Materia } from './datos';

export interface Vinculos {
  /** codigo -> materias que esa materia habilita (la vuelta de `correlativas`). */
  readonly habilita: ReadonlyMap<string, readonly string[]>;
  readonly porCodigo: ReadonlyMap<string, Materia>;
}

export function vincular(carrera: Carrera): Vinculos {
  const porCodigo = new Map(carrera.materias.map((m) => [m.codigo, m]));
  const habilita = new Map<string, string[]>(carrera.materias.map((m) => [m.codigo, []]));
  for (const m of carrera.materias)
    for (const c of m.correlativas) habilita.get(c)?.push(m.codigo);
  return { habilita, porCodigo };
}

/** Las materias que hay que aprobar antes de esta. Ignora códigos que no existan. */
export function necesita(v: Vinculos, codigo: string): readonly Materia[] {
  const m = v.porCodigo.get(codigo);
  if (!m) return [];
  return m.correlativas.map((c) => v.porCodigo.get(c)).filter((x): x is Materia => !!x);
}

/** Las materias que se destraban al aprobar esta. */
export function habilita(v: Vinculos, codigo: string): readonly Materia[] {
  return (v.habilita.get(codigo) ?? [])
    .map((c) => v.porCodigo.get(c))
    .filter((x): x is Materia => !!x);
}

/** Qué le falta aprobar a alguien para poder cursar esta materia. */
export function faltanPara(
  v: Vinculos,
  codigo: string,
  aprobadas: ReadonlySet<string>,
): readonly Materia[] {
  return necesita(v, codigo).filter((m) => !aprobadas.has(m.codigo));
}

export function puedeCursar(
  v: Vinculos,
  codigo: string,
  aprobadas: ReadonlySet<string>,
): boolean {
  if (aprobadas.has(codigo)) return false;
  return faltanPara(v, codigo, aprobadas).length === 0;
}

export function habilitadas(
  carrera: Carrera,
  v: Vinculos,
  aprobadas: ReadonlySet<string>,
): readonly Materia[] {
  return carrera.materias.filter((m) => puedeCursar(v, m.codigo, aprobadas));
}

/**
 * Todo lo que se destraba, directa o indirectamente, al aprobar esta materia:
 * sirve para responder "¿cuánto me abre esta?".
 */
export function alcance(v: Vinculos, codigo: string): ReadonlySet<string> {
  const vistos = new Set<string>();
  const pila = [...(v.habilita.get(codigo) ?? [])];
  while (pila.length) {
    const c = pila.pop() as string;
    if (vistos.has(c)) continue;
    vistos.add(c);
    pila.push(...(v.habilita.get(c) ?? []));
  }
  return vistos;
}

/**
 * Camino más corto de correlativas entre dos materias, si existe.
 * Devuelve los códigos del origen al destino, o null si no hay camino.
 */
export function camino(v: Vinculos, desde: string, hasta: string): readonly string[] | null {
  if (desde === hasta) return [desde];
  const previo = new Map<string, string>();
  const cola = [desde];
  const vistos = new Set([desde]);
  while (cola.length) {
    const c = cola.shift() as string;
    for (const sig of v.habilita.get(c) ?? []) {
      if (vistos.has(sig)) continue;
      vistos.add(sig);
      previo.set(sig, c);
      if (sig === hasta) {
        const ruta = [hasta];
        let p = hasta;
        while (previo.has(p)) {
          p = previo.get(p) as string;
          ruta.unshift(p);
        }
        return ruta;
      }
      cola.push(sig);
    }
  }
  return null;
}

/** Materias del plan que coinciden con lo que se escribió (nombre o código). */
export function buscar(carrera: Carrera, texto: string): readonly Materia[] {
  const q = texto
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .trim();
  if (!q) return [];
  return carrera.materias.filter(
    (m) =>
      m.codigo.toLowerCase().includes(q) ||
      m.nombre
        .normalize('NFD')
        .replace(/\p{Mn}/gu, '')
        .toLowerCase()
        .includes(q),
  );
}
