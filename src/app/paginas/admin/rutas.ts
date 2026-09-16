import { Component } from '@angular/core';
import { Routes } from '@angular/router';

/** Marcador hasta que el panel esté armado. */
@Component({
  selector: 'app-admin-pronto',
  template: `
    <main>
      <h1>Panel de administración</h1>
      <p>Todavía no está disponible.</p>
    </main>
  `,
  styles: `
    main { padding: var(--e5) var(--e4); }
    h1 { margin: 0 0 var(--e2); font-size: var(--t-xl); }
    p { color: var(--texto-2); font-size: var(--t-m); }
  `,
})
export class AdminPronto {}

export const ADMIN_RUTAS: Routes = [{ path: '', component: AdminPronto }];
