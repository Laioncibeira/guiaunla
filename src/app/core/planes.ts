import { inject, Injectable, signal } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { cargarGrilla, cargarPlan, type Carrera, type Horarios } from './datos';

/**
 * Los planes y grillas ya cargados, para leerlos de forma sincrónica desde
 * cualquier pantalla. Cada uno se pide una sola vez: la segunda vez sale de
 * acá, y el archivo ya quedó guardado por el service worker para el modo sin
 * señal.
 */
@Injectable({ providedIn: 'root' })
export class Planes {
  private readonly planes = signal<ReadonlyMap<string, Carrera | null>>(new Map());
  private readonly grillas = signal<ReadonlyMap<string, Horarios | null>>(new Map());
  private readonly pedidos = new Map<string, Promise<unknown>>();

  /** El plan si ya está cargado; `undefined` mientras no se pidió o no llegó. */
  carrera(slug: string | null | undefined): Carrera | null | undefined {
    return slug ? this.planes().get(slug) : null;
  }

  /** La grilla si ya está cargada; `null` si la carrera no tiene; `undefined` si no llegó. */
  grilla(slug: string | null | undefined): Horarios | null | undefined {
    return slug ? this.grillas().get(slug) : null;
  }

  cargar(slug: string | null | undefined): Promise<Carrera | null> {
    if (!slug) return Promise.resolve(null);
    return this.una('plan:' + slug, async () => {
      const c = await cargarPlan(slug).catch(() => null);
      this.planes.update((m) => new Map(m).set(slug, c));
      return c;
    });
  }

  cargarGrilla(slug: string | null | undefined): Promise<Horarios | null> {
    if (!slug) return Promise.resolve(null);
    return this.una('grilla:' + slug, async () => {
      const h = await cargarGrilla(slug).catch(() => null);
      this.grillas.update((m) => new Map(m).set(slug, h));
      return h;
    });
  }

  private una<T>(clave: string, tarea: () => Promise<T>): Promise<T> {
    let p = this.pedidos.get(clave) as Promise<T> | undefined;
    if (!p) {
      p = tarea();
      this.pedidos.set(clave, p);
    }
    return p;
  }
}

/**
 * Para las rutas con `:slug`: el router espera a que el plan esté cargado
 * antes de mostrar la pantalla, así el pre-render sale completo y el
 * navegador no dibuja un esqueleto. Un slug desconocido resuelve null.
 */
export const resolverCarrera: ResolveFn<Carrera | null> = (ruta) =>
  inject(Planes).cargar(ruta.paramMap.get('slug'));

/** Igual, pero también deja lista la grilla: el mapa marca qué se dicta hoy. */
export const resolverCarreraConGrilla: ResolveFn<Carrera | null> = async (ruta) => {
  const planes = inject(Planes);
  const slug = ruta.paramMap.get('slug');
  const [c] = await Promise.all([planes.cargar(slug), planes.cargarGrilla(slug)]);
  return c;
};
