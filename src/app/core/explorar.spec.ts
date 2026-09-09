import { describe, expect, it } from 'vitest';
import type { Carrera } from './datos';
import { carreraPorSlug } from './datos';
import {
  aplicarFiltros,
  calcularRama,
  calcularRelacionadas,
  construirArbol,
  construirFilas,
  simular,
} from './explorar';

const plan = (materias: Carrera['materias'], tipoNivel: Carrera['tipoNivel'] = 'anio'): Carrera => ({
  slug: 'prueba',
  nombre: 'Prueba',
  nombreCorto: 'Prueba',
  departamento: 'humanidades-y-artes',
  titulo: 'Título',
  duracionAnios: 2,
  tipoNivel,
  niveles: 4,
  fuenteUrl: '',
  fuenteFecha: '',
  cotejado: false,
  materias,
});

const m = (codigo: string, nivel: number, correlativas: string[] = []) => ({
  codigo,
  nombre: 'Materia ' + codigo,
  dedicacion: 'cuatrimestral' as const,
  nivel,
  correlativas,
});

//  01 ─┬─ 03 ── 04
//      └─ 05
//  02 ─┘
const cadena = plan([m('01', 1), m('02', 1), m('03', 1, ['01']), m('04', 2, ['03']), m('05', 2, ['01', '02'])]);

describe('relacionadas: un salto en cada dirección', () => {
  it('junta lo que la prendida necesita y lo que destraba', () => {
    expect([...(calcularRelacionadas(new Set(['03']), cadena) ?? [])].sort()).toEqual(['01', '03', '04']);
  });

  it('suma las ramas de varias prendidas', () => {
    expect([...(calcularRelacionadas(new Set(['03', '05']), cadena) ?? [])].sort()).toEqual([
      '01', '02', '03', '04', '05',
    ]);
  });

  it('sin selección devuelve null, que no es lo mismo que vacío', () => {
    expect(calcularRelacionadas(new Set(), cadena)).toBeNull();
  });
});

describe('rama: la cadena completa hacia atrás', () => {
  it('sigue las correlativas de las correlativas', () => {
    expect([...(calcularRama(new Set(['04']), cadena) ?? [])].sort()).toEqual(['01', '03', '04']);
  });

  it('suma también lo que destraba directo', () => {
    expect([...(calcularRama(new Set(['01']), cadena) ?? [])].sort()).toEqual(['01', '03', '05']);
  });

  it('sin selección devuelve null', () => {
    expect(calcularRama(new Set(), cadena)).toBeNull();
  });
});

describe('árbol de correlativas', () => {
  it('la raíz es la materia y los hijos lo que pide', () => {
    const a = construirArbol('04', cadena);
    expect(a?.materia.codigo).toBe('04');
    expect(a?.hijos.map((h) => h.materia.codigo)).toEqual(['03']);
    expect(a?.hijos[0].hijos.map((h) => h.materia.codigo)).toEqual(['01']);
    expect(a?.hijos[0].hijos[0].nivel).toBe(2);
  });

  it('marca cuáles ya están aprobadas', () => {
    const a = construirArbol('04', cadena, new Set(['03']));
    expect(a?.hijos[0].aprobada).toBe(true);
    expect(a?.aprobada).toBe(false);
  });

  it('una materia sin correlativas no tiene hijos', () => {
    expect(construirArbol('01', cadena)?.hijos).toEqual([]);
  });

  it('devuelve null si la materia no existe', () => {
    expect(construirArbol('XX', cadena)).toBeNull();
  });
});

describe('filas del explorador', () => {
  it('trae lo que pide y lo que destraba cada materia', () => {
    const filas = construirFilas(cadena, new Set(), null);
    const f3 = filas.find((f) => f.materia.codigo === '03');
    expect(f3?.necesita.map((x) => x.codigo)).toEqual(['01']);
    expect(f3?.destraba.map((x) => x.codigo)).toEqual(['04']);
    expect(f3?.atenuada).toBe(false);
  });

  it('sabe qué se puede cursar con lo aprobado', () => {
    const filas = construirFilas(cadena, new Set(['01']), null);
    expect(filas.find((f) => f.materia.codigo === '03')?.puedeCursar).toBe(true);
    expect(filas.find((f) => f.materia.codigo === '04')?.puedeCursar).toBe(false);
    expect(filas.find((f) => f.materia.codigo === '01')?.aprobada).toBe(true);
  });

  it('atenúa lo que queda fuera del filtro en vez de esconderlo', () => {
    const filas = construirFilas(cadena, new Set(), new Set(['01']));
    expect(filas.length).toBe(cadena.materias.length);
    expect(filas.find((f) => f.materia.codigo === '01')?.atenuada).toBe(false);
    expect(filas.find((f) => f.materia.codigo === '02')?.atenuada).toBe(true);
  });

  it('el cuatrimestre sale sólo donde el plan lo publica', () => {
    expect(construirFilas(cadena, new Set(), null)[0].cuatrimestre).toBeNull();
    const porCuat = plan([m('A', 3)], 'cuatrimestre');
    const fila = construirFilas(porCuat, new Set(), null)[0];
    expect(fila.anio).toBe(2);
    expect(fila.cuatrimestre).toBe(1);
  });
});

describe('simulación', () => {
  it('cuenta lo que se abriría al aprobar lo prendido', () => {
    const s = simular(cadena, new Set(), new Set(['01']));
    expect(s.desbloqueadas.map((x) => x.codigo)).toEqual(['03']);
    expect(s.porcentajeAntes).toBe(0);
    expect(s.porcentajeDespues).toBe(20);
  });

  it('no cuenta lo que ya se podía cursar', () => {
    const s = simular(cadena, new Set(), new Set(['02']));
    expect(s.desbloqueadas).toEqual([]);
  });

  it('encadena: aprobar dos abre lo que pedía las dos', () => {
    const s = simular(cadena, new Set(), new Set(['01', '02']));
    expect(s.desbloqueadas.map((x) => x.codigo).sort()).toEqual(['03', '05']);
  });

  it('sin nada prendido no cambia nada', () => {
    const s = simular(cadena, new Set(['01']), new Set());
    expect(s.desbloqueadas).toEqual([]);
    expect(s.porcentajeAntes).toBe(s.porcentajeDespues);
  });

  it('sobre el plan real de Audiovisión abre materias de verdad', () => {
    const av = carreraPorSlug('audiovision') as Carrera;
    const primerAnio = av.materias.filter((x) => x.nivel === 1).map((x) => x.codigo);
    const s = simular(av, new Set(), new Set(primerAnio));
    expect(s.desbloqueadas.length).toBeGreaterThan(0);
    for (const d of s.desbloqueadas) expect(d.correlativas.length).toBeGreaterThan(0);
  });
});

describe('filtros', () => {
  const filas = construirFilas(cadena, new Set(['01']), null);

  it('sin filtros no atenúa nada', () => {
    expect(aplicarFiltros(filas, new Set(), new Set())).toBeNull();
  });

  it('aprobadas deja sólo las aprobadas', () => {
    expect([...(aplicarFiltros(filas, new Set(['aprobadas']), new Set()) ?? [])]).toEqual(['01']);
  });

  it('dos filtros suman en vez de restringir', () => {
    const r = aplicarFiltros(filas, new Set(['aprobadas', 'se-dicta']), new Set(['04'])) ?? new Set();
    expect([...r].sort()).toEqual(['01', '04']);
  });
});
