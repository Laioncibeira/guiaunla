import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { carreraPorSlug, nombreNivelCorto, type Carrera, type Materia } from '../core/datos';
import { buscar, habilita, necesita, puedeCursar, vincular } from '../core/correlatividades';
import { calcularLayout, encuadrar, FICHA, type Layout } from '../core/grafo';
import { Aprobadas, CarreraElegida } from '../shared/ui';

const VISIBLE = { w: 348, h: 470 };

@Component({
  selector: 'app-grafo',
  imports: [RouterLink],
  template: `
    @if (carrera(); as c) {
      <header>
        <a class="atras" [routerLink]="['/carreras', c.slug]" aria-label="Volver a la carrera">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
        </a>
        <div>
          <h1>Correlatividades</h1>
          <p class="sub">{{ c.nombreCorto }} · {{ c.materias.length }} materias</p>
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

      @if (resultados().length) {
        <ul class="resultados">
          @for (m of resultados(); track m.codigo) {
            <li>
              <button type="button" (click)="irA(m.codigo)">
                <span class="raya" [style.background]="color(m.nivel)"></span>
                <span class="txt">
                  <span class="nom">{{ m.nombre }}</span>
                  <span class="meta"
                    ><span class="mono">{{ m.codigo }}</span> · {{ nivel(c, m.nivel) }}</span
                  >
                </span>
              </button>
            </li>
          } @empty {
            <li class="nada">No hay materias con ese nombre.</li>
          }
        </ul>
      } @else {
        <div class="niveles" aria-hidden="true">
          @for (n of nivelesVisibles(); track n) {
            <span [style.border-top-color]="color(n)">{{ nivel(c, n) }}</span>
          }
        </div>

        <div class="lienzo">
          <svg
            #svg
            [attr.viewBox]="viewBoxTexto()"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            [attr.aria-label]="'Mapa de correlatividades de ' + c.nombre"
            (pointerdown)="alApretar($event)"
            (pointermove)="alMover($event)"
            (pointerup)="alSoltar($event)"
            (pointercancel)="alSoltar($event)"
            (wheel)="alRodar($event)"
          >
            @for (a of layout().aristas; track a.de + '>' + a.a) {
              <path
                [attr.d]="a.d"
                fill="none"
                [attr.stroke]="color(a.nivelDe)"
                [attr.stroke-width]="activa(a.de, a.a) ? 2 : 1"
                [attr.opacity]="opacidadArista(a.de, a.a)"
              />
            }
            @for (n of layout().nodos; track n.codigo) {
              <g
                [attr.opacity]="enFoco(n.codigo) ? 1 : 0.16"
                (click)="tocar(n.codigo)"
                [attr.tabindex]="0"
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
                  rx="7"
                  [attr.fill]="relleno(n.codigo, n.nivel)"
                  [attr.stroke]="borde(n.codigo, n.nivel)"
                  [attr.stroke-width]="marcado(n.codigo) ? 1.8 : 1"
                />
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
                <text
                  [attr.x]="n.x + n.w / 2"
                  [attr.y]="n.y + n.h / 2 + 3.6"
                  text-anchor="middle"
                  [attr.font-size]="n.codigo.length > 3 ? 8.5 : 11"
                  [attr.fill]="textoFicha(n.codigo)"
                >
                  {{ n.codigo }}
                </text>
              </g>
            }
          </svg>

          @if (!seleccion()) {
            <p class="ayuda">Tocá una materia · pellizcá para acercar</p>
          }
          @if (alejado()) {
            <button type="button" class="reencuadrar" (click)="verTodo()">Ver todo</button>
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
              {{ totalAprobadas() }} {{ totalAprobadas() === 1 ? 'materia marcada' : 'materias marcadas' }} · podés cursar {{ disponibles() }}
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
    /* Alto exacto del area util: la barra de abajo es fija y su lugar ya esta
       reservado por el contenedor, asi que la hoja inferior nunca queda debajo. */
    :host { display: flex; flex-direction: column; min-height: 0;
      height: calc(100dvh - var(--barra) - env(safe-area-inset-bottom)); }
    header { display: flex; align-items: center; gap: var(--e3); padding: 14px var(--e4) 10px; border-bottom: 1px solid var(--borde); }
    h1 { margin: 0; font-size: var(--t-xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .atras { width: 32px; height: 32px; flex: none; display: grid; place-items: center; border: 1px solid var(--borde); border-radius: 9px; background: var(--superficie); color: var(--texto-2); }
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
    .niveles { display: flex; gap: 4px; padding: 0 var(--e4) 6px; }
    .niveles span { flex: 1; text-align: center; font-size: 9px; font-weight: 600; color: var(--texto-3); border-top: 2px solid; padding-top: 5px; }
    .lienzo { flex: 1; min-height: 200px; position: relative; margin: 0 var(--e4); border: 1px solid var(--borde); border-radius: 14px; background: var(--superficie); overflow: hidden; }
    .lienzo svg { display: block; width: 100%; height: 100%; touch-action: none; }
    .lienzo g { cursor: pointer; }
    .lienzo text { font-family: var(--mono); font-weight: 500; }
    .caja svg, .atras svg { flex: none; }
    .ayuda, .reencuadrar { position: absolute; left: 50%; transform: translateX(-50%); bottom: 12px; background: var(--superficie-2); border: 1px solid var(--borde); border-radius: 999px; padding: 8px 14px; font-size: var(--t-s); color: var(--texto-2); margin: 0; white-space: nowrap; }
    .reencuadrar { min-height: 40px; }
    .lista-oculta { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .hoja { flex: none; background: var(--superficie); border-top: 1px solid var(--borde); border-radius: var(--r-grande) var(--r-grande) 0 0; padding: 10px var(--e4) var(--e4); box-shadow: var(--sombra); max-height: 46dvh; overflow-y: auto; overscroll-behavior: contain; }
    .tirador { display: block; width: 44px; height: 22px; margin: 0 auto 6px; background: none; border: none; position: relative; }
    .tirador::before { content: ''; position: absolute; inset: 9px 3px; border-radius: 2px; background: var(--borde); }
    .encabezado { display: flex; align-items: baseline; gap: 9px; }
    .cod { font-size: var(--t-s); color: var(--marca); }
    .hoja h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
    .datos { margin: 5px 0 var(--e3); font-size: var(--t-s); color: var(--texto-2); }
    .rot { margin: var(--e3) 0 0; font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
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

  private readonly params = toSignal(this.ruta.paramMap, { initialValue: this.ruta.snapshot.paramMap });
  private readonly query = toSignal(this.ruta.queryParamMap, {
    initialValue: this.ruta.snapshot.queryParamMap,
  });

  protected readonly carrera = computed(() => carreraPorSlug(this.params().get('slug') ?? ''));
  protected readonly consulta = signal('');
  protected readonly seleccion = signal<string | null>(null);
  protected readonly vista = signal({ x: 0, y: 0, w: VISIBLE.w, h: VISIBLE.h });

  protected readonly layout = computed<Layout>(() => {
    const c = this.carrera();
    return c
      ? calcularLayout(c, FICHA)
      : { nodos: [], aristas: [], porCodigo: new Map(), ancho: 1, alto: 1, niveles: 0 };
  });

  private readonly vinculos = computed(() => {
    const c = this.carrera();
    return c ? vincular(c) : null;
  });

  protected readonly resultados = computed(() => {
    const c = this.carrera();
    const q = this.consulta().trim();
    return c && q ? buscar(c, q).slice(0, 12) : [];
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

  protected readonly nivelesVisibles = computed(() =>
    Array.from({ length: this.layout().niveles }, (_, i) => i + 1),
  );

  protected readonly viewBoxTexto = computed(() => {
    const v = this.vista();
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
  });

  protected readonly alejado = computed(() => {
    const l = this.layout();
    const v = this.vista();
    return v.w < l.ancho - 1 || v.h < l.alto - 1;
  });

  constructor() {
    // El lienzo arranca mostrando el plan entero; si el link trae una materia,
    // se abre ahí, que es lo que espera quien recibe el link por mensaje.
    effect(() => {
      const l = this.layout();
      const pedida = this.query().get('materia');
      if (pedida && l.porCodigo.has(pedida)) {
        this.seleccion.set(pedida);
        this.vista.set(encuadrar(l, pedida, VISIBLE.w, VISIBLE.h));
      } else {
        this.seleccion.set(null);
        this.vista.set({ x: 0, y: 0, w: l.ancho, h: l.alto });
      }
    });

    // Entrar por link a una carrera también la deja elegida en el teléfono.
    effect(() => {
      const c = this.carrera();
      if (c && this.elegidaCarrera.slug() !== c.slug) this.elegidaCarrera.elegir(c.slug);
    });
  }

  protected nivel = (c: Carrera, n: number) => nombreNivelCorto(c, n);
  protected color = (n: number) => `var(--n${((n - 1) % 8) + 1})`;

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
    const sel = this.seleccion();
    if (!sel) return false;
    const r = this.relacionadas();
    return codigo === sel || r.antes.has(codigo) || r.despues.has(codigo);
  }

  protected activa(de: string, a: string): boolean {
    const sel = this.seleccion();
    return !!sel && (de === sel || a === sel);
  }

  protected opacidadArista(de: string, a: string): number {
    if (!this.seleccion()) return 0.34;
    return this.activa(de, a) ? 1 : 0.05;
  }

  protected aprobada = (codigo: string) => this.aprobadasSet().has(codigo);

  protected relleno(codigo: string, nivel: number): string {
    if (codigo === this.seleccion()) return this.color(nivel);
    return this.aprobada(codigo) ? 'var(--superficie-2)' : 'var(--superficie)';
  }

  protected borde(codigo: string, nivel: number): string {
    if (this.aprobada(codigo)) return 'var(--verde)';
    return this.marcado(codigo) ? this.color(nivel) : 'var(--borde)';
  }

  protected textoFicha(codigo: string): string {
    return codigo === this.seleccion() ? 'var(--sobre-marca)' : 'var(--texto)';
  }

  /** Un tilde chico en la esquina: el color no puede ser el único indicio. */
  protected tilde(n: { x: number; y: number; w: number }): string {
    const x = n.x + n.w - 11;
    const y = n.y + 6;
    return `M${x} ${y + 3} l2 2.4 l4-4.6`;
  }

  protected datos(c: Carrera, m: Materia): string {
    const partes = [nombreNivelCorto(c, m.nivel)];
    if (m.formato) partes.push(m.formato);
    if (m.dedicacion === 'anual') partes.push('anual');
    if (m.horasSemanales) partes.push(`${m.horasSemanales} h semanales`);
    if (m.horasTotales) partes.push(`${m.horasTotales} h totales`);
    if (m.mencion) partes.push(m.mencion);
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
    this.vista.set({ x: 0, y: 0, w: l.ancho, h: l.alto });
  }

  protected marcar(c: Carrera, codigo: string): void {
    this.aprobadas.alternar(c.slug, codigo);
  }

  protected limpiar(c: Carrera): void {
    this.aprobadas.limpiar(c.slug);
  }

  // ------------------------------------------------ arrastrar y acercar
  private punteros = new Map<number, { x: number; y: number }>();
  private inicio: { x: number; y: number; vista: typeof VISIBLE & { x: number; y: number } } | null =
    null;
  private separacionInicial = 0;
  /** Se marca al arrastrar para que soltar el dedo no cuente como toque. */
  private arrastro = false;

  protected alApretar(e: PointerEvent): void {
    this.svg()?.nativeElement.setPointerCapture?.(e.pointerId);
    this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.arrastro = false;
    const v = this.vista();
    this.inicio = { x: e.clientX, y: e.clientY, vista: { ...v } };
    if (this.punteros.size === 2) this.separacionInicial = this.separacion();
  }

  protected alMover(e: PointerEvent): void {
    if (!this.punteros.has(e.pointerId)) return;
    this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const caja = this.svg()?.nativeElement.getBoundingClientRect();
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

    const v = this.vista();
    const dx = ((e.clientX - this.inicio.x) * v.w) / caja.width;
    const dy = ((e.clientY - this.inicio.y) * v.h) / caja.height;
    if (Math.abs(dx) + Math.abs(dy) > 3) this.arrastro = true;
    this.vista.set(this.limitar({ ...v, x: this.inicio.vista.x - dx, y: this.inicio.vista.y - dy }));
  }

  protected alSoltar(e: PointerEvent): void {
    this.punteros.delete(e.pointerId);
    if (this.punteros.size === 0) this.inicio = null;
  }

  protected alRodar(e: WheelEvent): void {
    const caja = this.svg()?.nativeElement.getBoundingClientRect();
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
    const v = this.vista();
    const w = Math.min(Math.max(v.w * factor, 120), l.ancho);
    const h = (w * v.h) / v.w;
    // Se acerca hacia el centro de lo que se está mirando.
    this.vista.set(
      this.limitar({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h }),
    );
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
