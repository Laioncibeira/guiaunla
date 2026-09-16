import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sesion } from './sesion';

@Component({
  selector: 'app-admin-panel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header>
      <div class="quien">
        <h1>Administración</h1>
        <p class="sub">{{ sesion.usuario()?.email }}</p>
      </div>
      <button type="button" class="salir" (click)="salir()">Cerrar sesión</button>
    </header>

    @if (sesion.esAdmin()) {
      <nav aria-label="Secciones del panel">
        <a routerLink="/admin/contactos" routerLinkActive="on">Contactos</a>
        <a routerLink="/admin/novedades" routerLinkActive="on">Novedades</a>
        <a routerLink="/admin/visitas" routerLinkActive="on">Visitas</a>
      </nav>
      <router-outlet />
    } @else {
      <main>
        <div class="bloqueado">
          <h2>Tu cuenta todavía no está habilitada</h2>
          <p>
            Entraste bien, pero esta cuenta no figura en la lista de administradores. Quien
            administra tiene que agregarla desde la consola de Firebase.
          </p>
        </div>
      </main>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    header { display: flex; align-items: center; gap: var(--e3); padding: 14px var(--e4) 10px; border-bottom: 1px solid var(--borde); }
    .quien { flex: 1; min-width: 0; }
    h1 { margin: 0; font-size: var(--t-xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .salir { min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--borde); background: var(--superficie); color: var(--texto-2); font-size: var(--t-s); font-weight: 600; }
    nav { display: flex; gap: 6px; padding: 10px var(--e4); }
    nav a { flex: 1; text-align: center; min-height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid var(--borde); background: var(--superficie); color: var(--texto-2); font-size: var(--t-s); font-weight: 600; }
    nav a.on { background: var(--marca); border-color: var(--marca); color: var(--sobre-marca); }
    main { padding: var(--e4); }
    .bloqueado { padding: var(--e4); border: 1px dashed var(--borde); border-radius: var(--r); }
    .bloqueado h2 { margin: 0 0 var(--e2); font-size: var(--t-l); }
    .bloqueado p { margin: 0; font-size: var(--t-m); color: var(--texto-2); line-height: 1.5; }
  `,
})
export class Panel {
  protected readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  constructor() {
    // El panel no es para buscadores.
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  protected async salir(): Promise<void> {
    await this.sesion.salir();
    this.router.navigateByUrl('/admin/ingreso');
  }
}
