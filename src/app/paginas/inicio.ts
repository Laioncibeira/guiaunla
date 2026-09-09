import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CARRERAS, horariosDe } from '../core/datos';
import { CarreraElegida } from '../shared/ui';
import { Instalar } from '../shared/instalar';
import { BannerElecciones, Estrella, FirmaFei } from '../shared/fei';
import { Tutorial } from '../shared/tutorial';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Instalar, BannerElecciones, Estrella, FirmaFei, Tutorial],
  template: `
    <header>
      <div style="flex:1">
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
            <span class="pie">{{ resumenHorarios() }}</span>
          </a>
          <a class="card" routerLink="/campus">
            <span class="tit">Mapa del campus</span>
            <span class="pie">Cómo llegar a cada edificio</span>
          </a>
        </div>
      </section>

      <app-tutorial />
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
    h1 app-estrella { vertical-align: 4px; margin-left: 2px; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .pastilla {
      border: 1px solid var(--borde); background: var(--superficie);
      border-radius: 999px; padding: 8px 13px; font-size: var(--t-s);
      color: var(--texto-2); min-height: 36px; display: flex; align-items: center;
    }
    main { flex: 1; padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e4); }
    .rot {
      margin: 0 0 var(--e2); font-size: var(--t-xs); font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3);
    }
    .card {
      display: block; background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--r); padding: 14px; color: inherit;
    }
    .grilla { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .grilla .card { min-height: 108px; display: flex; flex-direction: column; gap: 6px; }
    .tit { font-size: var(--t-l); font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
    .pie { font-size: var(--t-s); color: var(--texto-2); line-height: 1.35; }
    .destacada { background: var(--marca); border-color: var(--marca); color: var(--sobre-marca); }
    .destacada .pie { color: var(--sobre-marca); opacity: 0.85; }
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
  `,
})
export class Inicio {
  protected readonly elegida = inject(CarreraElegida);
  protected readonly carreras = CARRERAS;

  protected readonly resumenPlan = computed(() => {
    const c = this.elegida.carrera();
    return c ? `${c.materias.length} materias, ${c.duracionAnios} años` : 'Elegí tu carrera';
  });

  protected readonly resumenHorarios = computed(() => {
    const c = this.elegida.carrera();
    const h = c ? horariosDe(c.slug) : undefined;
    return h ? `${h.clases.length} clases este cuatrimestre` : 'Día, turno y aula';
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
}
