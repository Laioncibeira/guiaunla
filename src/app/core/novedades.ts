import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Nube } from './firebase';

export interface Novedad {
  readonly id: string;
  readonly titulo: string;
  readonly cuerpo: string;
  /** Fecha elegida por quien la escribió, como ISO 'yyyy-mm-dd'. */
  readonly fecha: string;
}

/**
 * Las novedades publicadas, en vivo. Se suscribe una sola vez cuando alguna
 * pantalla las pide; la primera respuesta suele venir de la caché del
 * teléfono (`desdeCache`) y después llega la del servidor.
 */
@Injectable({ providedIn: 'root' })
export class Novedades {
  private readonly nube = inject(Nube);
  private readonly destroy = inject(DestroyRef);

  readonly lista = signal<readonly Novedad[]>([]);
  readonly estado = signal<'inicial' | 'cargando' | 'listo' | 'error'>('inicial');
  readonly desdeCache = signal(false);
  private suscripto = false;

  /** Empieza a escuchar. Llamarla varias veces no duplica nada. */
  escuchar(): void {
    if (this.suscripto || !this.nube.disponible) return;
    this.suscripto = true;
    this.estado.set('cargando');
    (async () => {
      try {
        const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
        const q = fs.query(
          fs.collection(db, 'novedades'),
          fs.where('publicada', '==', true),
          fs.orderBy('fecha', 'desc'),
          fs.limit(50),
        );
        const parar = fs.onSnapshot(
          q,
          { includeMetadataChanges: true },
          (snap) => {
            this.lista.set(
              snap.docs.map((d) => {
                const x = d.data();
                const f = x['fecha'] as { toDate?: () => Date } | undefined;
                const fecha = f?.toDate ? f.toDate() : new Date();
                return {
                  id: d.id,
                  titulo: String(x['titulo'] ?? ''),
                  cuerpo: String(x['cuerpo'] ?? ''),
                  fecha: fecha.toISOString().slice(0, 10),
                };
              }),
            );
            this.desdeCache.set(snap.metadata.fromCache);
            this.estado.set('listo');
          },
          () => this.estado.set('error'),
        );
        this.destroy.onDestroy(parar);
      } catch {
        this.estado.set('error');
      }
    })();
  }
}
