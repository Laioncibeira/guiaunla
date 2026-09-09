import { Component, computed, signal } from '@angular/core';
import { Estrella } from './fei';

interface Paso {
  readonly icono: string;
  readonly titulo: string;
  readonly texto: string;
  readonly seccion: 'menu' | 'grafo';
}

/**
 * Instructivo opcional. Son dos tandas: primero para qué sirve cada botón de
 * la barra de abajo, después cómo se usa el mapa de correlatividades, que es
 * lo único de la app que no se entiende solo.
 */
const PASOS: readonly Paso[] = [
  {
    seccion: 'menu',
    icono: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
    titulo: 'Inicio',
    texto: 'La puerta de entrada: los accesos a tu carrera y lo que está pasando en el Departamento.',
  },
  {
    seccion: 'menu',
    icono: 'M4 5.5h16v13H4zM8 5.5v13M4 12h16',
    titulo: 'Carreras',
    texto: 'El plan de estudios completo de las cuatro carreras, año por año, con el mapa de correlatividades.',
  },
  {
    seccion: 'menu',
    icono: 'M3.5 5h17v15.5h-17zM3.5 9.5h17M8 3v4M16 3v4',
    titulo: 'Horarios',
    texto: 'Qué se cursa este cuatrimestre: día, turno y en qué aula, con link al mapa del campus.',
  },
  {
    seccion: 'menu',
    icono: 'M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3zM9 3v15M15 5.5v15',
    titulo: 'Campus',
    texto: 'Los 32 edificios del predio y cómo llegar a cada uno desde la entrada.',
  },
  {
    seccion: 'menu',
    icono: 'M12 7v5.2l3.4 2',
    titulo: 'Fechas',
    texto: 'El calendario académico: inscripciones, finales y recesos. Cada fecha se puede agendar.',
  },
  {
    seccion: 'grafo',
    icono: 'M6 6h5v4H6zM13 14h5v4h-5zM11 8h2v8h-2z',
    titulo: 'El mapa de correlatividades',
    texto: 'Cada tarjeta es una materia y cada línea va de lo que aprobás a lo que se te abre. Las columnas son los años.',
  },
  {
    seccion: 'grafo',
    icono: 'M12 3v6M12 15v6M3 12h6M15 12h6',
    titulo: 'Tocá una materia',
    texto: 'Se destaca su camino y abajo aparece qué tenés que aprobar antes y qué te habilita después.',
  },
  {
    seccion: 'grafo',
    icono: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5l4 4M8 10.5h5',
    titulo: 'Buscá, acercá o leelo en lista',
    texto: 'Buscás por nombre o código, pellizcás para el zoom, y si preferís leerlo como texto cambiás a Lista.',
  },
];

@Component({
  selector: 'app-tutorial',
  imports: [Estrella],
  template: `
    @if (abierto()) {
      <div class="fondo" (click)="cerrar()"></div>
      <div class="caja" role="dialog" aria-modal="true" aria-label="Cómo usar la Guía UNLa">
        <header>
          <span class="tanda">{{ paso().seccion === 'menu' ? 'Los menúes' : 'El mapa' }}</span>
          <button type="button" class="saltar" (click)="cerrar()">Saltar</button>
        </header>

        <div class="icono" [style.color]="colorPaso()">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path [attr.d]="paso().icono" />
          </svg>
        </div>

        <h2>{{ paso().titulo }}</h2>
        <p>{{ paso().texto }}</p>

        <div class="puntos" aria-hidden="true">
          @for (p of pasos; track $index) {
            <span [class.on]="$index === indice()"></span>
          }
        </div>

        <div class="botones">
          @if (indice() > 0) {
            <button type="button" class="secundario" (click)="anterior()">Atrás</button>
          }
          <button type="button" class="principal" (click)="siguiente()">
            {{ ultimo() ? 'Empezar' : 'Siguiente' }}
          </button>
        </div>
        <p class="paso">{{ indice() + 1 }} de {{ pasos.length }}</p>
      </div>
    } @else {
      <section class="bienvenida">
        <app-estrella color="var(--fei-amarillo)" [tam]="13" />
        <h2>Bienvenidx a la Guía UNLa</h2>
        <p>
          Un espacio que centraliza la información importante de cada carrera: materias, novedades,
          fechas del calendario académico y se vienen cositas.
        </p>
        <button type="button" class="tutorial" (click)="abrir()">Tutorial</button>
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .bienvenida {
      background: var(--superficie);
      border: 1px solid var(--borde);
      border-radius: var(--r);
      padding: var(--e4);
      text-align: center;
    }
    .bienvenida h2 { margin: var(--e2) 0 0; font-size: var(--t-l); font-weight: 700; letter-spacing: -0.01em; }
    .bienvenida p { margin: 7px 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); line-height: 1.5; }
    .tutorial {
      min-height: 44px;
      padding: 0 var(--e5);
      border-radius: 999px;
      border: 1px solid var(--marca);
      background: var(--marca);
      color: var(--sobre-marca);
      font-size: var(--t-m);
      font-weight: 600;
    }
    .fondo { position: fixed; inset: 0; background: rgb(0 0 0 / 62%); z-index: 30; }
    .caja {
      position: fixed;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      z-index: 31;
      background: var(--superficie);
      border-top: 1px solid var(--borde);
      border-radius: var(--r-grande) var(--r-grande) 0 0;
      padding: var(--e3) var(--e4) calc(var(--e4) + env(safe-area-inset-bottom));
      box-shadow: var(--sombra);
      text-align: center;
    }
    .caja header { display: flex; align-items: center; justify-content: space-between; }
    .tanda { font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    .saltar { background: none; border: none; color: var(--texto-2); font-size: var(--t-s); min-height: 40px; padding: 0 4px; }
    .icono { margin: var(--e2) auto 0; width: 54px; height: 54px; border-radius: 15px; background: var(--superficie-2); display: grid; place-items: center; }
    .caja h2 { margin: var(--e3) 0 0; font-size: var(--t-xl); font-weight: 700; letter-spacing: -0.02em; }
    .caja p { margin: 7px 0 0; font-size: var(--t-m); color: var(--texto-2); line-height: 1.5; }
    .puntos { display: flex; justify-content: center; gap: 6px; margin: var(--e4) 0 var(--e3); }
    .puntos span { width: 6px; height: 6px; border-radius: 50%; background: var(--borde); }
    .puntos span.on { background: var(--marca); width: 18px; border-radius: 3px; }
    .botones { display: flex; gap: 8px; }
    .botones button { flex: 1; min-height: 48px; border-radius: 12px; font-size: var(--t-m); font-weight: 600; }
    .principal { border: 1px solid var(--marca); background: var(--marca); color: var(--sobre-marca); }
    .secundario { border: 1px solid var(--borde); background: var(--superficie-2); color: var(--texto); }
    .paso { margin: var(--e2) 0 0 !important; font-size: var(--t-xs) !important; color: var(--texto-3) !important; }
  `,
})
export class Tutorial {
  protected readonly pasos = PASOS;
  protected readonly abierto = signal(false);
  protected readonly indice = signal(0);

  protected readonly paso = computed(() => this.pasos[this.indice()]);
  protected readonly ultimo = computed(() => this.indice() === this.pasos.length - 1);
  protected readonly colorPaso = computed(() =>
    this.paso().seccion === 'menu' ? 'var(--marca)' : 'var(--fei-amarillo)',
  );

  protected abrir(): void {
    this.indice.set(0);
    this.abierto.set(true);
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  protected siguiente(): void {
    if (this.ultimo()) this.cerrar();
    else this.indice.update((i) => i + 1);
  }

  protected anterior(): void {
    this.indice.update((i) => Math.max(0, i - 1));
  }
}
