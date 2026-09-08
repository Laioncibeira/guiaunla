import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CALENDARIO, CARRERAS, type Evento } from '../core/datos';
import { CarreraElegida } from '../shared/ui';
import { Instalar } from '../shared/instalar';
import { BannerElecciones, Estrella, FirmaFei } from '../shared/fei';
import { fechaCorta, diasHasta, ETIQUETA_TIPO } from './formato';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Instalar, BannerElecciones, Estrella, FirmaFei],
  template: `
    <header>
      <div>
        <h1>Guía UNLa <app-estrella color="var(--fei-violeta)" [tam]="15" /></h1>
        <p class="sub">Humanidades y Artes</p>
      </div>
      @if (elegida.carrera(); as c) {
        <a routerLink="/carreras" class="pastilla">{{ c.nombreCorto }}</a>
      }
    </header>

    <app-instalar />

    <main>
      <app-banner-elecciones />

      @if (!elegida.carrera()) {
        <section class="elegir">
          <h2>¿Qué estudiás?</h2>
          <p>Elegí tu carrera una vez y la app arranca siempre ahí.</p>
          @for (c of carreras; track c.slug) {
            <button type="button" (click)="elegir(c.slug)">{{ c.nombreCorto }}</button>
          }
        </section>
      }

      <section>
        <h2 class="rot">Lo que viene</h2>
        @for (e of proximas(); track e.id; let i = $index) {
          <a routerLink="/fechas" class="card fecha" [class.urgente]="i === 0">
            <div class="dia">
              <strong>{{ dia(e.desde) }}</strong>
              <span>{{ mes(e.desde) }}</span>
            </div>
            <div class="que">
              <div class="titulo">{{ e.titulo }}</div>
              <div class="cuando">{{ cuando(e) }}</div>
            </div>
          </a>
        } @empty {
          <p class="vacio">No quedan fechas cargadas para lo que resta del año.</p>
        }
      </section>

      <section>
        <h2 class="rot">Tu carrera</h2>
        <div class="grilla">
          <a class="card destacada" [routerLink]="rutaGrafo()">
            <span class="tit">Mapa de correlatividades</span>
            <span class="pie">Qué necesitás para cada materia</span>
          </a>
          <a class="card" [routerLink]="rutaCarrera()">
            <span class="tit">Plan de estudios</span>
            <span class="pie">{{ resumenPlan() }}</span>
          </a>
          <a class="card" routerLink="/horarios">
            <span class="tit">Horarios y aulas</span>
            <span class="pie">Dónde cursás cada materia</span>
          </a>
          <a class="card" routerLink="/campus">
            <span class="tit">Mapa del campus</span>
            <span class="pie">Cómo llegar a cada edificio</span>
          </a>
        </div>
      </section>

      <app-firma-fei />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header {
      display: flex; align-items: center; gap: var(--e3);
      padding: 18px var(--e4) var(--e3);
    }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .pastilla {
      border: 1px solid var(--borde); background: var(--superficie);
      border-radius: 999px; padding: 8px 13px; font-size: var(--t-s);
      color: var(--texto-2); min-height: 36px; display: flex; align-items: center;
    }
    main { flex: 1; padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e5); }
    .rot {
      margin: 0 0 var(--e2); font-size: var(--t-xs); font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3);
    }
    .card {
      display: block; background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--r); padding: 13px 14px; color: inherit;
    }
    .fecha { display: flex; gap: var(--e3); align-items: flex-start; margin-bottom: var(--e2); }
    .fecha.urgente { border-color: var(--naranja); }
    .dia { flex: none; min-width: 44px; text-align: center; }
    .dia strong { display: block; font-size: 17px; line-height: 1.1; }
    .fecha.urgente .dia strong { color: var(--naranja); }
    .dia span { font-size: 10px; color: var(--texto-3); text-transform: uppercase; letter-spacing: 0.06em; }
    .que { min-width: 0; }
    .titulo { font-size: var(--t-m); font-weight: 600; line-height: 1.25; }
    .cuando { font-size: var(--t-s); color: var(--texto-2); margin-top: 3px; }
    .grilla { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
    .grilla .card { min-height: 92px; display: flex; flex-direction: column; gap: 5px; }
    .tit { font-size: 14.5px; font-weight: 700; line-height: 1.2; }
    .pie { font-size: var(--t-s); color: var(--texto-2); }
    .destacada { background: var(--marca); border-color: var(--marca); color: var(--sobre-marca); }
    .destacada .pie { color: var(--sobre-marca); opacity: 0.82; }
    .elegir {
      background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--r); padding: var(--e4);
    }
    .elegir h2 { margin: 0; font-size: var(--t-l); }
    .elegir p { margin: 6px 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); }
    .elegir button {
      display: block; width: 100%; min-height: 46px; margin-bottom: 7px;
      border: 1px solid var(--borde); background: var(--superficie-2);
      border-radius: var(--r-chico); font-size: var(--t-m); font-weight: 600; text-align: left;
      padding: 0 var(--e3);
    }
    .vacio { font-size: var(--t-s); color: var(--texto-2); }
    h1 app-estrella { vertical-align: 4px; margin-left: 2px; }
  `,
})
export class Inicio {
  protected readonly elegida = inject(CarreraElegida);
  protected readonly carreras = CARRERAS;

  protected readonly proximas = computed(() =>
    [...CALENDARIO.eventos]
      .filter((e) => diasHasta(e.hasta) >= 0)
      .sort((a, b) => a.desde.localeCompare(b.desde))
      .slice(0, 3),
  );

  protected readonly resumenPlan = computed(() => {
    const c = this.elegida.carrera();
    return c ? `${c.materias.length} materias, ${c.duracionAnios} años` : 'Elegí tu carrera';
  });

  protected rutaGrafo(): string {
    const c = this.elegida.carrera();
    return c ? `/carreras/${c.slug}/correlatividades` : '/carreras';
  }

  protected rutaCarrera(): string {
    const c = this.elegida.carrera();
    return c ? `/carreras/${c.slug}` : '/carreras';
  }

  protected elegir(slug: string): void {
    this.elegida.elegir(slug);
  }

  protected dia = (iso: string) => fechaCorta(iso).split(' ')[0];
  protected mes = (iso: string) => fechaCorta(iso).split(' ')[1];

  protected cuando(e: Evento): string {
    const d = diasHasta(e.desde);
    const inicio = d < 0 ? 'En curso' : d === 0 ? 'Empieza hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
    const rango = e.hasta !== e.desde ? ` · hasta el ${fechaCorta(e.hasta)}` : '';
    return `${ETIQUETA_TIPO[e.tipo]} · ${inicio}${rango}`;
  }
}
