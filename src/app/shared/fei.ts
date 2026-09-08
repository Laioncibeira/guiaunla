import { Component, computed, input } from '@angular/core';
import { diasHasta, fechaCorta } from '../paginas/formato';

/**
 * La chispa de cuatro puntas de la identidad del FEI, redibujada en vectorial
 * para que escale y tome cualquiera de los tres colores. Es decorativa: no
 * lleva texto ni la lee un lector de pantalla.
 */
@Component({
  selector: 'app-estrella',
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="tam()" [attr.height]="tam()" aria-hidden="true">
      <path
        d="M12 0.6C12.45 6.6 17.4 11.55 23.4 12C17.4 12.45 12.45 17.4 12 23.4C11.55 17.4 6.6 12.45 0.6 12C6.6 11.55 11.55 6.6 12 0.6Z"
        [attr.fill]="color()"
      />
    </svg>
  `,
  styles: `:host { display: inline-flex; line-height: 0; }`,
})
export class Estrella {
  readonly color = input('var(--fei-violeta)');
  readonly tam = input(14);
}

/** Las tres juntas, como aparecen en los materiales de la lista. */
@Component({
  selector: 'app-estrellas',
  imports: [Estrella],
  template: `
    <app-estrella color="var(--fei-amarillo)" [tam]="tam()" />
    <app-estrella color="var(--fei-rojo)" [tam]="tam()" />
    <app-estrella color="var(--fei-violeta)" [tam]="tam()" />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  `,
})
export class Estrellas {
  readonly tam = input(12);
}

/** El logo blanco. Va siempre sobre fondo oscuro, que es como está pensado. */
@Component({
  selector: 'app-logo-fei',
  template: `
    <picture>
      <source srcset="fei-logo.webp" type="image/webp" />
      <img
        src="fei-logo.png"
        alt="Frente de Estudiantes de Izquierda"
        [style.width.px]="ancho()"
        [style.height.px]="alto()"
        decoding="async"
      />
    </picture>
  `,
  styles: `
    :host { display: inline-flex; line-height: 0; }
    img { display: block; }
  `,
})
export class LogoFei {
  readonly ancho = input(120);
  /** El logo mide 560×278: la altura sale de ahí para que no se deforme. */
  protected readonly alto = computed(() => Math.round((this.ancho() * 278) / 560));
}

/**
 * Convocatoria a las elecciones del centro de estudiantes.
 * Desaparece sola cuando pasa la última fecha: un cartel viejo es peor que
 * ninguno.
 */
@Component({
  selector: 'app-banner-elecciones',
  imports: [Estrella, LogoFei],
  template: `
    @if (vigente()) {
      <a
        class="banner"
        href="https://frente-de-estudiantes-de-izquierda-fei.web.app/"
        rel="noopener"
      >
        <div class="chispas" aria-hidden="true">
          <app-estrella color="var(--fei-amarillo)" [tam]="13" />
          <app-estrella color="var(--fei-rojo)" [tam]="9" />
          <app-estrella color="var(--fei-violeta)" [tam]="17" />
        </div>

        <p class="antetitulo">Elecciones CEDHA 2026</p>
        <p class="fechas">14 al 17 de septiembre</p>
        <p class="cuenta">{{ cuenta() }}</p>

        <div class="lista">
          <span class="siete">Lista 7</span>
          <app-logo-fei [ancho]="112" />
        </div>
      </a>
    }
  `,
  styles: `
    .banner {
      position: relative;
      display: block;
      overflow: hidden;
      padding: 16px 16px 14px;
      border-radius: var(--r);
      background: var(--fei-fondo);
      border: 1px solid var(--fei-borde);
      color: #f5f3f7;
    }
    .chispas {
      position: absolute;
      top: 12px;
      right: 14px;
      display: flex;
      align-items: flex-start;
      gap: 7px;
    }
    .chispas app-estrella:nth-child(2) { margin-top: 12px; }
    .chispas app-estrella:nth-child(3) { margin-top: 4px; }
    .antetitulo {
      margin: 0;
      font-size: var(--t-xs);
      font-weight: 600;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: var(--fei-amarillo);
    }
    .fechas {
      margin: 5px 0 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }
    .cuenta {
      margin: 4px 0 0;
      font-size: var(--t-s);
      color: #b3a9bc;
    }
    .lista {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--fei-borde);
    }
    .siete {
      flex: none;
      padding: 5px 10px;
      border-radius: 999px;
      background: var(--fei-violeta);
      color: #fff;
      font-size: var(--t-s);
      font-weight: 700;
      letter-spacing: 0.01em;
    }
  `,
})
export class BannerElecciones {
  private static readonly DESDE = '2026-09-14';
  private static readonly HASTA = '2026-09-17';

  protected readonly vigente = computed(() => diasHasta(BannerElecciones.HASTA) >= 0);

  protected readonly cuenta = computed(() => {
    const faltan = diasHasta(BannerElecciones.DESDE);
    if (faltan > 1) return `Faltan ${faltan} días · votá en el Departamento`;
    if (faltan === 1) return 'Empiezan mañana · votá en el Departamento';
    if (faltan === 0) return 'Empiezan hoy · votá en el Departamento';
    const hastaFin = diasHasta(BannerElecciones.HASTA);
    return hastaFin === 0
      ? 'Último día para votar'
      : `Podés votar hasta el ${fechaCorta(BannerElecciones.HASTA)}`;
  });
}

/** Firma del pie: quién hizo esto y adónde ir. */
@Component({
  selector: 'app-firma-fei',
  imports: [Estrellas, LogoFei],
  template: `
    <a href="https://frente-de-estudiantes-de-izquierda-fei.web.app/" rel="noopener">
      <app-estrellas [tam]="11" />
      <span>Hecha por estudiantes del</span>
      <app-logo-fei [ancho]="132" />
    </a>
  `,
  styles: `
    :host { display: block; }
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 9px;
      padding: 18px 16px 16px;
      border-radius: var(--r);
      background: var(--fei-fondo);
      border: 1px solid var(--fei-borde);
      color: #a79db0;
      font-size: var(--t-s);
    }
    a:hover { color: #d8cfe0; }
  `,
})
export class FirmaFei {}
