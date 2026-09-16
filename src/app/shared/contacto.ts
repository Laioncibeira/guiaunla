import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Contacto, CONTACTO_MAX, MENSAJE_MAX, validar, type ResultadoEnvio } from '../core/contacto';
import { Estrellas } from './fei';

/** Un formulario que se manda en menos de esto no lo escribió una persona. */
const TIEMPO_MINIMO_MS = 3000;

/**
 * Formulario de propuestas y consultas para las secretarías del centro.
 *
 * Sin cuenta ni datos obligatorios más que un modo de responder. Contra el
 * spam: un campo trampa fuera de pantalla, un tiempo mínimo de escritura y
 * una espera entre envíos; el resto lo aplican las reglas del servidor.
 */
@Component({
  selector: 'app-contacto',
  imports: [Estrellas],
  template: `
    <section aria-labelledby="contacto-titulo">
      <div class="cabecera">
        <app-estrellas [tam]="11" />
        <h2 id="contacto-titulo">¡Las secretarías del centro de estudiantes, las construimos entre todes!</h2>
      </div>

      @if (estado() === 'enviado' || estado() === 'encolado') {
        <div class="gracias" role="status">
          <strong>{{ estado() === 'enviado' ? '¡Gracias! Nos llegó.' : '¡Gracias! Se envía apenas haya señal.' }}</strong>
          <span>Lo lee alguien de la agrupación y te responde por el contacto que dejaste.</span>
          <button type="button" (click)="otro()">Mandar otra</button>
        </div>
      } @else if (estado() === 'cerrado') {
        <p class="aviso" role="status">
          El formulario está cerrado por ahora. Escribinos por Instagram y te respondemos igual.
        </p>
      } @else {
        <form (submit)="enviar($event)" novalidate>
          <label class="campo">
            <span class="rot">Dejá tus propuestas o consultas</span>
            <textarea
              name="mensaje"
              rows="4"
              [attr.maxlength]="maxMensaje"
              [value]="mensaje()"
              (input)="mensaje.set($any($event.target).value)"
              placeholder="Qué querés que hagamos, qué falta, qué te pasó…"
              [attr.aria-invalid]="!!error()"
            ></textarea>
            <span class="contador" [class.al-limite]="mensaje().length >= maxMensaje">{{ mensaje().length }}/{{ maxMensaje }}</span>
          </label>

          <label class="campo">
            <span class="rot">Contacto</span>
            <input
              type="text"
              name="contacto"
              [attr.maxlength]="maxContacto"
              [value]="contacto()"
              (input)="contacto.set($any($event.target).value)"
              placeholder="Mail, Instagram o teléfono"
              autocomplete="off"
            />
          </label>

          <!-- Campo trampa: las personas no lo ven; los bots lo completan. -->
          <label class="trampa" aria-hidden="true">
            Sitio web
            <input type="text" name="web" tabindex="-1" autocomplete="off" [value]="trampa()" (input)="trampa.set($any($event.target).value)" />
          </label>

          @if (error(); as e) {
            <p class="error" role="alert">{{ e }}</p>
          }

          <button type="submit" class="enviar" [disabled]="estado() === 'enviando'">
            {{ estado() === 'enviando' ? 'Enviando…' : 'Enviar' }}
          </button>
          <p class="privacidad">
            Lo leen sólo las personas de la agrupación, para responderte. No hace falta que pongas tu nombre.
          </p>
        </form>
      }

      <div class="firmas" aria-label="Firmas de la lista">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    section {
      padding: 16px 16px 14px; border-radius: var(--r);
      background: var(--fei-fondo); border: 1px solid var(--fei-borde); color: #f5f3f7;
    }
    .cabecera { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    h2 { margin: 0; font-size: var(--t-l); font-weight: 700; line-height: 1.3; letter-spacing: -0.01em; }
    form { display: flex; flex-direction: column; gap: 12px; }
    .campo { display: flex; flex-direction: column; gap: 6px; position: relative; }
    .rot { font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: #a79db0; }
    textarea, input[type='text'] {
      width: 100%; font: inherit; font-size: var(--t-m); color: #f5f3f7;
      background: #221f27; border: 1px solid var(--fei-borde); border-radius: 10px;
      padding: 10px 12px; min-height: 44px; resize: vertical;
    }
    textarea::placeholder, input::placeholder { color: #736b7c; }
    textarea:focus, input:focus { outline: none; border-color: var(--fei-violeta); box-shadow: 0 0 0 3px color-mix(in oklab, var(--fei-violeta) 40%, transparent); }
    .contador { align-self: flex-end; font-family: var(--mono); font-size: var(--t-xs); color: #a79db0; }
    .contador.al-limite { color: var(--fei-amarillo); }
    .trampa { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
    .error { margin: 0; font-size: var(--t-s); color: var(--fei-amarillo); }
    .enviar {
      min-height: 46px; border-radius: 11px; border: none;
      background: var(--fei-violeta); color: #fff; font-size: var(--t-m); font-weight: 700;
    }
    .enviar:disabled { opacity: 0.6; }
    .privacidad { margin: 0; font-size: var(--t-xs); color: #a79db0; line-height: 1.4; }
    .gracias { display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 10px; background: #221f27; border: 1px solid var(--fei-borde); font-size: var(--t-s); color: #a79db0; }
    .gracias strong { color: #f5f3f7; font-size: var(--t-m); }
    .gracias button { align-self: flex-start; margin-top: 4px; min-height: 40px; padding: 0 12px; border-radius: 9px; border: 1px solid var(--fei-borde); background: none; color: var(--fei-amarillo); font-size: var(--t-s); font-weight: 600; }
    .aviso { margin: 0; padding: 12px; border-radius: 10px; background: #221f27; font-size: var(--t-s); color: #a79db0; line-height: 1.4; }
    .firmas:empty { display: none; }
    .firmas { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--fei-borde); }
  `,
})
export class FormularioContacto {
  private readonly servicio = inject(Contacto);
  private readonly router = inject(Router);

  protected readonly maxMensaje = MENSAJE_MAX;
  protected readonly maxContacto = CONTACTO_MAX;
  protected readonly mensaje = signal('');
  protected readonly contacto = signal('');
  protected readonly trampa = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly estado = signal<'listo' | 'enviando' | ResultadoEnvio>('listo');

  private montado = 0;

  constructor() {
    afterNextRender(() => {
      this.montado = performance.now();
      this.servicio.abierto().then((ok) => {
        if (!ok) this.estado.set('cerrado');
      });
    });
  }

  protected async enviar(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set(null);

    // Un bot completó el campo trampa o mandó al instante: se simula éxito y
    // no se escribe nada, para no darle pistas.
    if (this.trampa() || performance.now() - this.montado < TIEMPO_MINIMO_MS) {
      this.estado.set('enviado');
      return;
    }

    const problema = validar(this.mensaje(), this.contacto());
    if (problema) {
      this.error.set(problema);
      return;
    }

    const espera = this.servicio.esperaRestante();
    if (espera > 0) {
      this.error.set(`Ya mandaste uno hace poco. Probá de nuevo en ${espera} segundos.`);
      return;
    }

    this.estado.set('enviando');
    const ruta = this.router.url.split('?')[0].replace(/^\//, '').replace(/\//g, '-') || 'inicio';
    const r = await this.servicio.enviar(this.mensaje(), this.contacto(), ruta);
    if (r === 'error') {
      this.estado.set('listo');
      this.error.set('No se pudo enviar. Probá de nuevo en un rato.');
      return;
    }
    if (r === 'esperar') {
      this.estado.set('listo');
      this.error.set('Ya mandaste uno hace poco. Esperá un minuto.');
      return;
    }
    this.estado.set(r);
  }

  protected otro(): void {
    this.mensaje.set('');
    this.contacto.set('');
    this.estado.set('listo');
    this.montado = performance.now();
  }
}
