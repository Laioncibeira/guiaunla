import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  anios,
  carreraPorSlug,
  cuatrimestreDe,
  dictadasAhora,
  materiasDe,
  tieneCuatrimestres,
  type Carrera,
  type Materia,
} from '../core/datos';
import { buscar, habilita, necesita, puedeCursar, vincular } from '../core/correlatividades';
import { calcularLayout, detalleDe, encuadrar, TARJETA, type Layout } from '../core/grafo';
import { Aprobadas, CarreraElegida } from '../shared/ui';

/** Con este ancho de viewBox la tarjeta se lee cómoda en un teléfono. */
const CERCA_ANCHO = 340;
/** Proporción de reserva hasta que se pueda medir el lienzo de verdad. */
const PROPORCION = 1.3;

@Component({
  selector: 'app-grafo',
  imports: [RouterLink],
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

      @if (resultados().length || consulta()) {
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
        <div class="lista">
          @for (a of aniosDe(c); track a) {
            <section>
              <h2 class="rot" [style.border-color]="color(a)">{{ a }}° año</h2>
              @for (grupo of gruposDe(c, a); track grupo.titulo) {
                @if (grupo.titulo) {
                  <h3 class="cuat">{{ grupo.titulo }}</h3>
                }
                @for (m of grupo.materias; track m.codigo) {
                  <button type="button" class="tarjeta" (click)="irA(m.codigo)">
                    <span class="cabecera">
                      <span class="mono cod">{{ m.codigo }}</span>
                      <span class="nombre">{{ m.nombre }}</span>
                    </span>
                    <span class="etiquetas">
                      @if (m.dedicacion === 'anual') {
                        <span class="et anual">anual</span>
                      }
                      @if (seDicta().has(m.codigo)) {
                        <span class="et ahora">se dicta ahora</span>
                      }
                      @if (aprobada(m.codigo)) {
                        <span class="et ok">aprobada</span>
                      }
                      @if (m.correlativas.length) {
                        <span class="et">{{ m.correlativas.length }} correlativa{{ m.correlativas.length > 1 ? 's' : '' }}</span>
                      } @else {
                        <span class="et libre">sin correlativas</span>
                      }
                    </span>
                  </button>
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
                <marker
                  [attr.id]="'punta' + a"
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M0 0 L7 3.5 L0 7 z" [attr.fill]="color(a)" />
                </marker>
              }
            </defs>

            @for (a of layout().aristas; track a.de + '>' + a.a) {
              <path
                [attr.d]="a.d"
                fill="none"
                [attr.stroke]="color(a.anioDe)"
                [attr.stroke-width]="activa(a.de, a.a) ? 2.6 : 1.4"
                [attr.opacity]="opacidadArista(a.de, a.a)"
                [attr.marker-end]="activa(a.de, a.a) ? 'url(#punta' + a.anioDe + ')' : null"
              />
            }

            @for (n of layout().nodos; track n.codigo) {
              <g
                [attr.opacity]="enFoco(n.codigo) ? 1 : 0.14"
                (click)="tocar(n.codigo)"
                tabindex="0"
                role="button"
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
                  [attr.opacity]="n.codigo === seleccion() ? 0 : 1"
                />

                @if (detalle() === 'lejos') {
                  <text
                    [attr.x]="n.x + n.w / 2"
                    [attr.y]="n.y + n.h / 2 + 7"
                    text-anchor="middle"
                    font-size="20"
                    [attr.fill]="textoFicha(n.codigo)"
                  >
                    {{ n.codigo }}
                  </text>
                } @else {
                  <text
                    [attr.x]="n.x + 12"
                    [attr.y]="n.y + 15"
                    font-size="8.5"
                    letter-spacing="0.5"
                    [attr.fill]="textoTenue(n.codigo)"
                  >
                    {{ n.codigo }}
                  </text>
                  @if (aprobada(n.codigo)) {
                    <path
                      [attr.d]="tilde(n)"
                      fill="none"
                      stroke="var(--verde)"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  }
                  @if (n.materia.dedicacion === 'anual') {
                    <text
                      [attr.x]="n.x + n.w - 12"
                      [attr.y]="n.y + 15"
                      text-anchor="end"
                      font-size="8"
                      [attr.fill]="textoTenue(n.codigo)"
                    >
                      anual
                    </text>
                  }
                  @for (linea of n.lineas; track $index) {
                    <text
                      class="nombre"
                      [attr.x]="n.x + 12"
                      [attr.y]="n.y + 29 + $index * 11"
                      font-size="10"
                      [attr.fill]="textoFicha(n.codigo)"
                    >
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

          @if (!seleccion() && detalle() !== 'lejos') {
            <p class="ayuda">Tocá una materia para ver su camino</p>
          }
        </div>

        <ul class="lista-oculta">
          @for (n of layout().nodos; track n.codigo) {
            <li>{{ n.materia.nombre }}: {{ resumenTexto(n.materia) }}</li>
          }
        </ul>
      }

      @if (elegida(); as m) {
        <section class="hoja" role="dialog" [attr.aria-label]="m.nombre">
          <button type="button" class="tirador" (click)="cerrar()" aria-label="Cerrar"></button>
          <div class="encabezado">
            <span class="mono cod">{{ m.codigo }}</span>
            <h2>{{ m.nombre }}</h2>
          </div>
          <p class="datos">{{ datos(c, m) }}</p>

          @if (necesitaDe(m).length) {
            <h3 class="rot">Necesitás aprobar antes</h3>
            @for (x of necesitaDe(m); track x.codigo) {
              <button type="button" class="fila" (click)="irA(x.codigo)">
                <span class="mono">{{ x.codigo }}</span><span class="n">{{ x.nombre }}</span>
                @if (aprobada(x.codigo)) { <span class="ok">listo</span> }
              </button>
            }
          } @else {
            <p class="libre">No tiene correlativas: la podés cursar cuando se dicte.</p>
          }

          @if (habilitaDe(m).length) {
            <h3 class="rot">Te habilita</h3>
            @for (x of habilitaDe(m); track x.codigo) {
              <button type="button" class="fila" (click)="irA(x.codigo)">
                <span class="mono">{{ x.codigo }}</span><span class="n">{{ x.nombre }}</span>
              </button>
            }
          }

          <button type="button" class="marcar" (click)="marcar(c, m.codigo)">
            {{ aprobada(m.codigo) ? 'Desmarcar' : 'Marcar como aprobada' }}
          </button>
          @if (totalAprobadas() > 0) {
            <p class="estado">
              {{ totalAprobadas() }}
              {{ totalAprobadas() === 1 ? 'materia marcada' : 'materias marcadas' }} · podés cursar
              {{ disponibles() }}
              <button type="button" class="limpiar" (click)="limpiar(c)">borrar marcas</button>
            </p>
          }
        </section>
      }
    } @else {
      <p class="vacio">No encontramos esa carrera. <a routerLink="/carreras">Ver todas</a></p>
    }
  `,
  styles: `
    /* Alto exacto del área útil: la barra de abajo es fija y su lugar ya está
       reservado por el contenedor, así que la hoja inferior nunca queda debajo. */
    :host { display: flex; flex-direction: column; min-height: 0;
      height: calc(100dvh - var(--barra) - env(safe-area-inset-bottom)); }
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
    .resultados { list-style: none; margin: 0; padding: 0 var(--e4); overflow-y: auto; flex: 1; }
    .resultados button { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 0; background: none; border: none; border-bottom: 1px solid var(--borde); text-align: left; min-height: 48px; }
    .raya { width: 3px; align-self: stretch; border-radius: 2px; flex: none; }
    .txt { min-width: 0; }
    .nom { display: block; font-size: var(--t-m); font-weight: 500; }
    .meta { display: block; font-size: var(--t-xs); color: var(--texto-3); margin-top: 2px; }
    .nada { padding: var(--e4) 0; font-size: var(--t-m); color: var(--texto-2); }

    .lista { flex: 1; min-height: 0; overflow-y: auto; padding: 0 var(--e4) var(--e4); }
    .lista section { margin-bottom: var(--e4); }
    .rot { margin: 0 0 var(--e2); padding-top: 7px; border-top: 2px solid; font-size: var(--t-xs); font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-2); }
    .cuat { margin: var(--e3) 0 var(--e2); font-size: var(--t-xs); font-weight: 600; color: var(--texto-3); }
    .tarjeta { display: block; width: 100%; text-align: left; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 11px 12px; margin-bottom: 7px; }
    .cabecera { display: flex; gap: 9px; align-items: baseline; }
    .cod { font-size: var(--t-xs); color: var(--texto-3); min-width: 26px; }
    .nombre { flex: 1; font-size: var(--t-m); font-weight: 500; }
    .etiquetas { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
    .et { font-size: var(--t-xs); color: var(--texto-3); border: 1px solid var(--borde); border-radius: 999px; padding: 2px 7px; }
    .et.anual { color: var(--naranja); border-color: var(--naranja); }
    .et.ahora { color: var(--marca); border-color: var(--marca); }
    .et.ok, .et.libre { color: var(--verde); border-color: var(--verde); }
    .aclaracion { font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; border: 1px dashed var(--borde); border-radius: var(--r); padding: var(--e3); }

    .anios { display: flex; gap: 4px; padding: 0 var(--e4) 6px; }
    .anios span { flex: 1; text-align: center; font-size: 9px; font-weight: 600; color: var(--texto-2); border-top: 2px solid; padding-top: 5px; transition: opacity .15s; }
    .anios span.fuera { opacity: .3; }
    .lienzo { flex: 1; min-height: 200px; position: relative; margin: 0 var(--e4); border: 1px solid var(--borde); border-radius: 14px; background: var(--superficie); overflow: hidden; }
    .lienzo svg { display: block; width: 100%; height: 100%; touch-action: none; }
    .lienzo g { cursor: pointer; }
    .lienzo text { font-family: var(--mono); font-weight: 500; }
    .lienzo text.nombre { font-family: var(--sans); font-weight: 600; }
    .caja svg, .atras svg { flex: none; }
    .controles { position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center; gap: 6px; }
    .controles button { min-width: 40px; min-height: 40px; border-radius: 10px; border: 1px solid var(--borde); background: color-mix(in oklab, var(--superficie-2) 88%, transparent); color: var(--texto); font-size: 18px; line-height: 1; backdrop-filter: blur(4px); }
    .controles .todo { font-size: var(--t-xs); font-weight: 600; padding: 0 6px; }
    .ayuda { position: absolute; left: 10px; bottom: 12px; max-width: 55%; background: var(--superficie-2); border: 1px solid var(--borde); border-radius: 999px; padding: 8px 12px; font-size: var(--t-xs); color: var(--texto-2); margin: 0; line-height: 1.3; }
    .lista-oculta { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

    .hoja { flex: none; background: var(--superficie); border-top: 1px solid var(--borde); border-radius: var(--r-grande) var(--r-grande) 0 0; padding: 10px var(--e4) var(--e4); box-shadow: var(--sombra); max-height: 46dvh; overflow-y: auto; overscroll-behavior: contain; }
    .tirador { display: block; width: 44px; height: 22px; margin: 0 auto 6px; background: none; border: none; position: relative; }
    .tirador::before { content: ''; position: absolute; inset: 9px 3px; border-radius: 2px; background: var(--borde); }
    .encabezado { display: flex; align-items: baseline; gap: 9px; }
    .encabezado .cod { color: var(--marca); font-size: var(--t-s); }
    .hoja h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
    .datos { margin: 5px 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); }
    .hoja .rot { border: none; padding-top: 0; margin: var(--e3) 0 0; color: var(--texto-3); }
    .fila { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 0; background: none; border: none; border-bottom: 1px solid var(--borde); text-align: left; min-height: 44px; }
    .fila .mono { font-size: var(--t-xs); color: var(--texto-3); min-width: 22px; }
    .fila .n { flex: 1; font-size: var(--t-m); }
    .ok { font-size: var(--t-xs); color: var(--verde); }
    .libre { font-size: var(--t-m); color: var(--texto-2); margin: var(--e2) 0 0; }
    .marcar { width: 100%; min-height: 46px; margin-top: var(--e4); border-radius: 11px; border: 1px solid var(--borde); background: var(--superficie-2); font-size: var(--t-m); font-weight: 600; }
    .estado { margin: var(--e2) 0 0; font-size: var(--t-s); color: var(--texto-2); text-align: center; }
    .limpiar { background: none; border: none; color: var(--marca); font-size: var(--t-s); text-decoration: underline; padding: 6px; }
    .vacio { padding: var(--e5) var(--e4); }
  `,
})
export class Grafo {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly aprobadas = inject(Aprobadas);
  private readonly elegidaCarrera = inject(CarreraElegida);
  private readonly svg = viewChild<ElementRef<SVGSVGElement>>('svg');

  private readonly params = toSignal(this.ruta.paramMap, {
    initialValue: this.ruta.snapshot.paramMap,
  });
  private readonly query = toSignal(this.ruta.queryParamMap, {
    initialValue: this.ruta.snapshot.queryParamMap,
  });

  protected readonly carrera = computed(() => carreraPorSlug(this.params().get('slug') ?? ''));
  protected readonly consulta = signal('');
  protected readonly seleccion = signal<string | null>(null);
  protected readonly vista = signal<'mapa' | 'lista'>('mapa');
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

  protected readonly resultados = computed(() => {
    const c = this.carrera();
    const q = this.consulta().trim();
    return c && q ? buscar(c, q).slice(0, 15) : [];
  });

  protected readonly elegida = computed<Materia | null>(() => {
    const cod = this.seleccion();
    return cod ? (this.layout().porCodigo.get(cod)?.materia ?? null) : null;
  });

  private readonly aprobadasSet = computed(() => {
    this.aprobadas.señal();
    const c = this.carrera();
    return c ? this.aprobadas.de(c.slug) : new Set<string>();
  });

  protected readonly totalAprobadas = computed(() => this.aprobadasSet().size);

  protected readonly disponibles = computed(() => {
    const c = this.carrera();
    const v = this.vinculos();
    if (!c || !v) return 0;
    const ap = this.aprobadasSet();
    return c.materias.filter((m) => puedeCursar(v, m.codigo, ap)).length;
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
    for (const n of this.layout().nodos)
      if (n.x + n.w > v.x && n.x < v.x + v.w) dentro.add(n.anio);
    return dentro;
  });

  constructor() {
    // El lienzo arranca cerca, donde la tarjeta se lee. Si el link trae una
    // materia, se abre ahí: es lo que espera quien recibe el link por mensaje.
    effect(() => {
      const l = this.layout();
      const pedida = this.query().get('materia');
      const w = Math.min(CERCA_ANCHO, l.ancho);
      const h = Math.min(this.altoPara(w), l.alto);
      if (pedida && l.porCodigo.has(pedida)) {
        this.seleccion.set(pedida);
        this.encuadre.set(encuadrar(l, pedida, w, h));
      } else {
        // Sin materia elegida se arranca arriba a la izquierda del primer año,
        // que es donde empieza a leerse el plan.
        this.seleccion.set(null);
        this.encuadre.set(this.limitar({ x: 0, y: this.primeraFila() - 14, w, h }));
      }
    });

    // Entrar por link a una carrera también la deja elegida en el teléfono.
    effect(() => {
      const c = this.carrera();
      if (c && this.elegidaCarrera.slug() !== c.slug) this.elegidaCarrera.elegir(c.slug);
    });
  }

  /**
   * El viewBox tiene que seguir la proporción del lienzo: si no, el SVG deja
   * franjas vacías arriba y abajo para no deformar el dibujo.
   */
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
   * sí, así que arrancar en el borde de arriba del lienzo dejaría a la vista
   * un vacío en vez del comienzo del plan.
   */
  private primeraFila(): number {
    const ys = this.layout().nodos.filter((n) => n.anio === 1).map((n) => n.y);
    return ys.length ? Math.min(...ys) : 0;
  }

  protected color = (anio: number) => `var(--n${((anio - 1) % 8) + 1})`;
  protected aniosDe = (c: Carrera) => anios(c);
  protected tieneCuat = (c: Carrera) => tieneCuatrimestres(c);
  protected anioDeMateria = (c: Carrera, m: Materia) =>
    c.tipoNivel === 'anio' ? m.nivel : Math.ceil(m.nivel / 2);

  /** Las materias de un año, partidas por cuatrimestre cuando el plan lo dice. */
  protected gruposDe(c: Carrera, anio: number): { titulo: string; materias: readonly Materia[] }[] {
    if (!tieneCuatrimestres(c)) return [{ titulo: '', materias: materiasDe(c, anio) }];
    return [1, 2]
      .map((q) => ({ titulo: `${q}° cuatrimestre`, materias: materiasDe(c, anio, q) }))
      .filter((g) => g.materias.length);
  }

  protected ubicacion(c: Carrera, m: Materia): string {
    const anio = this.anioDeMateria(c, m);
    const q = cuatrimestreDe(c, m);
    return q ? `${anio}° año, ${q}° cuatrimestre` : `${anio}° año`;
  }

  protected necesitaDe(m: Materia): readonly Materia[] {
    const v = this.vinculos();
    return v ? necesita(v, m.codigo) : [];
  }

  protected habilitaDe(m: Materia): readonly Materia[] {
    const v = this.vinculos();
    return v ? habilita(v, m.codigo) : [];
  }

  private readonly relacionadas = computed(() => {
    const cod = this.seleccion();
    const v = this.vinculos();
    if (!cod || !v) return { antes: new Set<string>(), despues: new Set<string>() };
    return {
      antes: new Set(necesita(v, cod).map((m) => m.codigo)),
      despues: new Set(habilita(v, cod).map((m) => m.codigo)),
    };
  });

  protected enFoco(codigo: string): boolean {
    const sel = this.seleccion();
    if (!sel) return true;
    const r = this.relacionadas();
    return codigo === sel || r.antes.has(codigo) || r.despues.has(codigo);
  }

  protected marcado(codigo: string): boolean {
    return !!this.seleccion() && this.enFoco(codigo);
  }

  protected activa(de: string, a: string): boolean {
    const sel = this.seleccion();
    return !!sel && (de === sel || a === sel);
  }

  protected opacidadArista(de: string, a: string): number {
    if (!this.seleccion()) return 0.4;
    return this.activa(de, a) ? 1 : 0.04;
  }

  protected aprobada = (codigo: string) => this.aprobadasSet().has(codigo);

  protected relleno(codigo: string, anio: number): string {
    if (codigo === this.seleccion()) return this.color(anio);
    return this.aprobada(codigo) ? 'var(--superficie-2)' : 'var(--superficie)';
  }

  protected borde(codigo: string, anio: number): string {
    if (this.aprobada(codigo)) return 'var(--verde)';
    return this.marcado(codigo) ? this.color(anio) : 'var(--borde)';
  }

  protected textoFicha(codigo: string): string {
    return codigo === this.seleccion() ? 'var(--sobre-marca)' : 'var(--texto)';
  }

  protected textoTenue(codigo: string): string {
    return codigo === this.seleccion() ? 'var(--sobre-marca)' : 'var(--texto-3)';
  }

  /** Un tilde en la esquina: el color no puede ser el único indicio. */
  protected tilde(n: { x: number; y: number; w: number }): string {
    const x = n.x + n.w - 34;
    const y = n.y + 8;
    return `M${x} ${y + 3} l2.4 2.6 l4.6-5.2`;
  }

  protected datos(c: Carrera, m: Materia): string {
    const partes = [this.ubicacion(c, m)];
    if (m.formato) partes.push(m.formato);
    partes.push(m.dedicacion === 'anual' ? 'anual' : 'cuatrimestral');
    if (m.horasSemanales) partes.push(`${m.horasSemanales} h semanales`);
    if (m.horasTotales) partes.push(`${m.horasTotales} h totales`);
    if (m.mencion) partes.push(m.mencion);
    if (this.seDicta().has(m.codigo)) partes.push('se dicta este cuatrimestre');
    return partes.join(' · ');
  }

  protected resumenTexto(m: Materia): string {
    const v = this.vinculos();
    if (!v) return '';
    const antes = necesita(v, m.codigo).map((x) => x.nombre);
    const despues = habilita(v, m.codigo).map((x) => x.nombre);
    return [
      antes.length ? `necesita ${antes.join(', ')}` : 'sin correlativas',
      despues.length ? `habilita ${despues.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ');
  }

  protected tocar(codigo: string): void {
    if (this.arrastro) return;
    this.irA(codigo);
  }

  protected irA(codigo: string): void {
    const c = this.carrera();
    if (!c) return;
    this.consulta.set('');
    this.vista.set('mapa');
    this.router.navigate(['/carreras', c.slug, 'correlatividades'], {
      queryParams: { materia: codigo },
      replaceUrl: true,
    });
  }

  protected cerrar(): void {
    const c = this.carrera();
    if (!c) return;
    this.router.navigate(['/carreras', c.slug, 'correlatividades'], { replaceUrl: true });
  }

  protected verTodo(): void {
    const l = this.layout();
    this.encuadre.set({ x: 0, y: 0, w: l.ancho, h: l.alto });
  }

  protected marcar(c: Carrera, codigo: string): void {
    this.aprobadas.alternar(c.slug, codigo);
  }

  protected limpiar(c: Carrera): void {
    this.aprobadas.limpiar(c.slug);
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
