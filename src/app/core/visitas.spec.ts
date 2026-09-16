import { describe, expect, it } from 'vitest';
import { claveDeRuta, diaUtc } from './visitas-clave';

describe('clave de pantalla para el contador', () => {
  it('la raíz es inicio', () => {
    expect(claveDeRuta('/')).toBe('inicio');
    expect(claveDeRuta('')).toBe('inicio');
  });

  it('aplana la ruta a minúsculas con guiones, sin parámetros', () => {
    expect(claveDeRuta('/carreras/audiovision/correlatividades?materia=16')).toBe('carreras-audiovision-correlatividades');
    expect(claveDeRuta('/fechas#hoy')).toBe('fechas');
  });

  it('no cuenta el panel', () => {
    expect(claveDeRuta('/admin')).toBeNull();
    expect(claveDeRuta('/admin/contactos')).toBeNull();
  });

  it('respeta el largo y los caracteres que aceptan las reglas', () => {
    const clave = claveDeRuta('/' + 'á'.repeat(60)) ?? '';
    expect(clave.length).toBeLessThanOrEqual(40);
    expect(clave).toMatch(/^[a-z0-9-]+$/);
  });

  it('el día va en UTC como en las reglas', () => {
    expect(diaUtc(new Date('2026-09-16T23:30:00-03:00'))).toBe('2026-09-17');
  });
});
