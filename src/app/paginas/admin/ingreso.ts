import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Sesion } from './sesion';
import { LogoFei } from '../../shared/fei';

@Component({
  selector: 'app-admin-ingreso',
  imports: [LogoFei],
  template: `
    <main>
      <div class="marca">
        <app-logo-fei [ancho]="132" />
        <h1>Administración de la Guía</h1>
      </div>
      <form (submit)="entrar($event)" novalidate>
        <label>
          <span>Mail</span>
          <input type="email" name="email" autocomplete="username" [value]="email()" (input)="email.set($any($event.target).value)" required />
        </label>
        <label>
          <span>Contraseña</span>
          <input type="password" name="clave" autocomplete="current-password" [value]="clave()" (input)="clave.set($any($event.target).value)" required />
        </label>
        @if (error(); as e) {
          <p class="error" role="alert">{{ e }}</p>
        }
        <button type="submit" [disabled]="cargando()">{{ cargando() ? 'Entrando…' : 'Entrar' }}</button>
        <p class="nota">Sólo para personas de la agrupación. Si no tenés cuenta, pedila a quien administra.</p>
      </form>
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    main { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: var(--e5); padding: var(--e5) var(--e4); max-width: 420px; margin: 0 auto; width: 100%; }
    .marca { display: flex; flex-direction: column; align-items: center; gap: var(--e3); padding: var(--e4); border-radius: var(--r); background: var(--fei-fondo); border: 1px solid var(--fei-borde); }
    h1 { margin: 0; font-size: var(--t-l); color: #f5f3f7; text-align: center; }
    form { display: flex; flex-direction: column; gap: var(--e3); }
    label { display: flex; flex-direction: column; gap: 5px; }
    label span { font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    input { font: inherit; font-size: var(--t-m); color: var(--texto); background: var(--superficie); border: 1px solid var(--borde); border-radius: 10px; padding: 10px 12px; min-height: 44px; }
    input:focus { outline: none; border-color: var(--marca); box-shadow: var(--foco); }
    button { min-height: 46px; border-radius: 11px; border: none; background: var(--marca); color: var(--sobre-marca); font-size: var(--t-m); font-weight: 700; }
    button:disabled { opacity: 0.6; }
    .error { margin: 0; font-size: var(--t-s); color: var(--naranja); }
    .nota { margin: 0; font-size: var(--t-xs); color: var(--texto-3); line-height: 1.4; }
  `,
})
export class Ingreso {
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  protected readonly email = signal('');
  protected readonly clave = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly cargando = signal(false);

  protected async entrar(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set(null);
    if (!this.email().trim() || !this.clave()) {
      this.error.set('Completá el mail y la contraseña.');
      return;
    }
    this.cargando.set(true);
    const r = await this.sesion.entrar(this.email(), this.clave());
    this.cargando.set(false);
    if (r === 'ok') this.router.navigateByUrl('/admin');
    else this.error.set(r === 'datos' ? 'Mail o contraseña incorrectos.' : 'No se pudo entrar. Probá de nuevo en un rato.');
  }
}
