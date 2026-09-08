import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Barra } from './shared/ui';

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
  `,
})
export class App {}
