import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CARRERAS, carreraPorSlug, nombreNivel, type Carrera, type Materia } from '../core/datos';
import { habilita, necesita, vincular } from '../core/correlatividades';
import { CarreraElegida } from '../shared/ui';

@Component({
  selector: 'app-carreras',
  imports: [RouterLink],
  template: `
    <header>
      <div>
        <h1>Carreras</h1>
        <p class="sub">Departamento de Humanidades y Artes</p>
      </div>
    </header>
    <main>
      @for (c of carreras; track c.slug; let i = $index) {
        <a class="card" [routerLink]="['/carreras', c.slug]" (click)="elegir(c.slug)">
          <span class="raya" [style.background]="'var(--n' + (i + 1) + ')'"></span>
          <span class="txt">
            <span class="nom">{{ c.nombreCorto }}</span>
            <span class="meta">
              {{ c.materias.length }} materias · {{ c.duracionAnios }} años
              @if (c.tituloIntermedio) {
                · título intermedio
              }
            </span>
          </span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="m9.5 5.5 6.5 6.5-6.5 6.5"/></svg>
        </a>
      }
      <p class="aviso">
        Los planes salen de la web de la universidad. Si algo no coincide con tu plan, escribinos.
      </p>
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { padding: 18px var(--e4) var(--e3); }
    h1 { margin: 0; font-size: var(--t-2xl); font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e3); }
    .card { display: flex; gap: var(--e3); align-items: center; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 14px; color: inherit; min-height: 68px; }
    .raya { width: 4px; align-self: stretch; border-radius: 2px; flex: none; }
    .txt { flex: 1; min-width: 0; }
    .nom { display: block; font-size: var(--t-l); font-weight: 600; letter-spacing: -0.01em; }
    .meta { display: block; font-size: var(--t-s); color: var(--texto-2); margin-top: 3px; }
    .card svg { color: var(--texto-3); flex: none; }
    .aviso { border: 1px dashed var(--borde); border-radius: var(--r); padding: var(--e3); font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; margin: 0; }
  `,
})
export class Carreras {
  private readonly elegida = inject(CarreraElegida);
  protected readonly carreras = CARRERAS;
  protected elegir(slug: string): void {
    this.elegida.elegir(slug);
  }
}

@Component({
  selector: 'app-carrera',
  imports: [RouterLink],
  template: `
    @if (carrera(); as c) {
      <header>
        <a class="atras" routerLink="/carreras" aria-label="Volver a carreras">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
        </a>
        <div>
          <h1>{{ c.nombreCorto }}</h1>
          <p class="sub">{{ subtitulo(c) }}</p>
        </div>
      </header>

      <main>
        <a class="destacada" [routerLink]="['/carreras', c.slug, 'correlatividades']">
          <span>
            <strong>Ver el mapa de correlatividades</strong>
            <small>Todo el plan y sus caminos</small>
          </span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="m9.5 5.5 6.5 6.5-6.5 6.5"/></svg>
        </a>

        @if (c.tituloIntermedio; as ti) {
          <p class="nota">
            Con las materias hasta {{ nivelTexto(c, ti.hastaNivel) }} obtenés el título de
            <strong>{{ ti.nombre }}</strong>.
          </p>
        }
        @if (c.nota) {
          <p class="nota">{{ c.nota }}</p>
        }

        @for (n of niveles(); track n) {
          <section>
            <h2 class="rot">{{ nivelTexto(c, n) }}</h2>
            @for (m of delNivel(c, n); track m.codigo) {
              <a
                class="fila"
                [routerLink]="['/carreras', c.slug, 'correlatividades']"
                [queryParams]="{ materia: m.codigo }"
              >
                <span class="mono">{{ m.codigo }}</span>
                <span class="n">
                  {{ m.nombre }}
                  @if (correlativasDe(m); as texto) {
                    <small>{{ texto }}</small>
                  }
                </span>
                @if (m.horasSemanales) {
                  <span class="hs">{{ m.horasSemanales }} h</span>
                }
              </a>
            }
          </section>
        }

        <p class="fuente">
          Plan tomado de <a [href]="c.fuenteUrl" rel="noopener">la web de la UNLa</a> el
          {{ c.fuenteFecha }}@if (c.cotejado) {, y cotejado materia por materia contra esa tabla}.
        </p>
      </main>
    } @else {
      <p class="vacio">No encontramos esa carrera. <a routerLink="/carreras">Ver todas</a></p>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; }
    header { display: flex; align-items: center; gap: var(--e3); padding: 14px var(--e4) 10px; border-bottom: 1px solid var(--borde); }
    h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: var(--t-s); color: var(--texto-2); }
    .atras { width: 32px; height: 32px; flex: none; display: grid; place-items: center; border: 1px solid var(--borde); border-radius: 9px; background: var(--superficie); color: var(--texto-2); }
    main { padding: var(--e3) var(--e4) var(--e4); display: flex; flex-direction: column; gap: var(--e3); }
    .destacada { display: flex; align-items: center; gap: var(--e3); background: var(--marca); border-radius: var(--r); padding: 14px; color: var(--sobre-marca); min-height: 66px; }
    .destacada span { flex: 1; }
    .destacada strong { display: block; font-size: var(--t-l); }
    .destacada small { display: block; font-size: var(--t-s); opacity: 0.85; margin-top: 3px; }
    .nota { margin: 0; background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 12px 13px; font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; }
    .nota strong { color: var(--texto); }
    .rot { margin: var(--e2) 0 var(--e1); font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    .fila { display: flex; align-items: center; gap: 11px; padding: 9px 0; border-bottom: 1px solid var(--borde); color: inherit; min-height: 46px; }
    .fila .mono { font-size: var(--t-xs); color: var(--texto-3); min-width: 24px; }
    .fila .n { flex: 1; font-size: var(--t-m); }
    .fila small { display: block; font-size: var(--t-xs); color: var(--texto-3); margin-top: 2px; }
    .hs { font-size: 10px; color: var(--texto-3); white-space: nowrap; }
    .fuente { font-size: var(--t-xs); color: var(--texto-3); margin: var(--e2) 0 0; }
    .vacio { padding: var(--e5) var(--e4); }
  `,
})
export class DetalleCarrera {
  private readonly ruta = inject(ActivatedRoute);
  private readonly elegida = inject(CarreraElegida);
  private readonly params = toSignal(this.ruta.paramMap, {
    initialValue: this.ruta.snapshot.paramMap,
  });

  protected readonly carrera = computed(() => carreraPorSlug(this.params().get('slug') ?? ''));

  constructor() {
    // Entrar por link a una carrera también la deja elegida en el teléfono.
    effect(() => {
      const c = this.carrera();
      if (c && this.elegida.slug() !== c.slug) this.elegida.elegir(c.slug);
    });
  }

  protected readonly niveles = computed(() =>
    Array.from({ length: this.carrera()?.niveles ?? 0 }, (_, i) => i + 1),
  );

  protected nivelTexto = (c: Carrera, n: number) => nombreNivel(c, n);
  protected delNivel = (c: Carrera, n: number) => c.materias.filter((m) => m.nivel === n);

  protected subtitulo(c: Carrera): string {
    const partes = [c.materias.length + ' materias', c.duracionAnios + ' años'];
    if (c.horasTotales) partes.push(c.horasTotales + ' h');
    return partes.join(' · ');
  }

  protected correlativasDe(m: Materia): string {
    const c = this.carrera();
    if (!c || !m.correlativas.length) return '';
    const v = vincular(c);
    const antes = necesita(v, m.codigo).map((x) => x.codigo);
    const despues = habilita(v, m.codigo).length;
    const a = antes.length ? `necesita ${antes.join(', ')}` : '';
    const d = despues ? `habilita ${despues}` : '';
    return [a, d].filter(Boolean).join(' · ');
  }
}
