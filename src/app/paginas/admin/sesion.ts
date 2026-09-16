import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { User } from 'firebase/auth';
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
  private primeraRespuesta: Promise<User | null> | null = null;

  /** Resuelve cuando Firebase dijo si hay sesión guardada o no. */
  listo(): Promise<User | null> {
    if (!this.nube.disponible) return Promise.resolve(null);
    this.primeraRespuesta ??= new Promise((resolver) => {
      this.nube.auth().then(async (auth) => {
        const { onAuthStateChanged } = await import('firebase/auth');
        onAuthStateChanged(auth, async (u) => {
          this.usuario.set(u);
          this.esAdmin.set(u ? await this.figuraComoAdmin(u.uid) : false);
          resolver(u);
        });
      }, () => resolver(null));
    });
    return this.primeraRespuesta;
  }

  async entrar(email: string, clave: string): Promise<'ok' | 'datos' | 'error'> {
    try {
      const [auth, au] = await Promise.all([this.nube.auth(), import('firebase/auth')]);
      await au.signInWithEmailAndPassword(auth, email.trim(), clave);
      return 'ok';
    } catch (e) {
      const codigo = (e as { code?: string }).code ?? '';
      const deDatos = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
      return deDatos.includes(codigo) ? 'datos' : 'error';
    }
  }

  async salir(): Promise<void> {
    const [auth, au] = await Promise.all([this.nube.auth(), import('firebase/auth')]);
    await au.signOut(auth);
  }

  private async figuraComoAdmin(uid: string): Promise<boolean> {
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      return (await fs.getDoc(fs.doc(db, 'admins', uid))).exists();
    } catch {
      return false;
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
