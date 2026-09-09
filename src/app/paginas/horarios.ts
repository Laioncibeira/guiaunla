import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CAMPUS,
  DIAS,
  DIA_CORTO,
  NOMBRE_DIA,
  NOMBRE_TURNO,
  TURNOS,
  horariosDe,
  type Clase,
  type Dia,
  type Ubicacion,
} from '../core/datos';
import { CarreraElegida } from '../shared/ui';
import { FirmaFei } from '../shared/fei';

/** Índice del día de hoy en la semana; el domingo cae en lunes. */
function diaDeHoy(): Dia {
  const d = new Date().getDay();
  return DIAS[d === 0 ? 0 : d - 1] ?? 'lunes';
}

@Component({
  selector: 'app-horarios',
  imports: [RouterLink, FirmaFei],
  template: `
    <header>
      <div style="flex:1">
        <h1>Horarios</h1>
        <p class="sub">
          @if (carrera(); as c) {
            {{ c.nombreCorto }} · {{ horarios()?.periodoNombre }}
          } @else {
            Elegí tu carrera para verlos
          }
        </p>
      </div>
    </header>

    @if (horarios(); as h) {
      <div class="dias" role="tablist" aria-label="Día de la semana">
        @for (d of dias; track d) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="d === dia()"
            [class.on]="d === dia()"
            (click)="dia.set(d)"
          >
            {{ corto(d) }}
            @if (cuentaPorDia().get(d); as n) {
              <span class="cuenta">{{ n }}</span>
            }
          </button>
        }
      </div>

      <main>
        @for (t of turnos; track t) {
          @if (delTurno(t).length) {
            <section>
              <h2 class="rot">{{ nombreTurno(t) }}</h2>
              @for (c of delTurno(t); track c.materiaTexto + c.turno + $index) {
                <article class="clase">
                  <div class="nombre">
                    {{ nombreDe(c) }}
                    @if (c.fueraDePlan) {
                      <span class="et">optativa o seminario</span>
                    }
                  </div>
                  <div class="lugares">
                    @for (u of c.ubicaciones; track $index) {
                      @if (u.virtual) {
                        <span class="lugar virtual">Virtual</span>
                      } @else if (u.edificio) {
                        <a class="lugar" routerLink="/campus" [queryParams]="{ edificio: u.edificio }">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3zM9 3v15M15 5.5v15"/></svg>
                          {{ etiquetaLugar(u) }}
                        </a>
                      } @else {
                        <span class="lugar">{{ u.aula }}</span>
                      }
                    }
                  </div>
                </article>
              }
            </section>
          }
        }

        @if (!clasesDelDia().length) {
          <p class="vacio">No hay clases cargadas para el {{ nombreDia(dia()) }}.</p>
        }

        <p class="fuente">
          {{ h.fuente }}, {{ h.periodoNombre }}. {{ h.nota }}
        </p>
        <app-firma-fei />
      </main>
    } @else {
      <main>
        <div class="sinCarrera">
          <h2>Todavía no elegiste carrera</h2>
          <p>Los horarios son distintos en cada una. Elegí la tuya y vemos qué se cursa hoy.</p>
          <a class="boton" routerLink="/carreras">Elegir carrera</a>
        </div>
        <app-firma-fei />
      </main>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { display: flex; align-items: center; gap: var(--e3); padding: 18px var(--e4) var(--e3); }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .dias { display: flex; gap: 5px; padding: 0 var(--e4) var(--e3); }
    .dias button {
      flex: 1; min-height: 48px; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 2px; border-radius: 10px; border: 1px solid var(--borde);
      background: var(--superficie); color: var(--texto-2); font-size: var(--t-s); font-weight: 600;
    }
    .dias button.on { border-color: var(--marca); background: var(--marca); color: var(--sobre-marca); }
    .cuenta { font-size: 9.5px; opacity: .75; font-weight: 500; }
    main { flex: 1; padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e4); }
    .rot { margin: 0 0 var(--e2); font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    .clase { background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 12px 13px; margin-bottom: 8px; }
    .nombre { font-size: var(--t-m); font-weight: 600; line-height: 1.3; }
    .et { display: inline-block; margin-left: 6px; font-size: var(--t-xs); font-weight: 500; color: var(--naranja); border: 1px solid var(--naranja); border-radius: 999px; padding: 1px 7px; vertical-align: 2px; }
    .lugares { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
    .lugar {
      display: inline-flex; align-items: center; gap: 5px; min-height: 34px; padding: 0 10px;
      border: 1px solid var(--borde); border-radius: 9px; font-size: var(--t-s); color: var(--texto-2);
    }
    a.lugar { color: var(--marca); border-color: color-mix(in oklab, var(--marca) 45%, var(--borde)); }
    .virtual { color: var(--verde); border-color: color-mix(in oklab, var(--verde) 45%, var(--borde)); }
    .vacio { font-size: var(--t-m); color: var(--texto-2); }
    .fuente { font-size: var(--t-xs); color: var(--texto-3); line-height: 1.45; margin: 0; }
    .sinCarrera { background: var(--superficie); border: 1px dashed var(--borde); border-radius: var(--r); padding: var(--e4); }
    .sinCarrera h2 { margin: 0 0 var(--e2); font-size: var(--t-l); }
    .sinCarrera p { margin: 0 0 var(--e3); font-size: var(--t-m); color: var(--texto-2); line-height: 1.5; }
    .boton { display: flex; align-items: center; justify-content: center; min-height: 46px; border-radius: 10px; background: var(--marca); color: var(--sobre-marca); font-size: var(--t-m); font-weight: 600; }
  `,
})
export class Horarios {
  private readonly elegida = inject(CarreraElegida);
  protected readonly dias = DIAS;
  protected readonly turnos = TURNOS;
  protected readonly dia = signal<Dia>(diaDeHoy());

  protected readonly carrera = computed(() => this.elegida.carrera());
  protected readonly horarios = computed(() => {
    const c = this.carrera();
    return c ? horariosDe(c.slug) : undefined;
  });

  protected readonly clasesDelDia = computed(
    () => this.horarios()?.clases.filter((c) => c.dia === this.dia()) ?? [],
  );

  protected readonly cuentaPorDia = computed(() => {
    const m = new Map<Dia, number>();
    for (const c of this.horarios()?.clases ?? []) m.set(c.dia, (m.get(c.dia) ?? 0) + 1);
    return m;
  });

  protected delTurno = (t: string) => this.clasesDelDia().filter((c) => c.turno === t);
  protected corto = (d: Dia) => DIA_CORTO[d];
  protected nombreDia = (d: Dia) => NOMBRE_DIA[d].toLowerCase();
  protected nombreTurno = (t: string) => NOMBRE_TURNO[t as keyof typeof NOMBRE_TURNO];

  /** El nombre del plan cuando se pudo emparejar; si no, el de la grilla. */
  protected nombreDe(c: Clase): string {
    const carrera = this.carrera();
    if (!c.materiaCodigo || !carrera) return c.materiaTexto;
    return carrera.materias.find((m) => m.codigo === c.materiaCodigo)?.nombre ?? c.materiaTexto;
  }

  /**
   * "Aula 3 · José Hernández". Cuando el aula ya es el nombre del lugar
   * (el Estudio de Grabación, por ejemplo) no se repite.
   */
  protected etiquetaLugar(u: Ubicacion): string {
    const e = CAMPUS.edificios.find((x) => x.id === u.edificio);
    const edificio = e ? e.nombre.replace(/^Edificio\s+/, '') : '';
    const aula = u.aula ?? '';
    if (!edificio) return aula;
    if (!aula || edificio.toLowerCase().includes(aula.toLowerCase())) return edificio;
    return `${aula} · ${edificio}`;
  }
}
