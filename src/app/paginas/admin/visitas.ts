import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { Nube } from '../../core/firebase';
import { diaUtc } from '../../core/visitas-clave';

interface Registro {
  readonly dia: string;
  readonly ruta: string;
  readonly n: number;
}

const DIAS = 30;

@Component({
  selector: 'app-admin-visitas',
  template: `
    <main>
      <p class="nota">
        Visitas por pantalla en los últimos {{ dias }} días. Cuenta una vez por pantalla y por
        sesión, sin cookies ni datos de nadie. Es orientativo: el día corta a las 21 hs de Argentina.
      </p>

      @if (estado() === 'cargando') {
        <p class="vacio">Cargando…</p>
      } @else if (estado() === 'error') {
        <p class="vacio">No se pudo leer. ¿Tu cuenta figura en la lista de administradores?</p>
      } @else {
        <div class="tiles">
          <div class="tile"><strong>{{ total() }}</strong><span>visitas en {{ dias }} días</span></div>
          <div class="tile"><strong>{{ hoy() }}</strong><span>hoy</span></div>
        </div>

        <h2 class="rot">Por pantalla</h2>
        <table>
          <thead><tr><th>Pantalla</th><th class="num">Visitas</th></tr></thead>
          <tbody>
            @for (f of porRuta(); track f.ruta) {
              <tr><td>{{ f.ruta }}</td><td class="num mono">{{ f.n }}</td></tr>
            } @empty {
              <tr><td colspan="2" class="vacio-celda">Sin visitas registradas todavía.</td></tr>
            }
          </tbody>
        </table>

        <h2 class="rot">Por día</h2>
        <table>
          <thead><tr><th>Día</th><th class="num">Visitas</th></tr></thead>
          <tbody>
            @for (f of porDia(); track f.dia) {
              <tr><td class="mono">{{ f.dia }}</td><td class="num mono">{{ f.n }}</td></tr>
            }
          </tbody>
        </table>
      }
    </main>
  `,
  styles: `
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: 12px; }
    .nota { margin: 0; font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; }
    .tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .tile { display: flex; flex-direction: column; gap: 2px; padding: 12px; border-radius: var(--r); background: var(--superficie); border: 1px solid var(--borde); }
    .tile strong { font-family: var(--mono); font-size: 24px; font-weight: 500; }
    .tile span { font-size: var(--t-xs); color: var(--texto-3); text-transform: uppercase; letter-spacing: 0.08em; }
    .rot { margin: 6px 0 0; font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    table { width: 100%; border-collapse: collapse; font-size: var(--t-s); }
    th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--borde); }
    th { font-size: var(--t-xs); color: var(--texto-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .num { text-align: right; }
    .vacio, .vacio-celda { padding: 12px; border: 1px dashed var(--borde); border-radius: var(--r); font-size: var(--t-s); color: var(--texto-2); margin: 0; }
    .vacio-celda { border: none; }
  `,
})
export class AdminVisitas {
  private readonly nube = inject(Nube);
  protected readonly dias = DIAS;
  protected readonly registros = signal<Registro[]>([]);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  protected readonly total = computed(() => this.registros().reduce((a, r) => a + r.n, 0));
  protected readonly hoy = computed(() =>
    this.registros().filter((r) => r.dia === diaUtc()).reduce((a, r) => a + r.n, 0),
  );
  protected readonly porRuta = computed(() => {
    const m = new Map<string, number>();
    for (const r of this.registros()) m.set(r.ruta, (m.get(r.ruta) ?? 0) + r.n);
    return [...m].map(([ruta, n]) => ({ ruta, n })).sort((a, b) => b.n - a.n);
  });
  protected readonly porDia = computed(() => {
    const m = new Map<string, number>();
    for (const r of this.registros()) m.set(r.dia, (m.get(r.dia) ?? 0) + r.n);
    return [...m].map(([dia, n]) => ({ dia, n })).sort((a, b) => b.dia.localeCompare(a.dia));
  });

  constructor() {
    afterNextRender(() => this.cargar());
  }

  private async cargar(): Promise<void> {
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const desde = diaUtc(new Date(Date.now() - DIAS * 86400000));
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'visitas'), fs.where('dia', '>=', desde)));
      this.registros.set(
        snap.docs.map((d) => {
          const x = d.data();
          return { dia: String(x['dia']), ruta: String(x['ruta']), n: Number(x['n']) || 0 };
        }),
      );
      this.estado.set('listo');
    } catch {
      this.estado.set('error');
    }
  }
}
