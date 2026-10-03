import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { APP_CHECK_CLAVE, FIREBASE } from './firebase-config';

/** El SDK de Firestore, para usar sus funciones sin importarlo al inicio. */
export type SdkFirestore = typeof import('firebase/firestore');

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
    this.app ??= import('firebase/app').then(async ({ getApps, initializeApp }) => {
      const existente = getApps()[0];
      if (existente) return existente;
      const app = initializeApp(FIREBASE);
      // App Check va antes que Firestore y Auth, para que sus pedidos ya
      // salgan con la constancia de que vienen de esta app.
      if (APP_CHECK_CLAVE) {
        const ac = await import('firebase/app-check');
        // En desarrollo no hay reCAPTCHA para localhost: Firebase imprime en
        // la consola un token de depuración que se registra una vez.
        if (isDevMode()) (self as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        ac.initializeAppCheck(app, {
          provider: new ac.ReCaptchaV3Provider(APP_CHECK_CLAVE),
          isTokenAutoRefreshEnabled: true,
        });
      }
      return app;
    });
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

  /** Firestore y las funciones de su SDK juntos, que es como se usan siempre. */
  async conFirestore(): Promise<{ db: Firestore; fs: SdkFirestore }> {
    const [db, fs] = await Promise.all([this.firestore(), import('firebase/firestore')]);
    return { db, fs };
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

/**
 * Un Timestamp de Firestore como `Date`. Si el campo falta o todavía no tiene
 * valor (un `serverTimestamp()` recién escrito, sin confirmar), `siFalta`.
 */
export function aFecha(valor: unknown, siFalta: Date): Date {
  const t = valor as { toDate?: () => Date } | null | undefined;
  return typeof t?.toDate === 'function' ? t.toDate() : siFalta;
}
