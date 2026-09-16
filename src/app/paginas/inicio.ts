import { afterNextRender, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Novedades } from '../core/novedades';
import { CarreraChip, CarreraElegida } from '../shared/ui';
import { Instalar } from '../shared/instalar';
import { BannerElecciones, Estrella, FirmaFei, Firmas, LogoFei } from '../shared/fei';
import { Tutorial } from '../shared/tutorial';
import { RelojLey } from '../shared/reloj-ley';
import { FormularioContacto } from '../shared/contacto';
import { fechaCorta } from './formato';

@Component({
  selector: 'app-inicio',
  imports: [
    RouterLink,
    Instalar,
    CarreraChip,
    BannerElecciones,
    Estrella,
    FirmaFei,
    Firmas,
    LogoFei,
    Tutorial,
    RelojLey,
    FormularioContacto,
  ],
  template: `
    <header>
      <div class="titulo">
        <h1>Guía UNLa <app-estrella color="var(--fei-violeta)" [tam]="15" /></h1>
        <p class="sub">Universidad Nacional de Lanús</p>
      </div>
      <a class="fei" href="https://frentedeestudiantesdeizquierda-fei.web.app/" rel="noopener" aria-label="Frente de Estudiantes de Izquierda"><app-logo-fei [ancho]="48" /></a>
      <app-carrera-chip />
    </header>

    <app-instalar />

    <main>
      @if (!elegida.resumen()) {
        <section class="elegir" aria-labelledby="elegir-titulo">
          <h2 id="elegir-titulo">Primero, elegí tu departamento y tu carrera</h2>
          <p>
            Es una sola vez: después la app arranca en tu plan, tus correlatividades y tus horarios.
            Lo hacés desde acá, desde el botón <strong>Elegí tu carrera</strong> de arriba o desde la pestaña
            <strong>Tu carrera</strong> de abajo, cuando quieras.
          </p>
          <a class="boton" routerLink="/carrera/elegir" [queryParams]="{ volver: '/' }">Elegir departamento y carrera</a>
        </section>
      }

      @if (novedades().length) {
        <section aria-labelledby="novedades-titulo">
          <div class="fila-titulo">
            <h2 class="rot" id="novedades-titulo">Novedades</h2>
            <a routerLink="/novedades" class="ver-todas">Ver todas</a>
          </div>
          @for (n of novedades(); track n.id) {
            <article class="card novedad">
              <span class="fecha">{{ fecha(n.fecha) }}</span>
              <h3>{{ n.titulo }}</h3>
              <p>{{ n.cuerpo }}</p>
            </article>
          }
        </section>
      }

      <app-reloj-ley />

      <app-contacto>
        <app-firmas />
      </app-contacto>

      <app-banner-elecciones />

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
    .titulo { flex: 1; min-width: 0; }
    h1, .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    /* En el teléfono el subtítulo no entra al lado del logo y la carrera. */
    @media (max-width: 599px) { .sub { display: none; } }
    .fei { flex: none; display: inline-flex; padding: 5px 6px; border-radius: 8px; background: var(--fei-fondo); }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .pastilla {
      border: 1px solid var(--borde); background: var(--superficie);
      border-radius: 999px; padding: 8px 13px; font-size: var(--t-s);
      color: var(--texto-2); min-height: 36px; display: flex; align-items: center;
    }
    main { flex: 1; padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e4); }
    @media (min-width: 900px) {
      main { display: grid; grid-template-columns: 1fr 1fr; align-items: start; }
      .elegir, app-tutorial, app-firma-fei { grid-column: 1 / -1; }
    }
    .rot {
      margin: 0 0 var(--e2); font-size: var(--t-xs); font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3);
    }
    .card {
      display: block; background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--r); padding: 14px; color: inherit;
    }
    .fila-titulo { display: flex; align-items: baseline; justify-content: space-between; }
    .ver-todas { font-size: var(--t-s); font-weight: 600; color: var(--marca); text-decoration: underline; text-underline-offset: 2px; }
    .novedad { margin-bottom: 8px; }
    .novedad .fecha { display: block; font-family: var(--mono); font-size: var(--t-xs); color: var(--texto-3); }
    .novedad h3 { margin: 4px 0 0; font-size: var(--t-m); font-weight: 700; line-height: 1.25; }
    .novedad p {
      margin: 6px 0 0; font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; white-space: pre-line;
      display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
    }
    .elegir {
      background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--r); padding: var(--e4);
    }
    .elegir { border-color: var(--marca); }
    .elegir h2 { margin: 0; font-size: var(--t-l); }
    .elegir p { margin: 6px 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); line-height: 1.5; }
    .elegir strong { color: var(--texto); font-weight: 600; }
    .elegir .boton {
      display: flex; align-items: center; justify-content: center; min-height: 46px;
      border-radius: 10px; background: var(--marca); color: var(--sobre-marca);
      font-size: var(--t-m); font-weight: 600; text-decoration: none;
    }
  `,
})
export class Inicio {
  protected readonly elegida = inject(CarreraElegida);
  private readonly servicioNovedades = inject(Novedades);

  /** Las tres más recientes; la lista completa vive en /novedades. */
  protected readonly novedades = computed(() => this.servicioNovedades.lista().slice(0, 3));

  constructor() {
    // Firestore sólo en el navegador y después del primer dibujo: el chunk
    // del SDK no compite con lo que el estudiante vino a ver.
    afterNextRender(() => this.servicioNovedades.escuchar());
  }

  protected fecha = (iso: string) => fechaCorta(iso);
}
