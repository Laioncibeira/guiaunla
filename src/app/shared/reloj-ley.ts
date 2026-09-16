import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { transcurrido } from '../paginas/formato';
import { Estrella } from './fei';

/**
 * Cuánto lleva el gobierno sin cumplir la Ley de Financiamiento Universitario.
 *
 * Cuenta desde la promulgación (21 de octubre de 2025) y se actualiza cada
 * minuto, sólo en el navegador: al pre-generar la página no hay reloj que
 * mirar y el número que quedaría fijo sería viejo al instante.
 */
@Component({
  selector: 'app-reloj-ley',
  imports: [Estrella],
  template: `
    <section aria-label="Contador del incumplimiento">
      <div class="chispas" aria-hidden="true">
        <app-estrella color="var(--fei-rojo)" [tam]="10" />
        <app-estrella color="var(--fei-amarillo)" [tam]="14" />
      </div>
      <p class="antetitulo">Contador del incumplimiento</p>
      <h2>Días sin que el gobierno cumpla la Ley de Financiamiento Universitario</h2>

      <div class="fichas" role="timer" aria-live="off">
        <div class="ficha dias">
          <span class="num">{{ t().dias }}</span>
          <span class="rot">días</span>
        </div>
        <div class="ficha">
          <span class="num">{{ dos(t().horas) }}</span>
          <span class="rot">horas</span>
        </div>
        <div class="ficha">
          <span class="num">{{ dos(t().minutos) }}</span>
          <span class="rot">minutos</span>
        </div>
      </div>

      <p class="pie">Desde su promulgación, el 21 de octubre de 2025. <a class="mas" href="https://www.laizquierdadiario.com/Las-autoridades-y-las-conducciones-buscan-entregar-la-ley-de-financiamiento" target="_blank" rel="noopener">Leer más...</a></p>
    </section>
  `,
  styles: `
    :host { display: block; }
    section {
      position: relative; overflow: hidden;
      padding: 16px 16px 14px; border-radius: var(--r);
      background: var(--fei-fondo); border: 1px solid var(--fei-borde); color: #f5f3f7;
    }
    .chispas { position: absolute; top: 12px; right: 14px; display: flex; gap: 6px; align-items: flex-start; }
    .chispas app-estrella:first-child { margin-top: 8px; }
    .antetitulo {
      margin: 0; font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.11em;
      text-transform: uppercase; color: var(--fei-rojo);
    }
    h2 { margin: 5px 24px 12px 0; font-size: var(--t-l); font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; }
    .fichas { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 8px; }
    .ficha {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 10px 6px 8px; border-radius: 10px; background: #221f27; border: 1px solid var(--fei-borde);
    }
    .num {
      font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500;
      font-size: 26px; line-height: 1; color: #f5f3f7;
    }
    .dias .num { font-size: 34px; color: var(--fei-rojo); }
    .rot { font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: #a79db0; }
    .pie { margin: 12px 0 0; font-size: var(--t-xs); color: #a79db0; line-height: 1.4; }
    .mas { color: var(--fei-amarillo); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
  `,
})
export class RelojLey {
  private static readonly PROMULGACION = new Date('2025-10-21T00:00:00-03:00');
  protected readonly t = signal(transcurrido(RelojLey.PROMULGACION, new Date()));

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const tic = () => this.t.set(transcurrido(RelojLey.PROMULGACION, new Date()));
      tic();
      // Al minuto siguiente en punto, y de ahí cada 60 s: el número cambia justo cuando debe.
      const alMinuto = 60000 - (Date.now() % 60000);
      let intervalo = 0;
      const espera = setTimeout(() => {
        tic();
        intervalo = window.setInterval(tic, 60000);
      }, alMinuto);
      destroy.onDestroy(() => {
        clearTimeout(espera);
        clearInterval(intervalo);
      });
    });
  }

  protected dos = (n: number) => String(n).padStart(2, '0');
}
