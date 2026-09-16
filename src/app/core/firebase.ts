import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FIREBASE } from './firebase-config';

/**
 * La puerta a Firebase. Única pieza de la app que importa el SDK, y lo hace
 * con `import()` dentro de las funciones: así Firestore y Auth quedan en
 * chunks aparte que sólo bajan cuando una pantalla los pide, y nunca entran
 * al pre-render (donde no hay navegador ni IndexedDB).
 *
 * Los `import type` de arriba se borran al compilar; no arrastran nada.
 */
@Injectable({ providedIn: 'root' })
export class Nube {
  /** En el pre-render no hay navegador: nada de esto se puede usar. */
  readonly disponible = isPlatformBrowser(inject(PLATFORM_ID));

  private app: Promise<import('firebase/app').FirebaseApp> | null = null;
  private db: Promise<Firestore> | null = null;
  private sesion: Promise<Auth> | null = null;

  private async aplicacion() {
    if (!this.disponible) throw new Error('Firebase sólo se usa en el navegador');
    this.app ??= import('firebase/app').then(({ getApps, initializeApp }) =>
      getApps()[0] ?? initializeApp(FIREBASE),
    );
    return this.app;
  }

  /**
   * Firestore con caché persistente: lo que se leyó una vez queda en el
   * teléfono y se muestra aunque no haya señal.
   */
  firestore(): Promise<Firestore> {
    this.db ??= (async () => {
      const [app, fs] = await Promise.all([this.aplicacion(), import('firebase/firestore')]);
      try {
        return fs.initializeFirestore(app, {
          localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
        });
      } catch {
        // Ya inicializado (recarga en caliente) o navegador sin IndexedDB.
        return fs.getFirestore(app);
      }
    })();
    return this.db;
  }

  /** Auth sólo con mail y contraseña: sin popups ni redirecciones. */
  auth(): Promise<Auth> {
    this.sesion ??= (async () => {
      const [app, au] = await Promise.all([this.aplicacion(), import('firebase/auth')]);
      try {
        return au.initializeAuth(app, {
          persistence: [au.indexedDBLocalPersistence, au.browserLocalPersistence],
        });
      } catch {
        return au.getAuth(app);
      }
    })();
    return this.sesion;
  }
}
