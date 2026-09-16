import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DEPARTAMENTOS, INDICE, NOMBRE_TIPO, plano, type ResumenCarrera } from '../core/datos';
import { Atras, CarreraElegida, ICONOS } from '../shared/ui';
import { FirmaFei } from '../shared/fei';

type Departamento = (typeof DEPARTAMENTOS)[number];

const nombreDepartamento = (slug: string): string =>
  DEPARTAMENTOS.find((d) => d.slug === slug)?.nombre ?? '';

/**
 * Elegir carrera en dos toques: primero el departamento (cuatro cuadrados),
 * después la carrera. Arriba un buscador para quien ya sabe el nombre.
 * Al elegir, guarda la carrera y vuelve a la pantalla que lo pidió.
 */
@Component({
  selector: 'app-selector-carrera',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    <label class="buscador">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4" /></svg>
      <input
        type="search"
        placeholder="Buscá tu carrera"
        autocomplete="off"
        [value]="consulta()"
        (input)="consulta.set($any($event.target).value)"
        aria-label="Buscar carrera"
      />
    </label>

    @if (consulta().trim()) {
      <h2 class="rot">Resultados</h2>
      @for (c of resultados(); track c.slug; let i = $index) {
        <ng-container *ngTemplateOutlet="tarjeta; context: { c: c, i: i, depto: true }" />
      } @empty {
        <p class="vacio">Ninguna carrera se llama así. Probá con otra palabra o buscala por departamento.</p>
      }
    } @else if (departamento(); as d) {
      <button type="button" class="volver" (click)="departamento.set(null)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>
        Departamentos
      </button>
      <h2 class="rot">{{ d.nombre }}</h2>
      @for (c of carrerasDe(d); track c.slug; let i = $index) {
        <ng-container *ngTemplateOutlet="tarjeta; context: { c: c, i: i, depto: false }" />
      }
    } @else {
      <h2 class="rot">¿De qué departamento sos?</h2>
      <div class="cuadros">
        @for (d of departamentos; track d.slug; let i = $index) {
          <button type="button" class="cuadro" (click)="departamento.set(d)" [style.--color]="'var(--n' + (i + 1) + ')'">
            <span class="nom">{{ d.nombre }}</span>
            <span class="meta">{{ d.carreras.length }} carreras</span>
          </button>
        }
      </div>
    }

    <ng-template #tarjeta let-c="c" let-i="i" let-depto="depto">
      <a class="card" [routerLink]="destino()" (click)="elegir(c.slug)">
        <span class="raya" [style.background]="'var(--n' + ((i % 8) + 1) + ')'"></span>
        <span class="txt">
          <span class="nom">{{ c.nombreCorto }}</span>
          <span class="meta">
            {{ tipo(c) }} · {{ c.materias }} materias · {{ c.duracionAnios }} años
            @if (c.tituloIntermedio) {
              · título intermedio
            }
            @if (depto) {
              <br />{{ nombreDepto(c.departamento) }}
            }
          </span>
        </span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>
      </a>
    </ng-template>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--e2); }
    .buscador {
      display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 12px;
      border: 1px solid var(--borde); border-radius: 12px; background: var(--superficie); color: var(--texto-3);
      margin-bottom: var(--e1);
    }
    .buscador input { flex: 1; min-width: 0; border: 0; background: none; color: var(--texto); font: inherit; font-size: var(--t-m); outline: none; }
    .buscador:focus-within { border-color: var(--marca); }
    .rot { margin: var(--e2) 0 var(--e1); font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    .cuadros { display: grid; grid-template-columns: 1fr 1fr; gap: var(--e3); }
    .cuadro {
      display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px; aspect-ratio: 1;
      padding: 14px; border: 1px solid var(--borde); border-radius: var(--r); background: var(--superficie);
      text-align: center; color: inherit; position: relative; overflow: hidden; font: inherit;
    }
    .cuadro::before { content: ''; position: absolute; inset: 0 0 auto; height: 5px; background: var(--color); }
    .cuadro .nom { font-size: var(--t-l); font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; color: var(--color); text-wrap: balance; }
    .cuadro .meta { font-size: var(--t-xs); color: var(--texto-3); }
    .volver {
      align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; min-height: 36px; padding: 0 12px 0 8px;
      border: 1px solid var(--borde); border-radius: 999px; background: var(--superficie); color: var(--texto-2);
      font: inherit; font-size: var(--t-s); font-weight: 600;
    }
    .card { display: flex; gap: var(--e3); align-items: center; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 14px; color: inherit; min-height: 68px; text-decoration: none; }
    .raya { width: 4px; align-self: stretch; border-radius: 2px; flex: none; }
    .txt { flex: 1; min-width: 0; }
    .card .nom { display: block; font-size: var(--t-l); font-weight: 600; letter-spacing: -0.01em; }
    .card .meta { display: block; font-size: var(--t-s); color: var(--texto-2); margin-top: 3px; line-height: 1.4; }
    .card svg { color: var(--texto-3); flex: none; }
    .vacio { margin: 0; padding: var(--e3); border: 1px dashed var(--borde); border-radius: var(--r); font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; }
  `,
})
export class SelectorCarrera {
  /** Adónde ir después de elegir; sin valor, al hub de Tu carrera. */
  readonly volver = input<string | null>(null);
  private readonly elegida = inject(CarreraElegida);
  private readonly router = inject(Router);

  protected readonly departamentos = DEPARTAMENTOS;
  protected readonly consulta = signal('');
  protected readonly departamento = signal<Departamento | null>(null);

  protected readonly resultados = computed(() => {
    const q = plano(this.consulta().trim());
    if (!q) return [];
    return INDICE.filter((c) =>
      plano(`${c.nombre} ${c.nombreCorto} ${nombreDepartamento(c.departamento)} ${NOMBRE_TIPO[c.tipo]}`).includes(q),
    );
  });

  protected carrerasDe(d: Departamento): ResumenCarrera[] {
    return d.carreras.map((slug) => INDICE.find((c) => c.slug === slug)).filter((c): c is ResumenCarrera => !!c);
  }

  protected tipo = (c: ResumenCarrera) => NOMBRE_TIPO[c.tipo];
  protected nombreDepto = nombreDepartamento;

  protected destino(): string {
    const v = this.volver();
    // Sólo rutas internas: un valor externo o raro no se sigue.
    return v && v.startsWith('/') && !v.startsWith('//') ? v : '/carrera';
  }

  protected elegir(slug: string): void {
    this.elegida.elegir(slug);
  }
}

/** Página del selector, con "atrás" y el `?volver=` de quien la pidió. */
@Component({
  selector: 'app-elegir-carrera',
  imports: [SelectorCarrera, Atras],
  template: `
    <header>
      <app-atras respaldo="/carrera" nombre="tu carrera" />
      <div>
        <h1>Elegí tu carrera</h1>
        <p class="sub">Se guarda en este teléfono. La podés cambiar cuando quieras.</p>
      </div>
    </header>
    <main>
      <app-selector-carrera [volver]="volver()" />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { display: flex; align-items: center; gap: var(--e3); padding: 14px var(--e4) 10px; }
    h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    main { padding: var(--e2) var(--e4) var(--e4); }
  `,
})
export class ElegirCarrera {
  private readonly ruta = inject(ActivatedRoute);
  private readonly query = toSignal(this.ruta.queryParamMap, {
    initialValue: this.ruta.snapshot.queryParamMap,
  });
  protected readonly volver = computed(() => this.query().get('volver'));
}

/**
 * Tu carrera: el hub. Sin carrera elegida muestra el selector; con carrera,
 * las cinco puertas: correlatividades, plan, horarios, calendario y campus.
 */
@Component({
  selector: 'app-tu-carrera',
  imports: [RouterLink, SelectorCarrera, FirmaFei],
  template: `
    @if (resumen(); as r) {
      <header>
        <div>
          <h1>{{ r.nombreCorto }}</h1>
          <p class="sub">
            {{ tipo(r) }} · {{ departamento(r) }} ·
            <a routerLink="/carrera/elegir" [queryParams]="{ volver: '/carrera' }" class="cambiar">Cambiar</a>
          </p>
        </div>
      </header>
      <main>
        @for (p of puertas(); track p.ruta) {
          <a class="puerta" [routerLink]="p.ruta">
            <span class="ico" [style.--color]="p.color">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                @if (p.icono === 'calendario') {
                  <circle cx="12" cy="12" r="9" />
                }
                <path [attr.d]="iconos[p.icono]" />
              </svg>
            </span>
            <span class="txt">
              <span class="nom">{{ p.titulo }}</span>
              <span class="meta">{{ p.detalle }}</span>
            </span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>
          </a>
        }
        <app-firma-fei />
      </main>
    } @else {
      <header>
        <div>
          <h1>Tu carrera</h1>
          <p class="sub">Elegila una vez y la app arranca siempre ahí.</p>
        </div>
      </header>
      <main>
        <app-selector-carrera />
        <app-firma-fei />
      </main>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { padding: 18px var(--e4) var(--e3); }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .cambiar { color: var(--marca); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e3); }
    .puerta { display: flex; gap: var(--e3); align-items: center; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 12px 14px; color: inherit; min-height: 68px; text-decoration: none; }
    .ico { flex: none; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; color: var(--color); background: color-mix(in srgb, var(--color) 14%, transparent); }
    .txt { flex: 1; min-width: 0; }
    .nom { display: block; font-size: var(--t-l); font-weight: 600; letter-spacing: -0.01em; }
    .meta { display: block; font-size: var(--t-s); color: var(--texto-2); margin-top: 3px; }
    .puerta > svg { color: var(--texto-3); flex: none; }
  `,
})
export class TuCarrera {
  private readonly elegida = inject(CarreraElegida);
  protected readonly resumen = computed(() => this.elegida.resumen());
  protected readonly iconos = ICONOS;

  protected tipo = (r: ResumenCarrera) => NOMBRE_TIPO[r.tipo];
  protected departamento = (r: ResumenCarrera) => nombreDepartamento(r.departamento);

  protected readonly puertas = computed(() => {
    const r = this.resumen();
    if (!r) return [];
    const plan = `${r.materias} materias · ${r.duracionAnios} años` + (r.tituloIntermedio ? ' · título intermedio' : '');
    const puertas = [
      r.tieneCorrelativas
        ? { ruta: `/carrera/${r.slug}/correlatividades`, icono: 'grafo', color: 'var(--n1)', titulo: 'Correlatividades', detalle: 'El mapa: qué necesita y qué habilita cada materia' }
        : null,
      { ruta: `/carrera/${r.slug}`, icono: 'carreras', color: 'var(--n2)', titulo: 'Plan de estudios', detalle: r.tieneCorrelativas ? plan : plan + ' · sin correlatividades publicadas' },
      { ruta: '/horarios', icono: 'horarios', color: 'var(--n3)', titulo: 'Horarios', detalle: r.tieneGrilla ? 'Qué se cursa hoy y en qué aula' : 'Grilla todavía no cargada' },
      { ruta: '/fechas', icono: 'calendario', color: 'var(--n4)', titulo: 'Calendario académico', detalle: 'Inscripciones, exámenes y recesos' },
      { ruta: '/campus', icono: 'mapa', color: 'var(--n5)', titulo: 'Mapa del campus', detalle: 'Edificios, aulas y cómo llegar' },
    ];
    return puertas.filter((p): p is NonNullable<typeof p> => !!p);
  });
}
