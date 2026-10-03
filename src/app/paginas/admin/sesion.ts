import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Auth, User } from 'firebase/auth';
import { Nube } from '../../core/firebase';

/**
 * La sesión de quien administra. Mail y contraseña, nada más: sin registro
 * (está apagado en Firebase), sin proveedores externos.
 *
 * `usuario` arranca en `undefined` ("todavía no se sabe") para que las guardas
 * esperen la respuesta de Firebase en vez de mandar al login por las dudas.
 */
@Injectable({ providedIn: 'root' })
export class Sesion {
  private readonly nube = inject(Nube);

  readonly usuario = signal<User | null | undefined>(undefined);
  /** Tiene cuenta Y figura en la lista de admins. */
  readonly esAdmin = signal(false);
  private escucha: Promise<Auth> | null = null;
  /** El permiso de admin se pregunta una vez por cuenta, no en cada pantalla. */
  private permiso: {
    readonly uid: string | null;
    readonly esAdmin: Promise<boolean | null>;
  } | null = null;

  /**
   * Espera a que Firebase sepa si hay sesión guardada y devuelve el usuario
   * de ahora. No guarda la primera respuesta: después de entrar o de salir,
   * las guardas tienen que ver el estado nuevo, no el del arranque.
   */
  async listo(): Promise<User | null> {
    if (!this.nube.disponible) return null;
    try {
      const auth = await this.escuchar();
      await auth.authStateReady();
      await this.actualizar(auth.currentUser);
      return auth.currentUser;
    } catch {
      return null;
    }
  }

  /** Se suscribe una sola vez a los cambios: salir en otra pestaña, sesión vencida. */
  private escuchar(): Promise<Auth> {
    this.escucha ??= this.nube.auth().then(async (auth) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      onAuthStateChanged(auth, (u) => void this.actualizar(u));
      return auth;
    });
    return this.escucha;
  }

  /** Deja `usuario` y `esAdmin` al día, sin pantallazo de "cuenta no habilitada". */
  private async actualizar(u: User | null): Promise<void> {
    const uid = u?.uid ?? null;
    if (!this.permiso || this.permiso.uid !== uid) {
      this.permiso = { uid, esAdmin: u ? this.figuraComoAdmin(u.uid) : Promise.resolve(false) };
    }
    const permiso = this.permiso;
    const esAdmin = await permiso.esAdmin;
    // Si mientras tanto cambió la cuenta, esta respuesta ya no vale.
    if (this.permiso !== permiso) return;
    // Sin señal no se pudo preguntar: la próxima vez se vuelve a intentar.
    if (esAdmin === null) this.permiso = null;
    this.usuario.set(u);
    this.esAdmin.set(esAdmin === true);
  }

  async entrar(email: string, clave: string): Promise<'ok' | 'datos' | 'error'> {
    try {
      const [auth, au] = await Promise.all([this.nube.auth(), import('firebase/auth')]);
      await au.signInWithEmailAndPassword(auth, email.trim(), clave);
      return 'ok';
    } catch (e) {
      const codigo = (e as { code?: string }).code ?? '';
      const deDatos = [
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-email',
      ];
      return deDatos.includes(codigo) ? 'datos' : 'error';
    }
  }

  async salir(): Promise<void> {
    const [auth, au] = await Promise.all([this.nube.auth(), import('firebase/auth')]);
    await au.signOut(auth);
  }

  /** Si la cuenta está en `admins`, o null si no se pudo preguntar. */
  private async figuraComoAdmin(uid: string): Promise<boolean | null> {
    try {
      const { db, fs } = await this.nube.conFirestore();
      return (await fs.getDoc(fs.doc(db, 'admins', uid))).exists();
    } catch {
      return null;
    }
  }
}

/** Sólo pasa con sesión iniciada; si no, al ingreso. */
export const conSesion: CanActivateFn = async () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return (await sesion.listo()) ? true : router.createUrlTree(['/admin/ingreso']);
};

/** El ingreso no se muestra a quien ya entró. */
export const sinSesion: CanActivateFn = async () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return (await sesion.listo()) ? router.createUrlTree(['/admin']) : true;
};
