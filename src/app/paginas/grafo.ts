import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  anios,
  carreraPorSlug,
  dictadasAhora,
  tieneCuatrimestres,
  type Carrera,
  type Materia,
} from '../core/datos';
import { buscar, vincular } from '../core/correlatividades';
import {
  aplicarFiltros,
  calcularRama,
  calcularRelacionadas,
  construirArbol,
  construirFilas,
  simular,
  type Fila,
  type Filtro,
} from '../core/explorar';
import { calcularLayout, detalleDe, encuadrar, TARJETA, type Layout } from '../core/grafo';
import { Aprobadas, CarreraElegida } from '../shared/ui';

/** Con este ancho de viewBox la tarjeta se lee cómoda en un teléfono. */
const CERCA_ANCHO = 340;
/** Proporción de reserva hasta que se pueda medir el lienzo de verdad. */
const PROPORCION = 1.3;

const FILTROS: readonly { clave: Filtro; label: string }[] = [
  { clave: 'puedo-cursar', label: 'Puedo cursar' },
  { clave: 'se-dicta', label: 'Se dicta ahora' },
  { clave: 'aprobadas', label: 'Aprobadas' },
];

@Component({
  selector: 'app-grafo',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (carrera(); as c) {
      <header>
        <a class="atras" [routerLink]="['/carreras', c.slug]" aria-label="Volver a la carrera">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
        </a>
        <div class="titulo">
          <h1>Correlatividades</h1>
          <p class="sub">{{ c.nombreCorto }} · {{ c.materias.length }} materias</p>
        </div>
        <div class="vistas" role="group" aria-label="Cómo ver el plan">
          <button type="button" [class.on]="vista() === 'mapa'" (click)="vista.set('mapa')">Mapa</button>
          <button type="button" [class.on]="vista() === 'lista'" (click)="vista.set('lista')">Lista</button>
        </div>
      </header>

      <div class="buscador">
        <label class="caja" [class.activa]="!!consulta()">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/></svg>
          <input
            type="search"
            placeholder="Buscar una materia"
            autocomplete="off"
            [value]="consulta()"
            (input)="consulta.set($any($event.target).value)"
            aria-label="Buscar una materia del plan"
          />
          @if (consulta()) {
            <button type="button" (click)="consulta.set('')" aria-label="Borrar la búsqueda">×</button>
          }
        </label>
      </div>

      @if (!consulta()) {
        <div class="filtros">
          @for (f of filtros; track f.clave) {
            <button
              type="button"
              class="chip"
              [class.on]="activos().has(f.clave)"
              [attr.aria-pressed]="activos().has(f.clave)"
              (click)="alternarFiltro(f.clave)"
            >
              {{ f.label }}
            </button>
          }
          @if (activos().size || seleccion().size) {
            <button type="button" class="chip limpiar" (click)="limpiarTodo()">Limpiar</button>
          }
        </div>
      }

      @if (simulacion(); as sim) {
        <div class="sim" role="status">
          <div class="sim-datos">
            <span
              ><strong>{{ seleccion().size }}</strong>
              {{ seleccion().size === 1 ? 'materia prendida' : 'materias prendidas' }}</span
            >
            <span>Se habilitarían <strong>{{ sim.desbloqueadas.length }}</strong></span>
            <span>Avance <strong>{{ sim.porcentajeAntes }}%</strong> → <strong>{{ sim.porcentajeDespues }}%</strong></span>
          </div>
          @if (sim.desbloqueadas.length) {
            <p class="sim-lista">Se abren: {{ nombresDesbloqueadas() }}</p>
          }
        </div>
      }

      @if (consulta()) {
        <ul class="resultados">
          @for (m of resultados(); track m.codigo) {
            <li>
              <button type="button" (click)="irA(m.codigo)">
                <span class="raya" [style.background]="color(anioDeMateria(c, m))"></span>
                <span class="txt">
                  <span class="nom">{{ m.nombre }}</span>
                  <span class="meta"
                    ><span class="mono">{{ m.codigo }}</span> · {{ ubicacion(c, m) }}</span
                  >
                </span>
              </button>
            </li>
          } @empty {
            <li class="nada">No hay materias con ese nombre.</li>
          }
        </ul>
      } @else if (vista() === 'lista') {
        <ng-template #ramaTpl let-n>
          <li class="rama-nodo">
            <div class="rama-fila">
              <span class="caret" aria-hidden="true">{{ n.hijos.length ? '▾' : '·' }}</span>
              <button type="button" class="mini" [class.ok]="n.aprobada" (click)="prender(n.materia.codigo)">
                <span class="mono">{{ n.materia.codigo }}</span>
                <span class="n">{{ n.materia.nombre }}</span>
                @if (n.aprobada) {
                  <span class="tilde" aria-label="aprobada">✓</span>
                }
              </button>
            </div>
            @if (n.hijos.length) {
              <ul class="rama-hijos">
                @for (h of n.hijos; track h.materia.codigo) {
                  <ng-container *ngTemplateOutlet="ramaTpl; context: { $implicit: h }" />
                }
              </ul>
            }
          </li>
        </ng-template>

        <div class="lista">
          <p class="instruccion">
            Tocá una o varias materias para abrir su rama y simular tu avance: lo que
            <strong>necesitan</strong> y lo que <strong>destraban</strong>. El resto queda en gris.
          </p>

          @for (a of aniosDe(c); track a) {
            <section>
              <h2 class="rot" [style.border-color]="color(a)">{{ a }}° año</h2>
              @for (g of gruposDe(c, a); track g.titulo) {
                @if (g.titulo) {
                  <h3 class="cuat">{{ g.titulo }}</h3>
                }
                @for (f of g.filas; track f.materia.codigo) {
                  <div class="item" [class.apagada]="apagada(f)">
                    <div class="rama-fila top">
                      <span class="caret" aria-hidden="true">{{
                        tieneRama(f) ? (prendida(f.materia.codigo) ? '▾' : '▸') : '·'
                      }}</span>
                      <button
                        type="button"
                        class="tarjeta"
                        [class.on]="prendida(f.materia.codigo)"
                        [attr.aria-expanded]="tieneRama(f) ? prendida(f.materia.codigo) : null"
                        (click)="prender(f.materia.codigo)"
                      >
                        <span class="cabecera">
                          <span class="mono cod">{{ f.materia.codigo }}</span>
                          <span class="nombre">{{ f.materia.nombre }}</span>
                        </span>
                        <span class="etiquetas">
                          @if (f.materia.dedicacion === 'anual') {
                            <span class="et anual">anual</span>
                          }
                          @if (seDicta().has(f.materia.codigo)) {
                            <span class="et ahora">se dicta ahora</span>
                          }
                          @if (f.aprobada) {
                            <span class="et ok">aprobada</span>
                          } @else if (f.puedeCursar) {
                            <span class="et libre">podés cursarla</span>
                          }
                        </span>
                      </button>
                    </div>

                    @if (prendida(f.materia.codigo)) {
                      @if (arbolDe(f.materia.codigo); as raiz) {
                        @if (raiz.hijos.length) {
                          <div class="seccion">
                            <span class="rama-titulo">Necesita</span>
                            <ul class="rama-hijos">
                              @for (h of raiz.hijos; track h.materia.codigo) {
                                <ng-container *ngTemplateOutlet="ramaTpl; context: { $implicit: h }" />
                              }
                            </ul>
                          </div>
                        }
                      }
                      @if (f.destraba.length) {
                        <div class="seccion">
                          <span class="rama-titulo">Destraba</span>
                          <ul class="rama-hijos destraba">
                            @for (d of f.destraba; track d.codigo) {
                              <li class="rama-nodo">
                                <div class="rama-fila">
                                  <span class="caret" aria-hidden="true">·</span>
                                  <button type="button" class="mini" [class.ok]="aprobada(d.codigo)" (click)="prender(d.codigo)">
                                    <span class="mono">{{ d.codigo }}</span>
                                    <span class="n">{{ d.nombre }}</span>
                                  </button>
                                </div>
                              </li>
                            }
                          </ul>
                        </div>
                      }
                      @if (!tieneRama(f)) {
                        <p class="vacio-rama">No tiene correlativas ni destraba otras materias.</p>
                      }
                      <button type="button" class="marcar" (click)="marcar(c, f.materia.codigo)">
                        {{ f.aprobada ? 'Desmarcar' : 'Marcar como aprobada' }}
                      </button>
                    }
                  </div>
                }
              }
            </section>
          }

          @if (!tieneCuat(c)) {
            <p class="aclaracion">
              El plan publicado de esta carrera agrupa las materias por año, no por cuatrimestre.
              Marcamos las que se están dictando ahora según la grilla del Departamento.
            </p>
          }
        </div>
      } @else {
        <div class="anios" aria-hidden="true">
          @for (a of aniosDe(c); track a) {
            <span [style.border-top-color]="color(a)" [class.fuera]="!aniosEnVista().has(a)">
              {{ a }}° año
            </span>
          }
        </div>

        <div class="lienzo">
          <svg
            #svg
            [attr.viewBox]="viewBoxTexto()"
            preserveAspectRatio="xMidYMid meet"
            [attr.aria-label]="'Mapa de correlatividades de ' + c.nombre"
            (pointerdown)="alApretar($event)"
            (pointermove)="alMover($event)"
            (pointerup)="alSoltar($event)"
            (pointercancel)="alSoltar($event)"
            (wheel)="alRodar($event)"
          >
            <defs>
              @for (a of aniosDe(c); track a) {
                <marker [attr.id]="'punta' + a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0 0 L7 3.5 L0 7 z" [attr.fill]="color(a)" />
                </marker>
              }
            </defs>

            @for (ar of layout().aristas; track ar.de + '>' + ar.a) {
              <path
                [attr.d]="ar.d"
                fill="none"
                [attr.stroke]="color(ar.anioDe)"
                [attr.stroke-width]="activa(ar.de, ar.a) ? 2.6 : 1.4"
                [attr.opacity]="opacidadArista(ar.de, ar.a)"
                [attr.marker-end]="activa(ar.de, ar.a) ? 'url(#punta' + ar.anioDe + ')' : null"
              />
            }

            @for (n of layout().nodos; track n.codigo) {
              <g
                [attr.opacity]="opacidadNodo(n.codigo)"
                (click)="tocar(n.codigo)"
                tabindex="0"
                role="button"
                [attr.aria-pressed]="prendida(n.codigo)"
                [attr.aria-label]="n.materia.nombre"
                (keydown.enter)="tocar(n.codigo)"
                (keydown.space)="tocar(n.codigo); $event.preventDefault()"
              >
                <rect
                  [attr.x]="n.x"
                  [attr.y]="n.y"
                  [attr.width]="n.w"
                  [attr.height]="n.h"
                  rx="9"
                  [attr.fill]="relleno(n.codigo, n.anio)"
                  [attr.stroke]="borde(n.codigo, n.anio)"
                  [attr.stroke-width]="marcado(n.codigo) ? 2.2 : 1.2"
                />
                <rect
                  [attr.x]="n.x"
                  [attr.y]="n.y + 10"
                  width="3.5"
                  [attr.height]="n.h - 20"
                  rx="1.75"
                  [attr.fill]="color(n.anio)"
                  [attr.opacity]="prendida(n.codigo) ? 0 : 1"
                />

                @if (detalle() === 'lejos') {
                  <text [attr.x]="n.x + n.w / 2" [attr.y]="n.y + n.h / 2 + 7" text-anchor="middle" font-size="20" [attr.fill]="textoFicha(n.codigo)">
                    {{ n.codigo }}
                  </text>
                } @else {
                  <text [attr.x]="n.x + 12" [attr.y]="n.y + 15" font-size="8.5" letter-spacing="0.5" [attr.fill]="textoTenue(n.codigo)">
                    {{ n.codigo }}
                  </text>
                  @if (aprobada(n.codigo)) {
                    <path [attr.d]="tilde(n)" fill="none" stroke="var(--verde)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  }
                  @if (n.materia.dedicacion === 'anual') {
                    <text [attr.x]="n.x + n.w - 12" [attr.y]="n.y + 15" text-anchor="end" font-size="8" [attr.fill]="textoTenue(n.codigo)">anual</text>
                  }
                  @for (linea of n.lineas; track $index) {
                    <text class="nombre" [attr.x]="n.x + 12" [attr.y]="n.y + 29 + $index * 11" font-size="10" [attr.fill]="textoFicha(n.codigo)">
                      {{ linea }}
                    </text>
                  }
                }
              </g>
            }
          </svg>

          <div class="controles">
            <button type="button" (click)="acercarBoton(1 / 1.5)" aria-label="Acercar">+</button>
            <button type="button" (click)="acercarBoton(1.5)" aria-label="Alejar">−</button>
            <button type="button" class="todo" (click)="verTodo()">Ver todo</button>
          </div>

          @if (!seleccion().size && detalle() !== 'lejos') {
            <p class="ayuda">Tocá una o varias materias para simular tu avance</p>
          }
        </div>

        <ul class="lista-oculta">
          @for (f of filas(); track f.materia.codigo) {
            <li>{{ f.materia.nombre }}: {{ resumenTexto(f) }}</li>
          }
        </ul>
      }
    } @else {
      <p class="vacio">No encontramos esa carrera. <a routerLink="/carreras">Ver todas</a></p>
    }
  `,
  styles: `
    /* Alto exacto del área útil: la barra de abajo es fija y su lugar ya está
       reservado por el contenedor. */
    :host {
      display: flex; flex-direction: column; min-height: 0; color: var(--texto);
      height: calc(100dvh - var(--barra) - env(safe-area-inset-bottom));
    }
    header { display: flex; align-items: center; gap: var(--e2); padding: 14px var(--e4) 10px; border-bottom: 1px solid var(--borde); }
    .titulo { flex: 1; min-width: 0; }
    h1 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .atras { width: 32px; height: 32px; flex: none; display: grid; place-items: center; border: 1px solid var(--borde); border-radius: 9px; background: var(--superficie); color: var(--texto-2); }
    .vistas { flex: none; display: flex; border: 1px solid var(--borde); border-radius: 999px; background: var(--superficie); padding: 2px; }
    .vistas button { min-height: 34px; padding: 0 11px; border: none; border-radius: 999px; background: none; color: var(--texto-2); font-size: var(--t-s); font-weight: 600; }
    .vistas button.on { background: var(--marca); color: var(--sobre-marca); }

    .buscador { padding: 10px var(--e4) 8px; }
    .caja { display: flex; align-items: center; gap: 9px; background: var(--superficie); border: 1px solid var(--borde); border-radius: 11px; padding: 0 var(--e3); min-height: 44px; color: var(--texto-3); }
    .caja.activa { border-color: var(--marca); color: var(--marca); }
    .caja input { flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--texto); font: inherit; font-size: var(--t-m); }
    .caja button { background: none; border: none; font-size: 20px; line-height: 1; color: var(--texto-3); padding: 0 4px; min-width: 32px; min-height: 32px; }
    .caja svg, .atras svg { flex: none; }

    .filtros { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 var(--e4) 8px; }
    .chip { min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--borde); background: var(--superficie); color: var(--texto-2); font-size: var(--t-s); font-weight: 600; }
    .chip.on { border-color: var(--marca); background: var(--marca); color: var(--sobre-marca); }
    .chip.limpiar { border-style: dashed; color: var(--texto-3); }

    .sim { margin: 0 var(--e4) 8px; padding: 10px 12px; border: 1px solid var(--marca); border-radius: var(--r); background: color-mix(in oklab, var(--marca) 12%, var(--superficie)); }
    .sim-datos { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: var(--t-s); color: var(--texto-2); }
    .sim-datos strong { color: var(--texto); font-weight: 700; }
    .sim-lista { margin: 6px 0 0; font-size: var(--t-xs); color: var(--texto-2); line-height: 1.4; }

    .resultados { list-style: none; margin: 0; padding: 0 var(--e4); overflow-y: auto; flex: 1; }
    .resultados button { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 0; background: none; border: none; border-bottom: 1px solid var(--borde); text-align: left; min-height: 48px; color: var(--texto); }
    .raya { width: 3px; align-self: stretch; border-radius: 2px; flex: none; }
    .txt { min-width: 0; }
    .nom { display: block; font-size: var(--t-m); font-weight: 500; }
    .meta { display: block; font-size: var(--t-xs); color: var(--texto-3); margin-top: 2px; }
    .nada { padding: var(--e4) 0; font-size: var(--t-m); color: var(--texto-2); }

    .lista { flex: 1; min-height: 0; overflow-y: auto; padding: 0 var(--e4) var(--e4); }
    .instruccion { margin: 0 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; }
    .instruccion strong { color: var(--texto); }
    .lista section { margin-bottom: var(--e4); }
    .rot { margin: 0 0 var(--e2); padding-top: 7px; border-top: 2px solid; font-size: var(--t-xs); font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-2); }
    .cuat { margin: var(--e3) 0 var(--e2); font-size: var(--t-xs); font-weight: 600; color: var(--texto-3); }
    .item { margin-bottom: 7px; }
    /* Apagar una fila no puede volverla ilegible: se apaga el marco y las
       etiquetas, y el nombre baja sólo hasta el gris secundario. */
    .item.apagada .tarjeta { border-color: color-mix(in oklab, var(--borde) 55%, transparent); background: transparent; }
    .item.apagada .nombre { color: var(--texto-2); font-weight: 500; }
    .item.apagada .etiquetas { opacity: 0.5; }
    .item.apagada .caret { opacity: 0.4; }
    .rama-fila { display: flex; align-items: flex-start; gap: 6px; }
    .caret { flex: none; width: 14px; padding-top: 12px; text-align: center; color: var(--texto-3); font-size: 11px; }
    .tarjeta { flex: 1; min-width: 0; display: block; text-align: left; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 11px 12px; color: var(--texto); }
    .tarjeta.on { border-color: var(--marca); background: color-mix(in oklab, var(--marca) 10%, var(--superficie)); }
    .cabecera { display: flex; gap: 9px; align-items: baseline; }
    .cod { font-size: var(--t-xs); color: var(--texto-3); min-width: 26px; }
    .nombre { flex: 1; font-size: var(--t-m); font-weight: 600; color: var(--texto); }
    .etiquetas { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
    .et { font-size: var(--t-xs); color: var(--texto-3); border: 1px solid var(--borde); border-radius: 999px; padding: 2px 7px; }
    .et.anual { color: var(--naranja); border-color: var(--naranja); }
    .et.ahora { color: var(--marca); border-color: var(--marca); }
    .et.ok, .et.libre { color: var(--verde); border-color: var(--verde); }

    .seccion { margin: var(--e2) 0 0 20px; }
    .rama-titulo { display: block; font-size: var(--t-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--texto-3); margin-bottom: 4px; }
    .rama-hijos { list-style: none; margin: 0; padding: 0 0 0 12px; border-left: 1px solid var(--borde); }
    .rama-hijos.destraba { border-left-color: color-mix(in oklab, var(--verde) 50%, var(--borde)); }
    .rama-nodo { margin: 4px 0; }
    .mini { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 6px 10px; border: 1px solid var(--borde); border-radius: 9px; background: var(--superficie); color: var(--texto); text-align: left; }
    .mini.ok { border-color: color-mix(in oklab, var(--verde) 55%, var(--borde)); }
    .mini .mono { flex: none; font-size: var(--t-xs); color: var(--texto-3); min-width: 24px; }
    .mini .n { flex: 1; font-size: var(--t-s); color: var(--texto); }
    .tilde { flex: none; color: var(--verde); font-size: var(--t-s); }
    .vacio-rama { margin: var(--e2) 0 0 20px; font-size: var(--t-s); color: var(--texto-2); }
    .marcar { width: 100%; min-height: 44px; margin: var(--e2) 0 0; border-radius: 10px; border: 1px solid var(--borde); background: var(--superficie-2); color: var(--texto); font-size: var(--t-s); font-weight: 600; }
    .aclaracion { font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; border: 1px dashed var(--borde); border-radius: var(--r); padding: var(--e3); }

    .anios { display: flex; gap: 4px; padding: 0 var(--e4) 6px; }
    .anios span { flex: 1; text-align: center; font-size: 9px; font-weight: 600; color: var(--texto-2); border-top: 2px solid; padding-top: 5px; transition: opacity 0.15s; }
    .anios span.fuera { opacity: 0.3; }
    .lienzo { flex: 1; min-height: 200px; position: relative; margin: 0 var(--e4) var(--e4); border: 1px solid var(--borde); border-radius: 14px; background: var(--superficie); overflow: hidden; }
    .lienzo svg { display: block; width: 100%; height: 100%; touch-action: none; }
    .lienzo g { cursor: pointer; }
    .lienzo text { font-family: var(--mono); font-weight: 500; }
    .lienzo text.nombre { font-family: var(--sans); font-weight: 600; }
    .controles { position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center; gap: 6px; }
    .controles button { min-width: 40px; min-height: 40px; border-radius: 10px; border: 1px solid var(--borde); background: color-mix(in oklab, var(--superficie-2) 88%, transparent); color: var(--texto); font-size: 18px; line-height: 1; }
    .controles .todo { font-size: var(--t-xs); font-weight: 600; padding: 0 6px; }
    .ayuda { position: absolute; left: 10px; bottom: 12px; max-width: 55%; background: var(--superficie-2); border: 1px solid var(--borde); border-radius: 999px; padding: 8px 12px; font-size: var(--t-xs); color: var(--texto-2); margin: 0; line-height: 1.3; }
    .lista-oculta { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .vacio { padding: var(--e5) var(--e4); }
  `,
})
export class Grafo {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly aprobadas = inject(Aprobadas);
  private readonly elegidaCarrera = inject(CarreraElegida);
  private readonly svg = viewChild<ElementRef<SVGSVGElement>>('svg');

  protected readonly filtros = FILTROS;

  private readonly params = toSignal(this.ruta.paramMap, {
    initialValue: this.ruta.snapshot.paramMap,
  });
  private readonly query = toSignal(this.ruta.queryParamMap, {
    initialValue: this.ruta.snapshot.queryParamMap,
  });

  protected readonly carrera = computed(() => carreraPorSlug(this.params().get('slug') ?? ''));
  protected readonly consulta = signal('');
  protected readonly vista = signal<'mapa' | 'lista'>('mapa');
  protected readonly seleccion = signal<ReadonlySet<string>>(new Set());
  protected readonly activos = signal<ReadonlySet<Filtro>>(new Set());
  protected readonly encuadre = signal({ x: 0, y: 0, w: CERCA_ANCHO, h: CERCA_ANCHO * PROPORCION });

  protected readonly layout = computed<Layout>(() => {
    const c = this.carrera();
    return c
      ? calcularLayout(c, TARJETA)
      : { nodos: [], aristas: [], porCodigo: new Map(), ancho: 1, alto: 1, anios: 0 };
  });

  private readonly vinculos = computed(() => {
    const c = this.carrera();
    return c ? vincular(c) : null;
  });

  protected readonly seDicta = computed(() => {
    const c = this.carrera();
    return c ? dictadasAhora(c.slug) : new Set<string>();
  });

  private readonly aprobadasSet = computed(() => {
    this.aprobadas.señal();
    const c = this.carrera();
    return c ? this.aprobadas.de(c.slug) : new Set<string>();
  });

  /** Todas las filas: el filtro apaga, no esconde. */
  protected readonly filas = computed<readonly Fila[]>(() => {
    const c = this.carrera();
    const v = this.vinculos();
    if (!c || !v) return [];
    const base = construirFilas(c, this.aprobadasSet(), null, v);
    const pasan = aplicarFiltros(base, this.activos(), this.seDicta());
    return pasan ? base.map((f) => ({ ...f, atenuada: !pasan.has(f.materia.codigo) })) : base;
  });

  private readonly porCodigoFila = computed(
    () => new Map(this.filas().map((f) => [f.materia.codigo, f])),
  );

  /** Un salto en cada dirección: lo que ilumina el mapa. */
  private readonly relacionadas = computed(() => {
    const c = this.carrera();
    const v = this.vinculos();
    return c && v ? calcularRelacionadas(this.seleccion(), c, v) : null;
  });

  /** La rama completa: lo que deja encendido el explorador. */
  private readonly rama = computed(() => {
    const c = this.carrera();
    const v = this.vinculos();
    return c && v ? calcularRama(this.seleccion(), c, v) : null;
  });

  protected readonly simulacion = computed(() => {
    const c = this.carrera();
    const v = this.vinculos();
    if (!c || !v || !this.seleccion().size) return null;
    return simular(c, this.aprobadasSet(), this.seleccion(), v);
  });

  protected readonly nombresDesbloqueadas = computed(() =>
    (this.simulacion()?.desbloqueadas ?? []).map((m) => m.nombre).join(' · '),
  );

  protected readonly resultados = computed(() => {
    const c = this.carrera();
    const q = this.consulta().trim();
    return c && q ? buscar(c, q).slice(0, 15) : [];
  });

  protected readonly viewBoxTexto = computed(() => {
    const v = this.encuadre();
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
  });

  protected readonly detalle = computed(() => detalleDe(this.encuadre().w));

  /** Qué años caen dentro del encuadre, para saber dónde estás parado. */
  protected readonly aniosEnVista = computed(() => {
    const v = this.encuadre();
    const dentro = new Set<number>();
    for (const n of this.layout().nodos) if (n.x + n.w > v.x && n.x < v.x + v.w) dentro.add(n.anio);
    return dentro;
  });

  constructor() {
    // El lienzo arranca cerca, donde la tarjeta se lee. Si el link trae una
    // materia se abre prendida: es lo que espera quien lo recibe por mensaje.
    effect(() => {
      const l = this.layout();
      const pedida = this.query().get('materia');
      const w = Math.min(CERCA_ANCHO, l.ancho);
      const h = Math.min(this.altoPara(w), l.alto);
      if (pedida && l.porCodigo.has(pedida)) {
        this.seleccion.set(new Set([pedida]));
        this.encuadre.set(encuadrar(l, pedida, w, h));
      } else {
        this.encuadre.set(this.limitar({ x: 0, y: this.primeraFila() - 14, w, h }));
      }
    });

    // Entrar por link a una carrera también la deja elegida en el teléfono.
    effect(() => {
      const c = this.carrera();
      if (c && this.elegidaCarrera.slug() !== c.slug) this.elegidaCarrera.elegir(c.slug);
    });
  }

  private altoPara(ancho: number): number {
    return ancho * this.proporcion();
  }

  /**
   * Alto sobre ancho del lienzo. Al pre-generar las páginas no hay navegador
   * que pueda medir nada, así que se usa una proporción de reserva.
   */
  private proporcion(): number {
    const caja = this.cajaLienzo();
    return caja && caja.width > 0 ? caja.height / caja.width : PROPORCION;
  }

  private cajaLienzo(): DOMRect | null {
    const el = this.svg()?.nativeElement;
    return el && typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
  }

  /**
   * Y de la primera materia de primer año. Las columnas van centradas entre
   * sí, así que arrancar en el borde de arriba dejaría a la vista un vacío.
   */
  private primeraFila(): number {
    const ys = this.layout()
      .nodos.filter((n) => n.anio === 1)
      .map((n) => n.y);
    return ys.length ? Math.min(...ys) : 0;
  }

  protected color = (anio: number) => `var(--n${((anio - 1) % 8) + 1})`;
  protected aniosDe = (c: Carrera) => anios(c);
  protected tieneCuat = (c: Carrera) => tieneCuatrimestres(c);
  protected anioDeMateria = (c: Carrera, m: Materia) =>
    c.tipoNivel === 'anio' ? m.nivel : Math.ceil(m.nivel / 2);

  /** Las filas de un año, partidas por cuatrimestre cuando el plan lo dice. */
  protected gruposDe(c: Carrera, anio: number): { titulo: string; filas: readonly Fila[] }[] {
    const delAnio = this.filas().filter((f) => f.anio === anio);
    if (!tieneCuatrimestres(c)) return [{ titulo: '', filas: delAnio }];
    return [1, 2]
      .map((q) => ({
        titulo: `${q}° cuatrimestre`,
        filas: delAnio.filter((f) => f.cuatrimestre === q),
      }))
      .filter((g) => g.filas.length);
  }

  protected ubicacion(c: Carrera, m: Materia): string {
    const anio = this.anioDeMateria(c, m);
    const q = c.tipoNivel === 'cuatrimestre' ? ((m.nivel - 1) % 2) + 1 : null;
    return q ? `${anio}° año, ${q}° cuatrimestre` : `${anio}° año`;
  }

  protected arbolDe(codigo: string) {
    const c = this.carrera();
    const v = this.vinculos();
    return c && v ? construirArbol(codigo, c, this.aprobadasSet(), v) : null;
  }

  protected tieneRama = (f: Fila) => f.necesita.length > 0 || f.destraba.length > 0;
  protected prendida = (codigo: string) => this.seleccion().has(codigo);
  protected aprobada = (codigo: string) => this.aprobadasSet().has(codigo);

  /** En la lista se apaga lo que no pasa el filtro y lo que no está en la rama. */
  protected apagada(f: Fila): boolean {
    const r = this.rama();
    return f.atenuada || (r !== null && !r.has(f.materia.codigo));
  }

  protected resumenTexto(f: Fila): string {
    return [
      f.necesita.length
        ? `necesita ${f.necesita.map((x) => x.nombre).join(', ')}`
        : 'sin correlativas',
      f.destraba.length ? `destraba ${f.destraba.map((x) => x.nombre).join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ');
  }

  // ------------------------------------------------------------ el mapa
  protected marcado(codigo: string): boolean {
    const r = this.relacionadas();
    return r !== null && r.has(codigo);
  }

  /**
   * Apagar no es esconder: con 0.26 la tarjeta sigue siendo legible, así que
   * se entiende qué quedó afuera del camino en vez de desaparecer.
   */
  protected opacidadNodo(codigo: string): number {
    if (this.porCodigoFila().get(codigo)?.atenuada) return 0.26;
    const r = this.relacionadas();
    return r === null || r.has(codigo) ? 1 : 0.26;
  }

  protected activa(de: string, a: string): boolean {
    const sel = this.seleccion();
    return sel.has(de) || sel.has(a);
  }

  protected opacidadArista(de: string, a: string): number {
    if (!this.seleccion().size) return 0.4;
    return this.activa(de, a) ? 1 : 0.08;
  }

  protected relleno(codigo: string, anio: number): string {
    if (this.prendida(codigo)) return this.color(anio);
    return this.aprobada(codigo) ? 'var(--superficie-2)' : 'var(--superficie)';
  }

  protected borde(codigo: string, anio: number): string {
    if (this.aprobada(codigo)) return 'var(--verde)';
    return this.marcado(codigo) ? this.color(anio) : 'var(--borde)';
  }

  protected textoFicha = (codigo: string) =>
    this.prendida(codigo) ? 'var(--sobre-marca)' : 'var(--texto)';
  protected textoTenue = (codigo: string) =>
    this.prendida(codigo) ? 'var(--sobre-marca)' : 'var(--texto-3)';

  /** Un tilde en la esquina: el color no puede ser el único indicio. */
  protected tilde(n: { x: number; y: number; w: number }): string {
    const x = n.x + n.w - 34;
    const y = n.y + 8;
    return `M${x} ${y + 3} l2.4 2.6 l4.6-5.2`;
  }

  // --------------------------------------------------------- acciones
  protected alternarFiltro(f: Filtro): void {
    const s = new Set(this.activos());
    if (s.has(f)) s.delete(f);
    else s.add(f);
    this.activos.set(s);
  }

  protected prender(codigo: string): void {
    const s = new Set(this.seleccion());
    if (s.has(codigo)) s.delete(codigo);
    else s.add(codigo);
    this.seleccion.set(s);
    this.sincronizarUrl(s);
  }

  protected tocar(codigo: string): void {
    if (this.arrastro) return;
    this.prender(codigo);
  }

  /** Desde el buscador se salta a la materia, prendida y sola. */
  protected irA(codigo: string): void {
    this.consulta.set('');
    const s = new Set([codigo]);
    this.seleccion.set(s);
    this.sincronizarUrl(s);
    const l = this.layout();
    const w = Math.min(CERCA_ANCHO, l.ancho);
    this.encuadre.set(encuadrar(l, codigo, w, Math.min(this.altoPara(w), l.alto)));
  }

  /** La URL guarda una sola materia: sirve para compartir, no como estado. */
  private sincronizarUrl(s: ReadonlySet<string>): void {
    const c = this.carrera();
    if (!c) return;
    const unica = s.size === 1 ? [...s][0] : null;
    this.router.navigate(['/carreras', c.slug, 'correlatividades'], {
      queryParams: unica ? { materia: unica } : {},
      replaceUrl: true,
    });
  }

  protected limpiarTodo(): void {
    this.seleccion.set(new Set());
    this.activos.set(new Set());
    this.sincronizarUrl(new Set());
  }

  protected verTodo(): void {
    const l = this.layout();
    this.encuadre.set({ x: 0, y: 0, w: l.ancho, h: l.alto });
  }

  protected marcar(c: Carrera, codigo: string): void {
    this.aprobadas.alternar(c.slug, codigo);
  }

  protected acercarBoton(factor: number): void {
    const caja = this.cajaLienzo();
    if (caja) this.acercar(factor, caja);
  }

  // ------------------------------------------------ arrastrar y acercar
  private punteros = new Map<number, { x: number; y: number }>();
  private inicio: { x: number; y: number; vista: { x: number; y: number } } | null = null;
  private separacionInicial = 0;
  /** Se marca al arrastrar para que soltar el dedo no cuente como toque. */
  private arrastro = false;

  protected alApretar(e: PointerEvent): void {
    this.svg()?.nativeElement.setPointerCapture?.(e.pointerId);
    this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.arrastro = false;
    const v = this.encuadre();
    this.inicio = { x: e.clientX, y: e.clientY, vista: { x: v.x, y: v.y } };
    if (this.punteros.size === 2) this.separacionInicial = this.separacion();
  }

  protected alMover(e: PointerEvent): void {
    if (!this.punteros.has(e.pointerId)) return;
    this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const caja = this.cajaLienzo();
    if (!caja || !this.inicio) return;

    if (this.punteros.size >= 2) {
      const ahora = this.separacion();
      if (this.separacionInicial > 0 && ahora > 0) {
        this.acercar(this.separacionInicial / ahora, caja);
        this.separacionInicial = ahora;
      }
      this.arrastro = true;
      return;
    }

    const v = this.encuadre();
    const dx = ((e.clientX - this.inicio.x) * v.w) / caja.width;
    const dy = ((e.clientY - this.inicio.y) * v.h) / caja.height;
    if (Math.abs(dx) + Math.abs(dy) > 3) this.arrastro = true;
    this.encuadre.set(
      this.limitar({ ...v, x: this.inicio.vista.x - dx, y: this.inicio.vista.y - dy }),
    );
  }

  protected alSoltar(e: PointerEvent): void {
    this.punteros.delete(e.pointerId);
    if (this.punteros.size === 0) this.inicio = null;
  }

  protected alRodar(e: WheelEvent): void {
    const caja = this.cajaLienzo();
    if (!caja) return;
    e.preventDefault();
    this.acercar(e.deltaY > 0 ? 1.12 : 1 / 1.12, caja);
  }

  private separacion(): number {
    const [a, b] = [...this.punteros.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private acercar(factor: number, caja: DOMRect): void {
    const l = this.layout();
    const v = this.encuadre();
    const w = Math.min(Math.max(v.w * factor, 190), l.ancho);
    const h = Math.min(this.altoPara(w), l.alto);
    this.encuadre.set(this.limitar({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h }));
  }

  private limitar(v: { x: number; y: number; w: number; h: number }) {
    const l = this.layout();
    const w = Math.min(v.w, l.ancho);
    const h = Math.min(v.h, l.alto);
    return {
      w,
      h,
      x: Math.max(0, Math.min(v.x, l.ancho - w)),
      y: Math.max(0, Math.min(v.y, l.alto - h)),
    };
  }
}
