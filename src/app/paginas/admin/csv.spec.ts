import { describe, expect, it } from 'vitest';
import { aCsv, fechaHoraAr } from './csv';

describe('CSV para Excel', () => {
  it('empieza con el BOM y separa con punto y coma', () => {
    const csv = aCsv([['fecha', 'mensaje'], ['hoy', 'hola']]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toBe('﻿"fecha";"mensaje"\r\n"hoy";"hola"\r\n');
  });

  it('duplica las comillas internas y aplana los saltos de línea', () => {
    expect(aCsv([['dijo "hola"\ny se fue']])).toContain('"dijo ""hola"" y se fue"');
  });

  it('neutraliza lo que Excel tomaría como fórmula', () => {
    expect(aCsv([['=HYPERLINK("x")']])).toContain('"\'=HYPERLINK(""x"")"');
    expect(aCsv([['+54 11 5555']])).toContain('"\'+54 11 5555"');
    expect(aCsv([['-3']])).toContain('"\'-3"');
    expect(aCsv([['@usuario']])).toContain('"\'@usuario"');
  });

  it('deja en paz el texto normal con acentos', () => {
    expect(aCsv([['Diseño y Comunicación']])).toContain('"Diseño y Comunicación"');
  });

  it('formatea la fecha en hora argentina', () => {
    // 2026-09-16 17:05 UTC son las 14:05 en Buenos Aires.
    expect(fechaHoraAr(new Date('2026-09-16T17:05:00Z'))).toBe('16/09/2026 14:05');
  });
});
