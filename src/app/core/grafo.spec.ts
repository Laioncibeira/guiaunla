import { describe, expect, it } from 'vitest';
import { anios, CARRERAS, carreraPorSlug } from './datos';
import type { Carrera } from './datos';
import { calcularLayout, detalleDe, encuadrar, partirNombre, TARJETA } from './grafo';

describe('layout del grafo', () => {
  it.each(CARRERAS.map((c) => [c.slug, c] as const))(
    '%s: cada materia entra una sola vez y en la columna de su año',
    (_slug, carrera) => {
      const l = calcularLayout(carrera);
      expect(l.nodos.length).toBe(carrera.materias.length);
      expect(new Set(l.nodos.map((n) => n.codigo)).size).toBe(carrera.materias.length);
      const columnas = new Map<number, number>();
      for (const n of l.nodos) {
        const previa = columnas.get(n.anio);
        if (previa === undefined) columnas.set(n.anio, n.x);
        else expect(n.x).toBe(previa);
      }
      expect(columnas.size).toBe(anios(carrera).length);
    },
  );

  it.each(CARRERAS.map((c) => [c.slug, c] as const))(
    '%s: ninguna ficha se superpone con otra',
    (_slug, carrera) => {
      const l = calcularLayout(carrera);
      const porColumna = new Map<number, typeof l.nodos>();
      for (const n of l.nodos)
        porColumna.set(n.x, [...(porColumna.get(n.x) ?? []), n] as typeof l.nodos);
      for (const col of porColumna.values()) {
        const ys = [...col].sort((a, b) => a.y - b.y);
        for (let i = 1; i < ys.length; i++)
          expect(ys[i].y).toBeGreaterThanOrEqual(ys[i - 1].y + ys[i - 1].h);
      }
    },
  );

  it.each(CARRERAS.map((c) => [c.slug, c] as const))(
    '%s: todo queda dentro del lienzo',
    (_slug, carrera) => {
      const l = calcularLayout(carrera);
      for (const n of l.nodos) {
        expect(n.x).toBeGreaterThanOrEqual(0);
        expect(n.y).toBeGreaterThanOrEqual(0);
        expect(n.x + n.w).toBeLessThanOrEqual(l.ancho);
        expect(n.y + n.h).toBeLessThanOrEqual(l.alto);
      }
    },
  );

  it('hay una arista por cada correlativa resuelta, con su curva', () => {
    const av = carreraPorSlug('audiovision') as Carrera;
    const l = calcularLayout(av);
    const esperadas = av.materias.reduce((a, m) => a + m.correlativas.length, 0);
    expect(l.aristas.length).toBe(esperadas);
    for (const a of l.aristas) expect(a.d.startsWith('M')).toBe(true);
  });

  it('el orden por baricentro acorta las líneas frente al orden del plan', () => {
    const av = carreraPorSlug('audiovision') as Carrera;
    const largo = (pasadas: number) => {
      const l = calcularLayout(av, TARJETA, pasadas);
      return l.aristas.reduce((total, a) => {
        const o = l.porCodigo.get(a.de);
        const d = l.porCodigo.get(a.a);
        return total + Math.abs((d?.y ?? 0) - (o?.y ?? 0));
      }, 0);
    };
    expect(largo(4)).toBeLessThan(largo(0));
  });

  it('parte el nombre en líneas que entran en la tarjeta', () => {
    expect(partirNombre('Montaje 1')).toEqual(['Montaje 1']);
    const l = partirNombre('Realización Integral Audiovisual 1');
    expect(l.length).toBeLessThanOrEqual(2);
    for (const x of l) expect(x.length).toBeLessThanOrEqual(20);
  });

  it('el detalle de la tarjeta depende de cuán cerca esté la vista', () => {
    expect(detalleDe(340)).toBe('completo');
    expect(detalleDe(600)).toBe('medio');
    expect(detalleDe(1100)).toBe('lejos');
  });
});

describe('encuadre', () => {
  const av = carreraPorSlug('audiovision') as Carrera;
  const l = calcularLayout(av);

  it('centra la materia pedida', () => {
    const n = l.porCodigo.get('16');
    const v = encuadrar(l, '16', 200, 200);
    expect(v.x + v.w / 2).toBeCloseTo((n?.x ?? 0) + (n?.w ?? 0) / 2, 0);
  });

  it('no se sale por los bordes', () => {
    for (const codigo of ['01', '58', '16']) {
      const v = encuadrar(l, codigo, 200, 200);
      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.x + v.w).toBeLessThanOrEqual(l.ancho + 0.001);
      expect(v.y + v.h).toBeLessThanOrEqual(l.alto + 0.001);
    }
  });

  it('con un código que no existe encuadra el origen', () => {
    expect(encuadrar(l, 'XX', 100, 100)).toEqual({ x: 0, y: 0, w: 100, h: 100 });
  });

  it('nunca pide más lienzo del que hay', () => {
    const v = encuadrar(l, '01', 9999, 9999);
    expect(v.w).toBe(l.ancho);
    expect(v.h).toBe(l.alto);
  });
});
