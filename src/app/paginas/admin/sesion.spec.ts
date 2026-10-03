import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Un Firebase Auth de mentira: guarda el usuario y avisa a quien escucha. */
const auth = {
  currentUser: null as { uid: string; email: string } | null,
  oyentes: [] as ((u: unknown) => void)[],
  authStateReady: async () => undefined,
  cambiar(u: { uid: string; email: string } | null) {
    this.currentUser = u;
    for (const o of this.oyentes) o(u);
  },
};
let admins = new Set<string>();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_a: unknown, cb: (u: unknown) => void) => {
    auth.oyentes.push(cb);
    cb(auth.currentUser);
    return () => undefined;
  },
  signInWithEmailAndPassword: async (_a: unknown, email: string) => {
    auth.cambiar({ uid: 'uid-' + email, email });
    return {};
  },
  signOut: async () => auth.cambiar(null),
}));

import { Nube } from '../../core/firebase';
import { conSesion, Sesion, sinSesion } from './sesion';

class NubeFalsa {
  disponible = true;
  auth = async () => auth;
  conFirestore = async () => ({
    db: {},
    fs: {
      doc: (_db: unknown, _col: string, uid: string) => uid,
      getDoc: async (uid: string) => ({ exists: () => admins.has(uid) }),
    },
  });
}

const routerFalso = { createUrlTree: (partes: string[]) => ({ redireccion: partes.join('/') }) };

function armar() {
  const inj = Injector.create({
    providers: [
      { provide: Nube, useClass: NubeFalsa },
      { provide: Sesion, useClass: Sesion },
      { provide: Router, useValue: routerFalso },
    ],
  });
  const guarda = (g: typeof conSesion) =>
    runInInjectionContext(inj, () => g(null!, null!)) as Promise<boolean | UrlTree>;
  return { sesion: inj.get(Sesion), guarda };
}

describe('Sesion del panel', () => {
  beforeEach(() => {
    auth.currentUser = null;
    auth.oyentes = [];
    admins = new Set(['uid-admin@fei.ar']);
  });

  it('sin sesión, el panel manda al ingreso y el ingreso se muestra', async () => {
    const { guarda } = armar();
    expect(await guarda(conSesion)).toEqual({ redireccion: '/admin/ingreso' });
    expect(await guarda(sinSesion)).toBe(true);
  });

  it('después de entrar, la guarda deja pasar sin recargar la página', async () => {
    const { sesion, guarda } = armar();
    expect(await guarda(sinSesion)).toBe(true);
    expect(await sesion.entrar('admin@fei.ar', 'clave')).toBe('ok');
    expect(await guarda(conSesion)).toBe(true);
    expect(sesion.esAdmin()).toBe(true);
    expect(sesion.usuario()?.email).toBe('admin@fei.ar');
  });

  it('después de salir, vuelve el ingreso en vez de "cuenta no habilitada"', async () => {
    auth.currentUser = { uid: 'uid-admin@fei.ar', email: 'admin@fei.ar' };
    const { sesion, guarda } = armar();
    expect(await guarda(conSesion)).toBe(true);
    await sesion.salir();
    expect(await guarda(sinSesion)).toBe(true);
    expect(await guarda(conSesion)).toEqual({ redireccion: '/admin/ingreso' });
    expect(sesion.esAdmin()).toBe(false);
  });

  it('una cuenta que no está en admins entra pero no queda habilitada', async () => {
    const { sesion, guarda } = armar();
    await sesion.entrar('otra@fei.ar', 'clave');
    expect(await guarda(conSesion)).toBe(true);
    expect(sesion.esAdmin()).toBe(false);
  });
});
