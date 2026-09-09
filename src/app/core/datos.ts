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
import horariosAudiovision from '../../data/horarios/audiovision.json';
import horariosDisenoComunicacion from '../../data/horarios/diseno-y-comunicacion-visual.json';
import horariosTraductorado from '../../data/horarios/traductorado-publico-en-idioma-ingles.json';
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

// ---------------------------------------------------------------- horarios
export type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';
export type Turno = 'manana' | 'tarde' | 'noche';

export interface Ubicacion {
  readonly textoOriginal: string;
  readonly aula?: string;
  readonly edificio?: string;
  readonly espacioAudiovision?: boolean;
  readonly virtual?: boolean;
}

export interface Clase {
  readonly dia: Dia;
  readonly turno: Turno;
  /** Nombre tal como figura en la grilla, a veces recortado. */
  readonly materiaTexto: string;
  readonly materiaCodigo?: string;
  /** Optativa, seminario o curso que no está en el plan publicado. */
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

export const HORARIOS: readonly Horarios[] = [
  horariosAudiovision,
  horariosDisenoComunicacion,
  horariosTraductorado,
] as unknown as readonly Horarios[];

export const horariosDe = (slug: string): Horarios | undefined =>
  HORARIOS.find((h) => h.carrera === slug);

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
export function dictadasAhora(slug: string): ReadonlySet<string> {
  const h = horariosDe(slug);
  return new Set(
    (h?.clases ?? []).map((c) => c.materiaCodigo).filter((c): c is string => !!c),
  );
}

// -------------------------------------------------------- año y cuatrimestre
/**
 * El año de cursada de una materia.
 *
 * Los planes de Audiovisión, Diseño y Comunicación Visual y Diseño Industrial
 * están publicados por año; el del Traductorado, por cuatrimestre. Acá los dos
 * se leen igual.
 */
export const anioDe = (carrera: Carrera, m: Materia): number =>
  carrera.tipoNivel === 'anio' ? m.nivel : Math.ceil(m.nivel / 2);

/**
 * En qué cuatrimestre del año se cursa, o null cuando el plan publicado no lo
 * dice. La universidad sólo lo detalla en el Traductorado.
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
