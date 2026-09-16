import { afterNextRender, Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Barra, Historial } from './shared/ui';
import { Visitas } from './core/visitas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Barra],
  template: `
    <div class="pantalla">
      <router-outlet />
    </div>
    <app-barra />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    .pantalla {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      /* Lugar para la barra fija, más la franja de gestos del teléfono. */
      padding-bottom: calc(var(--barra) + env(safe-area-inset-bottom));
    }
    /* Escritorio: riel de navegación a la izquierda y una columna de lectura
       de hasta 760 px. Es la misma app, no otra. */
    @media (min-width: 900px) {
      :host {
        flex-direction: row;
        align-items: stretch;
        max-width: 1000px;
        border: none;
      }
      app-barra { order: -1; flex: none; }
      .pantalla {
        flex: 1;
        min-width: 0;
        max-width: 760px;
        padding-bottom: 0;
        border-inline: 1px solid var(--borde);
      }
    }
  `,
})
export class App {
  /** Se instancia acá para que empiece a contar navegaciones desde el arranque. */
  private readonly historial = inject(Historial);
  private readonly visitas = inject(Visitas);
  private readonly router = inject(Router);

  constructor() {
    // El contador arranca después del primer dibujo y sólo en el navegador:
    // nunca compite con lo que la persona vino a ver.
    afterNextRender(() => {
      this.visitas.registrar(this.router.url);
      this.router.events.subscribe((e) => {
        if (e instanceof NavigationEnd) this.visitas.registrar(e.urlAfterRedirects);
      });
    });
  }
}
