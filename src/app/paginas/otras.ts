import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CALENDARIO, CAMPUS, type Edificio, type Evento } from '../core/datos';
import { CarreraElegida } from '../shared/ui';
import { COLOR_TIPO, ETIQUETA_TIPO, comoIcs, diasHasta, fechaCorta, fechaLarga } from './formato';
import { FirmaFei } from '../shared/fei';

@Component({
  selector: 'app-fechas',
  imports: [FirmaFei],
  template: `
    <header>
      <div>
        <h1>Fechas</h1>
        <p class="sub">Calendario académico {{ calendario.anio }}</p>
      </div>
    </header>
    <main>
      <div class="filtros" role="group" aria-label="Filtrar fechas">
        <button type="button" [class.on]="verPasadas()" (click)="verPasadas.set(!verPasadas())">
          {{ verPasadas() ? 'Ocultar las que pasaron' : 'Ver también las que pasaron' }}
        </button>
      </div>

      @for (e of eventos(); track e.id) {
        <article class="card" [class.pasado]="pasado(e)">
          <span class="raya" [style.background]="color(e)"></span>
          <div class="cuerpo">
            <span class="tipo" [style.color]="color(e)">{{ etiqueta(e) }}</span>
            <h2>{{ e.titulo }}</h2>
            <p class="mono cuando">{{ rango(e) }}</p>
            @if (e.detalle) {
              <p class="detalle">{{ e.detalle }}</p>
            }
          </div>
          @if (!pasado(e)) {
            <a class="agendar" [href]="ics(e)" [attr.download]="e.id + '.ics'">Agendar</a>
          }
        </article>
      } @empty {
        <p class="vacio">No quedan fechas por delante en este calendario.</p>
      }

      <p class="fuente">{{ calendario.nota }}</p>
      <app-firma-fei />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { padding: 18px var(--e4) var(--e3); }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: 9px; }
    .filtros button { min-height: 40px; padding: 0 var(--e3); border-radius: 999px; border: 1px solid var(--borde); background: var(--superficie); color: var(--texto-2); font-size: var(--t-s); }
    .filtros button.on { border-color: var(--marca); color: var(--marca); }
    .card { display: flex; gap: var(--e3); align-items: flex-start; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 13px 14px; }
    .card.pasado { opacity: 0.55; }
    .raya { width: 3px; align-self: stretch; border-radius: 2px; flex: none; }
    .cuerpo { flex: 1; min-width: 0; }
    .tipo { font-size: 9.5px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; }
    h2 { margin: 4px 0 0; font-size: var(--t-m); font-weight: 600; line-height: 1.25; }
    .cuando { margin: 5px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .detalle { margin: 6px 0 0; font-size: var(--t-s); color: var(--texto-2); line-height: 1.4; }
    .agendar { flex: none; min-height: 44px; display: flex; align-items: center; padding: 0 11px; border-radius: 9px; border: 1px solid var(--marca); color: var(--marca); font-size: var(--t-s); font-weight: 600; }
    .fuente { font-size: var(--t-xs); color: var(--texto-3); line-height: 1.45; margin: var(--e2) 0 0; }
    .vacio { font-size: var(--t-m); color: var(--texto-2); }
  `,
})
export class Fechas {
  protected readonly calendario = CALENDARIO;
  protected readonly verPasadas = signal(false);

  protected readonly eventos = computed(() =>
    [...CALENDARIO.eventos]
      .filter((e) => this.verPasadas() || diasHasta(e.hasta) >= 0)
      .sort((a, b) => a.desde.localeCompare(b.desde)),
  );

  protected pasado = (e: Evento) => diasHasta(e.hasta) < 0;
  protected color = (e: Evento) => COLOR_TIPO[e.tipo];
  protected etiqueta = (e: Evento) => ETIQUETA_TIPO[e.tipo];

  protected rango(e: Evento): string {
    return e.desde === e.hasta ? fechaLarga(e.desde) : `${fechaCorta(e.desde)} → ${fechaLarga(e.hasta)}`;
  }

  protected ics(e: Evento): string {
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(comoIcs(e));
  }
}

@Component({
  selector: 'app-campus',
  template: `
    <header>
      <div>
        <h1>Campus</h1>
        <p class="sub">Predio {{ campus.predio }}</p>
      </div>
    </header>

    <div class="lienzo">
      <svg [attr.viewBox]="campus.viewBox" role="img" aria-label="Esquema del campus de la UNLa">
        <rect [attr.width]="1440" [attr.height]="760" rx="10" fill="var(--superficie-2)" />
        @for (e of campus.edificios; track e.id) {
          <g
            role="button"
            tabindex="0"
            [attr.aria-label]="e.nombre"
            (click)="elegir(e)"
            (keydown.enter)="elegir(e)"
          >
            <rect
              [attr.x]="e.x"
              [attr.y]="e.y"
              [attr.width]="e.w"
              [attr.height]="e.h"
              rx="6"
              [attr.fill]="relleno(e)"
              [attr.stroke]="e.id === elegido()?.id ? 'var(--marca)' : 'none'"
              stroke-width="10"
              stroke-opacity="0.25"
            />
            <text
              [attr.x]="e.x + e.w / 2"
              [attr.y]="e.y + e.h / 2 + 7"
              text-anchor="middle"
              font-size="20"
              font-weight="600"
              [attr.fill]="e.id === elegido()?.id ? 'var(--sobre-marca)' : 'var(--texto-2)'"
            >
              {{ e.num }}
            </text>
          </g>
        }
        @for (a of campus.accesos; track a.id) {
          <circle [attr.cx]="a.x" [attr.cy]="a.y" r="13" fill="var(--naranja)">
            <title>{{ a.nombre }}</title>
          </circle>
        }
        <text x="720" y="26" text-anchor="middle" font-size="19" fill="var(--texto-3)">vías del ferrocarril Roca</text>
        <text x="720" y="750" text-anchor="middle" font-size="19" fill="var(--texto-3)">Av. 29 de Septiembre</text>
      </svg>
    </div>

    <ul class="lista">
      @for (e of campus.edificios; track e.id) {
        <li>
          <button type="button" [class.on]="e.id === elegido()?.id" (click)="elegir(e)">
            <span class="num">{{ e.num }}</span>
            <span class="nom">{{ e.nombre }}</span>
            @if (e.aulas) {
              <span class="aulas">aulas</span>
            }
          </button>
        </li>
      }
    </ul>

    @if (elegido(); as e) {
      <section class="hoja">
        <button type="button" class="tirador" (click)="elegido.set(null)" aria-label="Cerrar"></button>
        <div class="titulo">
          <span class="num">{{ e.num }}</span>
          <h2>{{ e.nombre }}</h2>
        </div>
        @if (e.nota) {
          <p>{{ e.nota }}</p>
        }
        @if (e.comoLlegar) {
          <p class="llegar">{{ e.comoLlegar }}</p>
        }
        @if (e.aulas) {
          <p class="aulas">Este edificio tiene aulas de cursada.</p>
        }
        <a class="google" [href]="mapaExterno" rel="noopener">Cómo llegar a la UNLa</a>
      </section>
    } @else {
      <section class="hoja">
        <p class="ayuda">Tocá un edificio para ver dónde queda y cómo llegar.</p>
        <p class="fuente">{{ campus.nota }} {{ campus.direccion }}.</p>
      </section>
    }
  `,
  styles: `
    /* Alto exacto del area util: la barra de abajo es fija y su lugar ya esta
       reservado por el contenedor, asi que la hoja inferior nunca queda debajo. */
    :host { display: flex; flex-direction: column; min-height: 0;
      height: calc(100dvh - var(--barra) - env(safe-area-inset-bottom)); }
    header { padding: 18px var(--e4) var(--e3); }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .lienzo { flex: none; margin: 0 var(--e4); border: 1px solid var(--borde); border-radius: 14px; background: var(--superficie); padding: var(--e2); }
    .lienzo svg { display: block; width: 100%; height: auto; }
    .lienzo g { cursor: pointer; }
    .lista { flex: 1; min-height: 0; overflow-y: auto; list-style: none; margin: var(--e3) 0 0; padding: 0 var(--e4); }
    .lista button { display: flex; align-items: center; gap: 11px; width: 100%; min-height: 46px; padding: 8px 0; background: none; border: none; border-bottom: 1px solid var(--borde); text-align: left; }
    .lista .num { flex: none; width: 26px; height: 26px; border-radius: 7px; background: var(--superficie-2); color: var(--texto-2); display: grid; place-items: center; font-size: var(--t-s); font-weight: 600; }
    .lista button.on .num { background: var(--marca); color: var(--sobre-marca); }
    .lista .nom { flex: 1; font-size: var(--t-m); }
    .lista .aulas { flex: none; font-size: var(--t-xs); color: var(--verde); }
    .hoja { flex: none; background: var(--superficie); border-top: 1px solid var(--borde); border-radius: var(--r-grande) var(--r-grande) 0 0; padding: 10px var(--e4) var(--e4); box-shadow: var(--sombra); margin-top: var(--e3); }
    .tirador { display: block; width: 44px; height: 22px; margin: 0 auto 6px; background: none; border: none; position: relative; }
    .tirador::before { content: ''; position: absolute; inset: 9px 3px; border-radius: 2px; background: var(--borde); }
    .titulo { display: flex; align-items: center; gap: 10px; }
    .num { width: 30px; height: 30px; border-radius: var(--r-chico); background: var(--marca); color: var(--sobre-marca); display: grid; place-items: center; font-weight: 700; font-size: var(--t-m); flex: none; }
    h2 { margin: 0; font-size: 16.5px; font-weight: 700; }
    .hoja p { margin: 11px 0 0; font-size: var(--t-m); color: var(--texto-2); line-height: 1.5; }
    .aulas { color: var(--verde) !important; font-size: var(--t-s) !important; }
    .ayuda { margin: 0 !important; }
    .fuente { font-size: var(--t-xs) !important; color: var(--texto-3) !important; }
    .google { display: flex; align-items: center; justify-content: center; min-height: 46px; margin-top: var(--e3); border-radius: 10px; background: var(--superficie-2); border: 1px solid var(--borde); font-size: var(--t-m); font-weight: 600; color: var(--texto); }
  `,
})
export class Campus {
  private readonly ruta = inject(ActivatedRoute);
  protected readonly campus = CAMPUS;
  protected readonly elegido = signal<Edificio | null>(null);

  constructor() {
    // Se puede llegar desde Horarios con un edificio ya elegido.
    const id = this.ruta.snapshot.queryParamMap.get('edificio');
    if (id) this.elegido.set(CAMPUS.edificios.find((e) => e.id === id) ?? null);
  }
  protected readonly mapaExterno =
    'https://www.google.com/maps/search/?api=1&query=Universidad+Nacional+de+Lan%C3%BAs';

  protected elegir(e: Edificio): void {
    this.elegido.set(this.elegido()?.id === e.id ? null : e);
  }

  protected relleno(e: Edificio): string {
    if (e.id === this.elegido()?.id) return 'var(--marca)';
    return e.verde ? 'var(--verde)' : 'var(--borde)';
  }
}

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <main>
      <h1>Esa página no existe</h1>
      <p>Puede que el link esté viejo o mal copiado.</p>
      <a class="boton" routerLink="/">Ir al inicio</a>
    </main>
  `,
  styles: `
    main { padding: var(--e5) var(--e4); }
    h1 { margin: 0 0 var(--e2); font-size: var(--t-xl); }
    p { color: var(--texto-2); font-size: var(--t-m); }
    .boton { display: flex; align-items: center; justify-content: center; min-height: 46px; margin-top: var(--e4); border-radius: 10px; background: var(--superficie-2); border: 1px solid var(--borde); font-weight: 600; color: var(--texto); }
  `,
})
export class NoEncontrado {}

/** Ruta vieja o incompleta hacia una carrera: se resuelve mostrando el listado. */
export const rutaSlug = () => {
  const r = inject(ActivatedRoute);
  return toSignal(r.paramMap, { initialValue: r.snapshot.paramMap });
};
