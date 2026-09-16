/**
 * Los datos son archivos JSON del repo: no hay red ni base de datos para
 * leerlos. El índice de carreras, el calendario y el campus entran en el
 * bundle inicial. Los planes y las grillas de horarios se cargan por carrera
 * con `import()`: el compilador arma un archivo por carrera y sólo se baja
 * el de la que se está mirando. Ver `Planes` en `planes.ts`.
 */
import calendario2026 from '../../data/calendario/2026.json';
import campusJson from '../../data/campus/edificios.json';
import departamentosJson from '../../data/departamentos.json';
import indiceJson from '../../data/carreras/indice.json';

export interface Materia {
  readonly codigo: string;
  readonly nombre: string;
  readonly dedicacion: 'cuatrimestral' | 'anual';
  /** Año (1..5) o cuatrimestre (1..8), según `tipoNivel` de la carrera. */
  readonly nivel: number;
  readonly correlativas: readonly string[];
  readonly formato?: string;
  readonly horasSemanales?: number;
  readonly horasTotales?: number;
  readonly regimen?: string;
  readonly mencion?: string;
  readonly cicloOrientado?: boolean;
  readonly optativa?: boolean;
  readonly sinCodigoOficial?: boolean;
  readonly correlativasNoResueltas?: readonly string[];
  /** Nutrición publica dos correlatividades: las de cursar (`correlativas`) y estas. */
  readonly correlativasParaRendir?: readonly string[];
  /** Área de conocimiento, cuando el plan la indica (Sistemas). */
  readonly area?: string;
}

export type TipoCarrera = 'licenciatura' | 'tecnicatura' | 'ingenieria' | 'traductorado';

export interface Carrera {
  readonly slug: string;
  readonly nombre: string;
  readonly nombreCorto: string;
  readonly departamento: string;
  readonly tipo: TipoCarrera;
  readonly titulo: string;
  readonly tituloIntermedio?: { readonly nombre: string; readonly hastaNivel: number };
  readonly duracionAnios: number;
  readonly horasTotales?: number;
  readonly menciones?: readonly string[];
  readonly orientaciones?: readonly string[];
  readonly nota?: string;
  readonly tipoNivel: 'anio' | 'cuatrimestre';
  readonly niveles: number;
  readonly fuenteUrl: string;
  readonly fuenteFecha: string;
  /** El plan coincide, código por código, con la tabla publicada por la universidad. */
  readonly cotejado: boolean;
  readonly materias: readonly Materia[];
}

export type TipoEvento = 'inscripcion' | 'examen' | 'cursada' | 'receso' | 'fecha' | 'ingreso';

export interface Evento {
  readonly id: string;
  readonly titulo: string;
  readonly detalle?: string;
  readonly desde: string;
  readonly hasta: string;
  readonly tipo: TipoEvento;
  readonly departamento?: string;
}

export interface Edificio {
  readonly num: number;
  readonly id: string;
  readonly nombre: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly aulas?: boolean;
  readonly verde?: boolean;
  readonly nota?: string;
  readonly comoLlegar?: string;
  readonly departamentos?: readonly string[];
}

/** Lo que se sabe de una carrera sin cargar su plan: alcanza para listarla. */
export interface ResumenCarrera {
  readonly slug: string;
  readonly nombre: string;
  readonly nombreCorto: string;
  readonly departamento: string;
  readonly tipo: TipoCarrera;
  /** Cantidad de materias del plan. */
  readonly materias: number;
  readonly duracionAnios: number;
  readonly tieneCorrelativas: boolean;
  readonly tituloIntermedio: boolean;
  /** Hay grilla de horarios cargada en `src/data/horarios`. */
  readonly tieneGrilla: boolean;
}

/** Las 24 carreras, en el orden del índice generado por tools/extraer-plan.mjs. */
export const INDICE: readonly ResumenCarrera[] = indiceJson as readonly ResumenCarrera[];

export const resumenPorSlug = (slug: string | null | undefined): ResumenCarrera | undefined =>
  slug ? INDICE.find((c) => c.slug === slug) : undefined;

export const NOMBRE_TIPO: Record<TipoCarrera, string> = {
  licenciatura: 'Licenciatura',
  tecnicatura: 'Tecnicatura',
  ingenieria: 'Ingeniería',
  traductorado: 'Traductorado',
};

/**
 * El plan completo de una carrera. La ruta con plantilla hace que el
 * compilador genere un archivo por cada JSON de la carpeta y lo cargue recién
 * cuando se pide. Un slug que no está en el índice no llega a pedirse.
 */
export async function cargarPlan(slug: string): Promise<Carrera | null> {
  if (!resumenPorSlug(slug)) return null;
  const modulo = await import(`../../data/carreras/${slug}.json`);
  return modulo.default as Carrera;
}

export const CALENDARIO = calendario2026 as unknown as {
  anio: number;
  fuenteUrl: string;
  nota: string;
  eventos: readonly Evento[];
};

export const CAMPUS = campusJson as unknown as {
  predio: string;
  direccion: string;
  fuenteUrl: string;
  nota: string;
  viewBox: string;
  calles: readonly { nombre: string; lado: string }[];
  accesos: readonly { id: string; nombre: string; detalle: string; x: number; y: number; principal?: boolean }[];
  /** Lugares de cursada que no están en el predio, como el MUD. */
  externos: readonly { id: string; nombre: string; sigla: string; detalle: string }[];
  edificios: readonly Edificio[];
};

export const DEPARTAMENTOS = departamentosJson.departamentos;

// ---------------------------------------------------------------- horarios
export type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';
export type Turno = 'manana' | 'tarde' | 'noche';

export interface Ubicacion {
  readonly textoOriginal: string;
  readonly aula?: string;
  readonly edificio?: string;
  /** Lugar de cursada que no está en el predio, como el MUD. */
  readonly externo?: string;
  readonly espacioAudiovision?: boolean;
  readonly virtual?: boolean;
}

export interface Clase {
  readonly dia: Dia;
  readonly turno: Turno;
  /** Nombre tal como figura en la grilla, a veces recortado. */
  readonly materiaTexto: string;
  readonly materiaCodigo?: string;
  /**
   * No coincide con ninguna materia del plan vigente: puede ser una optativa,
   * un seminario, o un nombre del plan anterior, porque la grilla del
   * Departamento todavía usa los dos.
   */
  readonly fueraDePlan?: boolean;
  readonly ubicaciones: readonly Ubicacion[];
}

export interface Horarios {
  readonly carrera: string;
  readonly periodo: string;
  readonly periodoNombre: string;
  readonly fuente: string;
  readonly fuenteFecha: string;
  readonly nota: string;
  readonly clases: readonly Clase[];
}

/** La grilla de horarios de una carrera, o null si todavía no se cargó ninguna. */
export async function cargarGrilla(slug: string): Promise<Horarios | null> {
  if (!resumenPorSlug(slug)?.tieneGrilla) return null;
  const modulo = await import(`../../data/horarios/${slug}.json`);
  return modulo.default as Horarios;
}

export const DIAS: readonly Dia[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

export const NOMBRE_DIA: Record<Dia, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
};

export const DIA_CORTO: Record<Dia, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
};

export const TURNOS: readonly Turno[] = ['manana', 'tarde', 'noche'];

export const NOMBRE_TURNO: Record<Turno, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
};

/** Las materias que se están dictando este cuatrimestre, según la grilla. */
export function dictadasEn(h: Horarios | null | undefined): ReadonlySet<string> {
  return new Set(
    (h?.clases ?? []).map((c) => c.materiaCodigo).filter((c): c is string => !!c),
  );
}

// -------------------------------------------------------- año y cuatrimestre
/**
 * El año de cursada de una materia.
 *
 * Algunos planes están publicados por año (Audiovisión, los Diseños) y otros
 * por cuatrimestre (Traductorado, Nutrición). Acá los dos se leen igual.
 */
export const anioDe = (carrera: Carrera, m: Materia): number =>
  carrera.tipoNivel === 'anio' ? m.nivel : Math.ceil(m.nivel / 2);

/**
 * En qué cuatrimestre del año se cursa, o null cuando el plan publicado no lo
 * dice.
 */
export const cuatrimestreDe = (carrera: Carrera, m: Materia): number | null =>
  carrera.tipoNivel === 'cuatrimestre' ? ((m.nivel - 1) % 2) + 1 : null;

/** True cuando el plan de esa carrera separa las materias por cuatrimestre. */
export const tieneCuatrimestres = (carrera: Carrera): boolean =>
  carrera.tipoNivel === 'cuatrimestre';

export const anios = (carrera: Carrera): readonly number[] => {
  const total = carrera.tipoNivel === 'anio' ? carrera.niveles : Math.ceil(carrera.niveles / 2);
  return Array.from({ length: total }, (_, i) => i + 1);
};

export const materiasDe = (carrera: Carrera, anio: number, cuatrimestre?: number) =>
  carrera.materias.filter(
    (m) =>
      anioDe(carrera, m) === anio &&
      (cuatrimestre === undefined || cuatrimestreDe(carrera, m) === cuatrimestre),
  );

/** "3° año" / "5° cuatrimestre", según cómo agrupa el plan de esa carrera. */
export const nombreNivel = (carrera: Carrera, nivel: number): string =>
  carrera.tipoNivel === 'anio' ? `${nivel}° año` : `${nivel}° cuatrimestre`;

export const nombreNivelCorto = (carrera: Carrera, nivel: number): string =>
  carrera.tipoNivel === 'anio' ? `${nivel}° año` : `${nivel}° cuat.`;

/** Sin acentos y en minúsculas, para buscar sin que importe cómo se escriba. */
export const plano = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
