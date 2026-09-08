import type { TipoEvento } from '../core/datos';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Una fecha ISO se parte a mano: `new Date('2026-03-16')` la lee como UTC y en
 *  Argentina puede mostrar el día anterior. */
const partes = (iso: string) => iso.split('-').map(Number) as [number, number, number];

export const fechaCorta = (iso: string): string => {
  const [, m, d] = partes(iso);
  return `${d} ${MESES[m - 1]}`;
};

export const fechaLarga = (iso: string): string => {
  const [a, m, d] = partes(iso);
  return `${d} de ${MESES_LARGOS[m - 1]} de ${a}`;
};

/** Días desde hoy hasta esa fecha. Negativo si ya pasó. */
export const diasHasta = (iso: string, hoy = new Date()): number => {
  const [a, m, d] = partes(iso);
  const objetivo = Date.UTC(a, m - 1, d);
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo - base) / 86400000);
};

export const ETIQUETA_TIPO: Record<TipoEvento, string> = {
  inscripcion: 'Inscripción',
  examen: 'Finales',
  cursada: 'Cursada',
  receso: 'Receso',
  fecha: 'Fecha',
  ingreso: 'Ingreso',
};

export const COLOR_TIPO: Record<TipoEvento, string> = {
  inscripcion: 'var(--naranja)',
  examen: 'var(--marca)',
  cursada: 'var(--verde)',
  receso: 'var(--texto-3)',
  fecha: 'var(--texto-3)',
  ingreso: 'var(--verde)',
};

/** Un evento del calendario como archivo .ics, para agendarlo sin dar permisos. */
export function comoIcs(e: {
  id: string;
  titulo: string;
  detalle?: string;
  desde: string;
  hasta: string;
}): string {
  const sinGuiones = (iso: string) => iso.replaceAll('-', '');
  const [a, m, d] = partes(e.hasta);
  // DTEND en eventos de día completo es exclusivo: hay que sumar un día.
  const finExclusivo = new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
  const escapar = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Guia UNLa//Humanidades y Artes//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.id}@guiaunla`,
    `DTSTAMP:${sinGuiones(new Date().toISOString().slice(0, 10))}T000000Z`,
    `DTSTART;VALUE=DATE:${sinGuiones(e.desde)}`,
    `DTEND;VALUE=DATE:${sinGuiones(finExclusivo)}`,
    `SUMMARY:${escapar(e.titulo)}`,
    ...(e.detalle ? [`DESCRIPTION:${escapar(e.detalle)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
