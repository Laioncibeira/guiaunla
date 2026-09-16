import { describe, expect, it } from 'vitest';
import { comoIcs, diasHasta, fechaCorta, fechaLarga, transcurrido } from './formato';

describe('fechas', () => {
  it('parte la fecha ISO sin pasar por la zona horaria', () => {
    expect(fechaCorta('2026-03-16')).toBe('16 mar');
    expect(fechaLarga('2026-03-16')).toBe('16 de marzo de 2026');
  });

  it('cuenta días desde hoy con calendario, no con horas', () => {
    const hoy = new Date(2026, 8, 16, 23, 30);
    expect(diasHasta('2026-09-16', hoy)).toBe(0);
    expect(diasHasta('2026-09-17', hoy)).toBe(1);
    expect(diasHasta('2026-09-15', hoy)).toBe(-1);
  });
});

describe('reloj: tiempo transcurrido', () => {
  const ley = new Date('2025-10-21T00:00:00-03:00');

  it('reproduce el contador original: 329 días, 23 h y 18 min al guardarlo', () => {
    const guardado = new Date('2026-09-15T23:18:07-03:00');
    expect(transcurrido(ley, guardado)).toEqual({ dias: 329, horas: 23, minutos: 18 });
  });

  it('no cuenta los segundos y redondea hacia abajo', () => {
    expect(transcurrido(ley, new Date('2025-10-21T00:00:59-03:00'))).toEqual({
      dias: 0,
      horas: 0,
      minutos: 0,
    });
    expect(transcurrido(ley, new Date('2025-10-22T01:02:59-03:00'))).toEqual({
      dias: 1,
      horas: 1,
      minutos: 2,
    });
  });

  it('nunca da negativo si el reloj del teléfono está atrasado', () => {
    expect(transcurrido(ley, new Date('2020-01-01T00:00:00Z'))).toEqual({
      dias: 0,
      horas: 0,
      minutos: 0,
    });
  });
});

describe('archivo de calendario', () => {
  it('cierra el evento un día después porque DTEND es exclusivo', () => {
    const ics = comoIcs({ id: 'x', titulo: 'Clases', desde: '2026-08-12', hasta: '2026-11-24' });
    expect(ics).toContain('DTSTART;VALUE=DATE:20260812');
    expect(ics).toContain('DTEND;VALUE=DATE:20261125');
  });

  it('escapa comas y saltos de línea en el detalle', () => {
    const ics = comoIcs({ id: 'x', titulo: 'A, B', desde: '2026-01-01', hasta: '2026-01-01', detalle: 'uno\ndos' });
    expect(ics).toContain('SUMMARY:A\\, B');
    expect(ics).toContain('DESCRIPTION:uno\\ndos');
  });
});
