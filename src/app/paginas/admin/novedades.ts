import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Nube } from '../../core/firebase';

interface Nota {
  readonly id: string;
  readonly titulo: string;
  readonly cuerpo: string;
  /** 'yyyy-mm-dd' */
  readonly fecha: string;
  readonly publicada: boolean;
}

const hoyIso = () => new Date().toISOString().slice(0, 10);

@Component({
  selector: 'app-admin-novedades',
  template: `
    <main>
      <section class="editor">
        <h2>{{ editando() ? 'Editar novedad' : 'Nueva novedad' }}</h2>
        <label>
          <span>Título</span>
          <input type="text" maxlength="80" [value]="titulo()" (input)="titulo.set($any($event.target).value)" />
        </label>
        <label>
          <span>Texto</span>
          <textarea rows="5" maxlength="2000" [value]="cuerpo()" (input)="cuerpo.set($any($event.target).value)"></textarea>
        </label>
        <div class="fila">
          <label>
            <span>Fecha</span>
            <input type="date" [value]="fecha()" (input)="fecha.set($any($event.target).value)" />
          </label>
          <label class="check">
            <input type="checkbox" [checked]="publicada()" (change)="publicada.set($any($event.target).checked)" />
            <span>Publicada</span>
          </label>
        </div>
        @if (error(); as e) {
          <p class="error" role="alert">{{ e }}</p>
        }
        <div class="botones">
          <button type="button" class="guardar" (click)="guardar()" [disabled]="guardando()">
            {{ guardando() ? 'Guardando…' : editando() ? 'Guardar cambios' : 'Crear' }}
          </button>
          @if (editando()) {
            <button type="button" (click)="cancelar()">Cancelar</button>
          }
        </div>
      </section>

      @if (estado() === 'error') {
        <p class="vacio">No se pudo leer. ¿Tu cuenta figura en la lista de administradores?</p>
      }
      @for (n of lista(); track n.id) {
        <article class="card" [class.borrador]="!n.publicada">
          <div class="meta">
            <span class="mono">{{ n.fecha }}</span>
            <span class="estado">{{ n.publicada ? 'publicada' : 'borrador' }}</span>
          </div>
          <h3>{{ n.titulo }}</h3>
          <p>{{ n.cuerpo }}</p>
          <div class="botones">
            <button type="button" (click)="editar(n)">Editar</button>
            <button type="button" (click)="alternar(n)">{{ n.publicada ? 'Despublicar' : 'Publicar' }}</button>
            <button type="button" class="peligro" (click)="borrar(n)">Borrar</button>
          </div>
        </article>
      } @empty {
        @if (estado() === 'listo') { <p class="vacio">Todavía no hay novedades. Escribí la primera arriba.</p> }
      }
    </main>
  `,
  styles: `
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: 10px; }
    .editor { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: var(--r); background: var(--superficie); border: 1px solid var(--marca); }
    h2 { margin: 0; font-size: var(--t-l); }
    label { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    label > span { font-size: var(--t-xs); font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--texto-3); }
    input[type='text'], input[type='date'], textarea { font: inherit; font-size: var(--t-m); color: var(--texto); background: var(--superficie-2); border: 1px solid var(--borde); border-radius: 10px; padding: 10px 12px; min-height: 44px; resize: vertical; }
    input:focus, textarea:focus { outline: none; border-color: var(--marca); box-shadow: var(--foco); }
    .fila { display: flex; gap: 10px; align-items: flex-end; }
    .check { flex-direction: row; align-items: center; gap: 8px; min-height: 44px; }
    .check input { width: 20px; height: 20px; accent-color: var(--marca); }
    .check > span { font-size: var(--t-s); color: var(--texto-2); text-transform: none; letter-spacing: 0; font-weight: 500; }
    .botones { display: flex; gap: 6px; flex-wrap: wrap; }
    .botones button { min-height: 40px; padding: 0 12px; border-radius: 9px; border: 1px solid var(--borde); background: var(--superficie-2); color: var(--texto); font-size: var(--t-s); font-weight: 600; }
    .botones .guardar { background: var(--marca); border-color: var(--marca); color: var(--sobre-marca); }
    .botones .peligro { color: var(--naranja); }
    .card { background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 12px 14px; }
    .card.borrador { border-style: dashed; }
    .meta { display: flex; gap: 10px; font-size: var(--t-xs); color: var(--texto-3); }
    .estado { color: var(--verde); }
    .borrador .estado { color: var(--naranja); }
    h3 { margin: 4px 0 0; font-size: var(--t-m); font-weight: 700; }
    .card p { margin: 6px 0 10px; font-size: var(--t-s); color: var(--texto-2); line-height: 1.45; white-space: pre-line; }
    .error { margin: 0; font-size: var(--t-s); color: var(--naranja); }
    .vacio { margin: 0; padding: 12px; border: 1px dashed var(--borde); border-radius: var(--r); font-size: var(--t-s); color: var(--texto-2); }
  `,
})
export class AdminNovedades {
  private readonly nube = inject(Nube);
  protected readonly lista = signal<Nota[]>([]);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
  protected readonly editando = signal<string | null>(null);
  protected readonly titulo = signal('');
  protected readonly cuerpo = signal('');
  protected readonly fecha = signal(hoyIso());
  protected readonly publicada = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly guardando = signal(false);

  constructor() {
    afterNextRender(() => this.cargar());
  }

  private async cargar(): Promise<void> {
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'novedades'), fs.orderBy('fecha', 'desc'), fs.limit(200)));
      this.lista.set(
        snap.docs.map((d) => {
          const x = d.data();
          const f = x['fecha'] as { toDate?: () => Date } | undefined;
          return {
            id: d.id,
            titulo: String(x['titulo'] ?? ''),
            cuerpo: String(x['cuerpo'] ?? ''),
            fecha: (f?.toDate ? f.toDate() : new Date()).toISOString().slice(0, 10),
            publicada: x['publicada'] === true,
          };
        }),
      );
      this.estado.set('listo');
    } catch {
      this.estado.set('error');
    }
  }

  protected editar(n: Nota): void {
    this.editando.set(n.id);
    this.titulo.set(n.titulo);
    this.cuerpo.set(n.cuerpo);
    this.fecha.set(n.fecha);
    this.publicada.set(n.publicada);
    this.error.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelar(): void {
    this.editando.set(null);
    this.titulo.set('');
    this.cuerpo.set('');
    this.fecha.set(hoyIso());
    this.publicada.set(true);
    this.error.set(null);
  }

  protected async guardar(): Promise<void> {
    this.error.set(null);
    if (!this.titulo().trim() || !this.cuerpo().trim() || !this.fecha()) {
      this.error.set('Título, texto y fecha son obligatorios.');
      return;
    }
    this.guardando.set(true);
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      // La fecha se guarda al mediodía de Argentina para que no cambie de día en ninguna zona.
      const fechaTs = fs.Timestamp.fromDate(new Date(this.fecha() + 'T12:00:00-03:00'));
      const base = { titulo: this.titulo().trim(), cuerpo: this.cuerpo().trim(), fecha: fechaTs, publicada: this.publicada() };
      const id = this.editando();
      if (id) {
        await fs.updateDoc(fs.doc(db, 'novedades', id), { ...base, actualizada: fs.serverTimestamp() });
      } else {
        await fs.addDoc(fs.collection(db, 'novedades'), { ...base, creada: fs.serverTimestamp(), actualizada: fs.serverTimestamp() });
      }
      this.cancelar();
      await this.cargar();
    } catch {
      this.error.set('No se pudo guardar. Revisá que tu cuenta esté habilitada.');
    } finally {
      this.guardando.set(false);
    }
  }

  protected async alternar(n: Nota): Promise<void> {
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    await fs.updateDoc(fs.doc(db, 'novedades', n.id), {
      publicada: !n.publicada,
      actualizada: fs.serverTimestamp(),
    });
    this.lista.update((l) => l.map((y) => (y.id === n.id ? { ...y, publicada: !n.publicada } : y)));
  }

  protected async borrar(n: Nota): Promise<void> {
    if (!confirm(`¿Borrar "${n.titulo}"? No se puede deshacer.`)) return;
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    await fs.deleteDoc(fs.doc(db, 'novedades', n.id));
    this.lista.update((l) => l.filter((y) => y.id !== n.id));
  }
}
