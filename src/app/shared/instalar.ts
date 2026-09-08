import { Component, computed, DOCUMENT, inject, signal } from '@angular/core';

/**
 * Aviso para agregar la app al inicio del teléfono.
 *
 * Android dispara `beforeinstallprompt` y se puede instalar con un botón.
 * iPhone no lo dispara nunca: ahí sólo queda explicar los dos toques que
 * hacen falta. Si la app ya está instalada, o si el aviso se cerró antes,
 * no aparece.
 */
@Component({
  selector: 'app-instalar',
  template: `
    @if (visible()) {
      <aside>
        <div class="txt">
          <strong>Agregala a tu inicio</strong>
          <span>{{ instrucciones() }}</span>
        </div>
        @if (sePuedeInstalar()) {
          <button type="button" class="si" (click)="instalar()">Agregar</button>
        }
        <button type="button" class="no" (click)="cerrar()" aria-label="Cerrar el aviso">×</button>
      </aside>
    }
  `,
  styles: `
    aside {
      display: flex;
      align-items: center;
      gap: var(--e2);
      margin: 0 var(--e4) var(--e3);
      padding: 11px 12px;
      border: 1px solid var(--borde);
      border-radius: var(--r);
      background: var(--superficie);
    }
    .txt { flex: 1; min-width: 0; }
    strong { display: block; font-size: var(--t-m); }
    span { display: block; font-size: var(--t-s); color: var(--texto-2); margin-top: 2px; }
    .si {
      flex: none;
      min-height: 40px;
      padding: 0 var(--e3);
      border-radius: var(--r-chico);
      border: 1px solid var(--marca);
      background: var(--marca);
      color: var(--sobre-marca);
      font-size: var(--t-s);
      font-weight: 600;
    }
    .no {
      flex: none;
      width: 36px;
      min-height: 40px;
      border: none;
      background: none;
      color: var(--texto-3);
      font-size: 20px;
      line-height: 1;
    }
  `,
})
export class Instalar {
  private static readonly CLAVE = 'guiaunla.instalar-oculto';
  private readonly doc = inject(DOCUMENT);
  private readonly oculto = signal(this.leerOculto());
  private readonly evento = signal<{ prompt: () => Promise<void> } | null>(null);
  private readonly instalada = signal(this.yaInstalada());

  protected readonly sePuedeInstalar = computed(() => !!this.evento());
  protected readonly visible = computed(() => !this.oculto() && !this.instalada() && this.hayVentana);

  private readonly hayVentana = typeof this.doc.defaultView?.addEventListener === 'function';

  constructor() {
    const v = this.doc.defaultView;
    if (!v) return;
    v.addEventListener('beforeinstallprompt', (e: Event) => {
      // Sin preventDefault, Chrome muestra su propio cartel y pisa a este.
      e.preventDefault();
      this.evento.set(e as unknown as { prompt: () => Promise<void> });
    });
    v.addEventListener('appinstalled', () => this.instalada.set(true));
  }

  protected instrucciones(): string {
    if (this.sePuedeInstalar()) return 'Se abre sin barra del navegador y anda sin señal.';
    return this.esIphone()
      ? 'En iPhone: tocá Compartir y después "Agregar a inicio".'
      : 'Desde el menú del navegador, elegí "Agregar a la pantalla de inicio".';
  }

  protected async instalar(): Promise<void> {
    const e = this.evento();
    if (!e) return;
    await e.prompt();
    this.evento.set(null);
    this.cerrar();
  }

  protected cerrar(): void {
    this.oculto.set(true);
    try {
      localStorage.setItem(Instalar.CLAVE, '1');
    } catch {
      /* sin guardado: vuelve a aparecer la próxima vez */
    }
  }

  private leerOculto(): boolean {
    try {
      return localStorage.getItem(Instalar.CLAVE) === '1';
    } catch {
      return false;
    }
  }

  private yaInstalada(): boolean {
    const v = this.doc.defaultView;
    return !!v?.matchMedia?.('(display-mode: standalone)').matches;
  }

  private esIphone(): boolean {
    const ua = this.doc.defaultView?.navigator.userAgent ?? '';
    return /iPhone|iPad|iPod/i.test(ua);
  }
}
