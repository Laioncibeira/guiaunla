/**
 * Arma un CSV que Excel en castellano abre bien de una:
 *  - BOM UTF-8 para que reconozca los acentos,
 *  - punto y coma como separador (con coma, Excel es-AR mete todo en una columna),
 *  - todo entre comillas, comillas internas duplicadas, fin de línea CRLF,
 *  - y un apóstrofo delante de lo que Excel tomaría como fórmula: alguien
 *    puede escribir "=HYPERLINK(...)" en el formulario a propósito.
 */
export function aCsv(filas: readonly (readonly string[])[]): string {
  const celda = (v: string) => {
    let t = v.replace(/\r?\n/g, ' ').trim();
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
    return '"' + t.replace(/"/g, '""') + '"';
  };
  return '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n') + '\r\n';
}

/** Fecha y hora en Argentina, como la lee una persona: 16/09/2026 14:05. */
export function fechaHoraAr(d: Date): string {
  const p = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${g('day')}/${g('month')}/${g('year')} ${g('hour')}:${g('minute')}`;
}

/** Ofrece el archivo para bajar. Sólo tiene sentido en el navegador. */
export function descargar(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
