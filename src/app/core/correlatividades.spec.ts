import { describe, expect, it } from 'vitest';
import type { Carrera } from './datos';
import { CARRERAS, carreraPorSlug } from './datos';
import {
  alcance,
  buscar,
  camino,
  faltanPara,
  habilita,
  habilitadas,
  necesita,
  puedeCursar,
  vincular,
} from './correlatividades';

/** Plan mínimo inventado, para fijar las reglas sin depender de los datos reales. */
const plan = (materias: Carrera['materias']): Carrera => ({
  slug: 'prueba',
  nombre: 'Prueba',
  nombreCorto: 'Prueba',
  departamento: 'humanidades-y-artes',
  titulo: 'Título',
  duracionAnios: 2,
  tipoNivel: 'anio',
  niveles: 2,
  fuenteUrl: '',
  fuenteFecha: '',
  cotejado: false,
  materias,
});

const m = (codigo: string, nivel: number, correlativas: string[] = [], nombre = 'Materia ' + codigo) =>
  ({ codigo, nombre, dedicacion: 'cuatrimestral' as const, nivel, correlativas });

const cadena = plan([
  m('01', 1),
  m('02', 1),
  m('03', 1, ['01']),
  m('04', 2, ['03']),
  m('05', 2, ['01', '02']),
  m('06', 2, ['99']), // correlativa que no existe en el plan
]);

describe('vínculos del plan', () => {
  it('da vuelta las correlativas para saber qué habilita cada materia', () => {
    const v = vincular(cadena);
    expect(habilita(v, '01').map((x) => x.codigo)).toEqual(['03', '05']);
    expect(habilita(v, '04')).toEqual([]);
  });

  it('ignora correlativas que apuntan a códigos inexistentes', () => {
    const v = vincular(cadena);
    expect(necesita(v, '06')).toEqual([]);
  });

  it('devuelve vacío para una materia que no está en el plan', () => {
    const v = vincular(cadena);
    expect(necesita(v, 'XX')).toEqual([]);
    expect(habilita(v, 'XX')).toEqual([]);
  });
});

describe('qué puedo cursar', () => {
  it('una materia sin correlativas está habilitada desde el principio', () => {
    const v = vincular(cadena);
    expect(puedeCursar(v, '01', new Set())).toBe(true);
  });

  it('una materia con correlativas pendientes no está habilitada', () => {
    const v = vincular(cadena);
    expect(puedeCursar(v, '04', new Set())).toBe(false);
    expect(faltanPara(v, '04', new Set()).map((x) => x.codigo)).toEqual(['03']);
  });

  it('se habilita cuando están todas sus correlativas, no algunas', () => {
    const v = vincular(cadena);
    expect(puedeCursar(v, '05', new Set(['01']))).toBe(false);
    expect(puedeCursar(v, '05', new Set(['01', '02']))).toBe(true);
  });

  it('una materia ya aprobada deja de figurar como habilitada', () => {
    const v = vincular(cadena);
    expect(puedeCursar(v, '01', new Set(['01']))).toBe(false);
  });

  it('lista todas las habilitadas con un estado dado', () => {
    const v = vincular(cadena);
    expect(habilitadas(cadena, v, new Set(['01'])).map((x) => x.codigo)).toEqual(['02', '03', '06']);
  });
});

describe('alcance y camino', () => {
  it('alcance junta lo que se destraba en cadena', () => {
    const v = vincular(cadena);
    expect([...alcance(v, '01')].sort()).toEqual(['03', '04', '05']);
  });

  it('alcance de una hoja es vacío', () => {
    expect(alcance(vincular(cadena), '04').size).toBe(0);
  });

  it('encuentra el camino entre dos materias encadenadas', () => {
    expect(camino(vincular(cadena), '01', '04')).toEqual(['01', '03', '04']);
  });

  it('devuelve null cuando no hay camino', () => {
    expect(camino(vincular(cadena), '02', '04')).toBeNull();
  });

  it('el camino de una materia a sí misma es ella sola', () => {
    expect(camino(vincular(cadena), '02', '02')).toEqual(['02']);
  });
});

describe('buscador', () => {
  const conNombres = plan([m('01', 1, [], 'Educación Auditiva'), m('02', 1, [], 'Montaje 1')]);

  it('encuentra sin acentos y sin importar mayúsculas', () => {
    expect(buscar(conNombres, 'educacion').map((x) => x.codigo)).toEqual(['01']);
    expect(buscar(conNombres, 'AUDITIVA').map((x) => x.codigo)).toEqual(['01']);
  });

  it('encuentra por código', () => {
    expect(buscar(conNombres, '02').map((x) => x.codigo)).toEqual(['02']);
  });

  it('con texto vacío no devuelve nada', () => {
    expect(buscar(conNombres, '   ')).toEqual([]);
  });
});

describe('los planes publicados', () => {
  it('trae las cuatro carreras de Humanidades y Artes', () => {
    expect(CARRERAS.map((c) => c.slug)).toEqual([
      'audiovision',
      'diseno-y-comunicacion-visual',
      'diseno-industrial',
      'traductorado-publico-en-idioma-ingles',
    ]);
  });

  it.each(CARRERAS.map((c) => [c.slug, c] as const))(
    '%s: toda correlativa apunta a una materia del plan y no hay ciclos',
    (_slug, carrera) => {
      const codigos = new Set(carrera.materias.map((x) => x.codigo));
      expect(codigos.size).toBe(carrera.materias.length);
      for (const materia of carrera.materias) {
        for (const c of materia.correlativas) {
          expect(codigos.has(c)).toBe(true);
          expect(c).not.toBe(materia.codigo);
        }
      }
      // Una correlativa siempre viene de un nivel anterior o del mismo: si alguna
      // apuntara "hacia adelante" el plan tendría un ciclo y el grafo no cerraría.
      const v = vincular(carrera);
      for (const materia of carrera.materias)
        expect(alcance(v, materia.codigo).has(materia.codigo)).toBe(false);
    },
  );

  it('Audiovisión: Realización Integral 1 pide las tres del segundo año', () => {
    const av = carreraPorSlug('audiovision') as Carrera;
    const v = vincular(av);
    expect(necesita(v, '16').map((x) => x.codigo)).toEqual(['11', '13', '15']);
    expect(habilita(v, '16').map((x) => x.codigo)).toEqual(['24', '35']);
  });

  it('con el plan vacío, primer año está habilitado y el resto no', () => {
    const av = carreraPorSlug('audiovision') as Carrera;
    const v = vincular(av);
    const libres = habilitadas(av, v, new Set());
    expect(libres.every((x) => x.correlativas.length === 0)).toBe(true);
    expect(libres.length).toBeGreaterThan(9);
  });
});
