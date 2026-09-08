import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CARRERAS, type Carrera } from '../core/datos';

/** Íconos dibujados: nada de emoji, para que escalen y tomen el color del tema. */
export const ICONOS: Record<string, string> = {
  inicio: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  carreras: 'M4 5.5h16v13H4zM8 5.5v13M4 12h16',
  horarios: 'M3.5 5h17v15.5h-17zM3.5 9.5h17M8 3v4M16 3v4',
  mapa: 'M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3zM9 3v15M15 5.5v15',
  calendario: 'M12 7v5.2l3.4 2',
  buscar: 'm15.5 15.5 4 4',
  atras: 'M14.5 5.5 8 12l6.5 6.5',
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
  `,
})
export class Barra {
  protected readonly destinos = [
    { ruta: '/', icono: 'inicio', etiqueta: 'Inicio' },
    { ruta: '/carreras', icono: 'carreras', etiqueta: 'Carreras' },
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
  private readonly interno = signal<string | null>(this.leer());
  readonly slug = this.interno.asReadonly();
  readonly carrera = computed<Carrera | null>(
    () => CARRERAS.find((c) => c.slug === this.interno()) ?? null,
  );

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
