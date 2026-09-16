import { afterNextRender, Component, inject } from '@angular/core';
import { Novedades } from '../core/novedades';
import { Atras } from '../shared/ui';
import { FirmaFei } from '../shared/fei';
import { fechaLarga } from './formato';

@Component({
  selector: 'app-novedades',
  imports: [Atras, FirmaFei],
  template: `
    <header>
      <app-atras respaldo="/" nombre="el inicio" />
      <div>
        <h1>Novedades</h1>
        <p class="sub">Lo que pasa en el centro y en el Departamento</p>
      </div>
    </header>
    <main>
      @if (servicio.desdeCache() && servicio.lista().length) {
        <p class="aviso">Sin conexión: mostrando la última copia guardada.</p>
      }
      @for (n of servicio.lista(); track n.id) {
        <article class="card">
          <span class="fecha">{{ fecha(n.fecha) }}</span>
          <h2>{{ n.titulo }}</h2>
          <p>{{ n.cuerpo }}</p>
        </article>
      } @empty {
        @switch (servicio.estado()) {
          @case ('cargando') {
            <p class="vacio">Cargando novedades…</p>
          }
          @case ('error') {
            <p class="vacio">No se pudieron cargar. Probá de nuevo en un rato.</p>
          }
          @default {
            <p class="vacio">Todavía no hay novedades publicadas.</p>
          }
        }
      }
      <app-firma-fei />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { display: flex; align-items: center; gap: var(--e3); padding: 14px var(--e4) 10px; border-bottom: 1px solid var(--borde); }
    h1 { margin: 0; font-size: var(--t-xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    main { padding: var(--e3) var(--e4) var(--e4); display: flex; flex-direction: column; gap: 10px; }
    .card { background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 13px 14px; }
    .fecha { display: block; font-family: var(--mono); font-size: var(--t-xs); color: var(--texto-3); }
    h2 { margin: 4px 0 0; font-size: var(--t-l); font-weight: 700; line-height: 1.25; }
    p { margin: 8px 0 0; font-size: var(--t-m); color: var(--texto-2); line-height: 1.5; white-space: pre-line; }
    .aviso, .vacio { margin: 0; padding: 12px; border: 1px dashed var(--borde); border-radius: var(--r); font-size: var(--t-s); color: var(--texto-2); }
  `,
})
export class PaginaNovedades {
  protected readonly servicio = inject(Novedades);
  protected fecha = (iso: string) => fechaLarga(iso);
  constructor() {
    afterNextRender(() => this.servicio.escuchar());
  }
}
