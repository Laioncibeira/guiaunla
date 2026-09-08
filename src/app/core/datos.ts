/**
 * Los datos son archivos JSON del repo, importados de forma estática.
 * No hay red ni base de datos: al compilar quedan dentro del bundle, así que
 * la app abre igual sin señal y las páginas se pueden pre-generar.
 */
import audiovision from '../../data/carreras/audiovision.json';
import disenoComunicacion from '../../data/carreras/diseno-y-comunicacion-visual.json';
import disenoIndustrial from '../../data/carreras/diseno-industrial.json';
import traductorado from '../../data/carreras/traductorado-publico-en-idioma-ingles.json';
import calendario2026 from '../../data/calendario/2026.json';
import campusJson from '../../data/campus/edificios.json';
import departamentosJson from '../../data/departamentos.json';

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
}

export interface Carrera {
  readonly slug: string;
  readonly nombre: string;
  readonly nombreCorto: string;
  readonly departamento: string;
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

export const CARRERAS: readonly Carrera[] = [
  audiovision,
  disenoComunicacion,
  disenoIndustrial,
  traductorado,
] as unknown as readonly Carrera[];

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
  edificios: readonly Edificio[];
};

export const DEPARTAMENTOS = departamentosJson.departamentos;

export const carreraPorSlug = (slug: string): Carrera | undefined =>
  CARRERAS.find((c) => c.slug === slug);

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
