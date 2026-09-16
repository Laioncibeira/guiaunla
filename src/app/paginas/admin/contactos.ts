import { afterNextRender, Component, inject, signal } from '@angular/core';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Nube } from '../../core/firebase';
import { aCsv, descargar, fechaHoraAr } from './csv';

interface Recibido {
  readonly id: string;
  readonly mensaje: string;
  readonly contacto: string;
  readonly ruta: string;
  readonly creado: Date;
  readonly leido: boolean;
}

const PAGINA = 100;

@Component({
  selector: 'app-admin-contactos',
  template: `
    <main>
      <div class="acciones">
        <label class="interruptor">
          <input type="checkbox" [checked]="abierto()" (change)="cambiarAbierto($any($event.target).checked)" />
          <span>Formulario {{ abierto() ? 'abierto' : 'cerrado' }}</span>
        </label>
        <button type="button" (click)="exportar()" [disabled]="!lista().length">Exportar a Excel (CSV)</button>
      </div>

      @if (estado() === 'cargando') {
        <p class="vacio">Cargando…</p>
      } @else if (estado() === 'error') {
        <p class="vacio">No se pudo leer. ¿Tu cuenta figura en la lista de administradores?</p>
      }

      @for (c of lista(); track c.id) {
        <article class="card" [class.leido]="c.leido">
          <div class="meta">
            <span class="mono">{{ fecha(c.creado) }}</span>
            @if (c.ruta) { <span class="ruta">desde {{ c.ruta }}</span> }
          </div>
          <p class="mensaje">{{ c.mensaje }}</p>
          <p class="contacto">{{ c.contacto }}</p>
          <div class="botones">
            <button type="button" (click)="marcar(c)">{{ c.leido ? 'Marcar no leído' : 'Marcar leído' }}</button>
            <button type="button" class="peligro" (click)="borrar(c)">Borrar</button>
          </div>
        </article>
      } @empty {
        @if (estado() === 'listo') { <p class="vacio">Todavía no llegó ningún mensaje.</p> }
      }

      @if (hayMas()) {
        <button type="button" class="mas" (click)="cargarMas()">Cargar más</button>
      }
    </main>
  `,
  styles: `
    main { padding: 0 var(--e4) var(--e4); display: flex; flex-direction: column; gap: 10px; }
    .acciones { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
    .interruptor { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; font-size: var(--t-s); color: var(--texto-2); }
    .interruptor input { width: 20px; height: 20px; accent-color: var(--marca); }
    .acciones > button { min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--marca); background: none; color: var(--marca); font-size: var(--t-s); font-weight: 600; }
    .acciones > button:disabled { opacity: 0.5; }
    .card { background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--r); padding: 12px 14px; }
    .card.leido { opacity: 0.6; }
    .meta { display: flex; gap: 10px; font-size: var(--t-xs); color: var(--texto-3); }
    .mensaje { margin: 6px 0 0; font-size: var(--t-m); line-height: 1.45; white-space: pre-line; }
    .contacto { margin: 6px 0 0; font-family: var(--mono); font-size: var(--t-s); color: var(--marca); }
    .botones { display: flex; gap: 6px; margin-top: 10px; }
    .botones button { min-height: 36px; padding: 0 10px; border-radius: 9px; border: 1px solid var(--borde); background: var(--superficie-2); color: var(--texto); font-size: var(--t-xs); font-weight: 600; }
    .botones .peligro { color: var(--naranja); }
    .mas { min-height: 44px; border-radius: 10px; border: 1px solid var(--borde); background: var(--superficie-2); color: var(--texto); font-weight: 600; }
    .vacio { margin: 0; padding: 12px; border: 1px dashed var(--borde); border-radius: var(--r); font-size: var(--t-s); color: var(--texto-2); }
  `,
})
export class AdminContactos {
  private readonly nube = inject(Nube);
  protected readonly lista = signal<Recibido[]>([]);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
  protected readonly abierto = signal(true);
  protected readonly hayMas = signal(false);
  private ultimo: QueryDocumentSnapshot | null = null;

  constructor() {
    afterNextRender(() => {
      this.cargarMas();
      this.leerInterruptor();
    });
  }

  protected fecha = (d: Date) => fechaHoraAr(d);

  protected async cargarMas(): Promise<void> {
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const partes = [fs.orderBy('creado', 'desc'), fs.limit(PAGINA)];
      const q = this.ultimo
        ? fs.query(fs.collection(db, 'contactos'), ...partes.slice(0, 1), fs.startAfter(this.ultimo), partes[1])
        : fs.query(fs.collection(db, 'contactos'), ...partes);
      const snap = await fs.getDocs(q);
      const nuevos = snap.docs.map((d) => {
        const x = d.data();
        const creado = x['creado'] as { toDate?: () => Date } | undefined;
        return {
          id: d.id,
          mensaje: String(x['mensaje'] ?? ''),
          contacto: String(x['contacto'] ?? ''),
          ruta: String(x['ruta'] ?? ''),
          creado: creado?.toDate ? creado.toDate() : new Date(0),
          leido: x['leido'] === true,
        };
      });
      this.lista.update((l) => [...l, ...nuevos]);
      this.ultimo = snap.docs[snap.docs.length - 1] ?? this.ultimo;
      this.hayMas.set(snap.docs.length === PAGINA);
      this.estado.set('listo');
    } catch {
      this.estado.set('error');
    }
  }

  private async leerInterruptor(): Promise<void> {
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const d = await fs.getDoc(fs.doc(db, 'config', 'contacto'));
      this.abierto.set(d.exists() ? d.data()['abierto'] !== false : true);
    } catch {
      /* se deja como abierto */
    }
  }

  protected async cambiarAbierto(valor: boolean): Promise<void> {
    this.abierto.set(valor);
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    await fs.setDoc(fs.doc(db, 'config', 'contacto'), { abierto: valor });
  }

  protected async marcar(c: Recibido): Promise<void> {
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    await fs.updateDoc(fs.doc(db, 'contactos', c.id), { leido: !c.leido });
    this.lista.update((l) => l.map((x) => (x.id === c.id ? { ...x, leido: !c.leido } : x)));
  }

  protected async borrar(c: Recibido): Promise<void> {
    if (!confirm('¿Borrar este mensaje? No se puede deshacer.')) return;
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    await fs.deleteDoc(fs.doc(db, 'contactos', c.id));
    this.lista.update((l) => l.filter((x) => x.id !== c.id));
  }

  protected exportar(): void {
    const filas = [
      ['fecha', 'mensaje', 'contacto', 'desde', 'leido'],
      ...this.lista().map((c) => [fechaHoraAr(c.creado), c.mensaje, c.contacto, c.ruta, c.leido ? 'sí' : 'no']),
    ];
    descargar(`contactos-${new Date().toISOString().slice(0, 10)}.csv`, aCsv(filas));
  }
}
