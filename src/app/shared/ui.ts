import { Location } from '@angular/common';
import { Component, computed, effect, inject, Injectable, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { resumenPorSlug, type Carrera, type ResumenCarrera } from '../core/datos';
import { Planes } from '../core/planes';

/** Íconos dibujados: nada de emoji, para que escalen y tomen el color del tema. */
export const ICONOS: Record<string, string> = {
  inicio: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  carreras: 'M4 5.5h16v13H4zM8 5.5v13M4 12h16',
  horarios: 'M3.5 5h17v15.5h-17zM3.5 9.5h17M8 3v4M16 3v4',
  mapa: 'M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3zM9 3v15M15 5.5v15',
  calendario: 'M12 7v5.2l3.4 2',
  buscar: 'm15.5 15.5 4 4',
  atras: 'M14.5 5.5 8 12l6.5 6.5',
  grafo: 'M5 4.5h4v4H5zM15 4.5h4v4h-4zM10 15.5h4v4h-4zM7 8.5v3.5h10V8.5M12 12v3.5',
};

@Component({
  selector: 'app-icono',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="tam()"
      [attr.height]="tam()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @if (nombre() === 'calendario') {
        <circle cx="12" cy="12" r="9" />
      }
      @if (nombre() === 'buscar') {
        <circle cx="10.5" cy="10.5" r="6.5" />
      }
      <path [attr.d]="d()" />
    </svg>
  `,
  styles: `:host { display: inline-flex; }`,
})
export class Icono {
  readonly nombre = signal<string>('inicio');
  readonly tam = signal(20);
  protected readonly d = computed(() => ICONOS[this.nombre()] ?? '');
}

/** Barra inferior fija: cinco destinos, sin menú hamburguesa. */
@Component({
  selector: 'app-barra',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Secciones">
      <a class="marca" routerLink="/" aria-hidden="true" tabindex="-1">Guía UNLa</a>
      @for (d of destinos; track d.ruta) {
        <a
          [routerLink]="d.ruta"
          routerLinkActive="activo"
          [routerLinkActiveOptions]="{ exact: d.ruta === '/' }"
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            @if (d.icono === 'calendario') {
              <circle cx="12" cy="12" r="9" />
            }
            <path [attr.d]="ruta(d.icono)" />
          </svg>
          <span>{{ d.etiqueta }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    nav {
      /* Fija, no sticky: en las pantallas que scrollean la sticky se iba con el
         contenido. Va centrada y con el mismo ancho que la columna de la app. */
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border-top: 1px solid var(--borde);
      background: var(--superficie);
      padding: 7px 4px calc(10px + env(safe-area-inset-bottom));
      z-index: 20;
    }
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      min-height: 48px;
      justify-content: center;
      color: var(--texto-3);
      font-size: 9.5px;
      text-decoration: none;
    }
    a.activo {
      color: var(--marca);
    }
    .marca { display: none; }

    @media (min-width: 900px) {
      nav {
        position: sticky;
        top: 0;
        left: auto;
        transform: none;
        width: 220px;
        max-width: none;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 20px 12px;
        border-top: none;
        border-right: 1px solid var(--borde);
        background: var(--bg);
      }
      .marca {
        display: block;
        padding: 6px 12px 18px;
        font-size: var(--t-xl);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--texto);
      }
      a:not(.marca) {
        flex-direction: row;
        justify-content: flex-start;
        gap: 12px;
        min-height: 44px;
        padding: 0 12px;
        border-radius: 10px;
        font-size: var(--t-m);
        font-weight: 500;
      }
      a.activo {
        background: color-mix(in srgb, var(--marca) 12%, transparent);
      }
      a:not(.marca):hover {
        background: var(--superficie);
      }
    }
  `,
})
export class Barra {
  protected readonly destinos = [
    { ruta: '/', icono: 'inicio', etiqueta: 'Inicio' },
    { ruta: '/carrera', icono: 'carreras', etiqueta: 'Tu carrera' },
    { ruta: '/horarios', icono: 'horarios', etiqueta: 'Horarios' },
    { ruta: '/campus', icono: 'mapa', etiqueta: 'Campus' },
    { ruta: '/fechas', icono: 'calendario', etiqueta: 'Fechas' },
  ];
  protected ruta(icono: string): string {
    return ICONOS[icono] ?? '';
  }
}

/**
 * La carrera que el estudiante eligió, recordada en su teléfono.
 * localStorage puede fallar (ventana privada, ajustes del navegador) o no
 * existir en el pre-render: la app tiene que andar igual sin él.
 */
@Injectable({ providedIn: 'root' })
export class CarreraElegida {
  private static readonly CLAVE = 'guiaunla.carrera';
  private readonly planes = inject(Planes);
  private readonly interno = signal<string | null>(this.leer());
  readonly slug = this.interno.asReadonly();
  /** Nombre, departamento y cantidades: siempre disponible, sale del índice. */
  readonly resumen = computed<ResumenCarrera | null>(() => resumenPorSlug(this.interno()) ?? null);
  /** El plan completo: null hasta que termina de cargar (un instante). */
  readonly carrera = computed<Carrera | null>(() => this.planes.carrera(this.interno()) ?? null);

  constructor() {
    // Apenas se sabe la carrera se piden su plan y su grilla, que es lo que
    // el estudiante va a mirar. En el pre-render no hay carrera elegida.
    effect(() => {
      const s = this.interno();
      if (!s) return;
      void this.planes.cargar(s);
      void this.planes.cargarGrilla(s);
    });
  }

  elegir(slug: string): void {
    this.interno.set(slug);
    try {
      localStorage.setItem(CarreraElegida.CLAVE, slug);
    } catch {
      /* sin guardado: la elección vale para esta sesión */
    }
  }

  private leer(): string | null {
    try {
      return localStorage.getItem(CarreraElegida.CLAVE);
    } catch {
      return null;
    }
  }
}

/** Materias marcadas como aprobadas, por carrera, sólo en este teléfono. */
@Injectable({ providedIn: 'root' })
export class Aprobadas {
  private readonly mapa = signal<Record<string, string[]>>(this.leer());

  de(slug: string): ReadonlySet<string> {
    return new Set(this.mapa()[slug] ?? []);
  }

  alternar(slug: string, codigo: string): void {
    const actual = new Set(this.mapa()[slug] ?? []);
    if (actual.has(codigo)) actual.delete(codigo);
    else actual.add(codigo);
    const nuevo = { ...this.mapa(), [slug]: [...actual] };
    this.mapa.set(nuevo);
    try {
      localStorage.setItem('guiaunla.aprobadas', JSON.stringify(nuevo));
    } catch {
      /* sin guardado: vale para esta sesión */
    }
  }

  limpiar(slug: string): void {
    const nuevo = { ...this.mapa(), [slug]: [] };
    this.mapa.set(nuevo);
    try {
      localStorage.setItem('guiaunla.aprobadas', JSON.stringify(nuevo));
    } catch {
      /* sin guardado */
    }
  }

  readonly señal = this.mapa.asReadonly();

  private leer(): Record<string, string[]> {
    try {
      const crudo = localStorage.getItem('guiaunla.aprobadas');
      const v = crudo ? JSON.parse(crudo) : {};
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch {
      return {};
    }
  }
}

export const usarCarrera = () => inject(CarreraElegida);

/**
 * Cuenta las navegaciones hechas dentro de la app, para saber si "atrás"
 * puede usar el historial del navegador o tiene que ir a una ruta fija.
 *
 * Quien entra por un link compartido no tiene adónde volver: el historial
 * anterior es de otro sitio o no existe. Quien llegó tocando dentro de la app
 * sí, y ahí "atrás" tiene que ser el atrás de verdad.
 */
@Injectable({ providedIn: 'root' })
export class Historial {
  private readonly router = inject(Router);
  private readonly internas = signal(0);
  /** La última URL antes de la actual, o null si no hubo. */
  readonly previa = signal<string | null>(null);
  private actual: string | null = null;

  constructor() {
    this.router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      if (this.actual !== null && this.actual !== e.urlAfterRedirects) {
        this.previa.set(this.actual);
        this.internas.update((n) => n + 1);
      }
      this.actual = e.urlAfterRedirects;
    });
  }

  /** Hay una pantalla anterior de esta misma app en el historial. */
  puedeVolver(): boolean {
    return this.internas() > 0;
  }
}

/** Botón "atrás": vuelve a la pantalla anterior; si no hay, a la de respaldo. */
@Component({
  selector: 'app-atras',
  template: `
    <button type="button" (click)="volver()" [attr.aria-label]="'Volver a ' + nombre()">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    button {
      width: 32px; height: 32px; flex: none; display: grid; place-items: center;
      border: 1px solid var(--borde); border-radius: 9px; background: var(--superficie);
      color: var(--texto-2); padding: 0;
    }
  `,
})
export class Atras {
  /** Adónde ir cuando no hay historial propio (link compartido, recarga). */
  readonly respaldo = input('/');
  /** Nombre de esa pantalla, para el lector de pantalla. */
  readonly nombre = input('la pantalla anterior');
  private readonly historial = inject(Historial);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  protected volver(): void {
    if (this.historial.puedeVolver()) this.location.back();
    else this.router.navigateByUrl(this.respaldo());
  }
}

/**
 * La carrera elegida como chip con "Cambiar". Lleva al selector y, al elegir,
 * vuelve a la pantalla desde la que se tocó.
 */
@Component({
  selector: 'app-carrera-chip',
  imports: [RouterLink],
  template: `
    <a routerLink="/carrera/elegir" [queryParams]="{ volver: volver() }" class="chip">
      @if (elegida.resumen(); as c) {
        <span class="nombre">{{ c.nombreCorto }}</span>
        <span class="cambiar">Cambiar</span>
      } @else {
        <span class="cambiar">Elegí tu carrera</span>
      }
    </a>
  `,
  styles: `
    :host { display: inline-flex; max-width: 100%; }
    .chip {
      display: inline-flex; align-items: center; gap: 7px; min-height: 36px; max-width: 100%;
      padding: 0 12px; border: 1px solid var(--borde); border-radius: 999px;
      background: var(--superficie); color: var(--texto-2); font-size: var(--t-s);
      text-decoration: none;
    }
    .nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cambiar { flex: none; color: var(--marca); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
  `,
})
export class CarreraChip {
  protected readonly elegida = inject(CarreraElegida);
  private readonly router = inject(Router);
  /** La URL a la que volver después de elegir: la actual, sin parámetros. */
  protected volver(): string {
    return this.router.url.split('?')[0] || '/';
  }
}
