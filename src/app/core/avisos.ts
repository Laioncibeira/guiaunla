import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { Nube } from './firebase';
import { VAPID_PUBLICA } from './firebase-config';

/**
 * Avisos al teléfono cuando se publica una novedad (Web Push).
 *
 * El navegador pide permiso una sola vez; la suscripción (una URL y dos
 * claves que sólo sirven para este teléfono) se guarda en Firestore y la
 * función `avisarNovedad` la usa para mandar el aviso. No lleva nombre ni
 * dato de nadie: es un buzón.
 *
 * En iPhone sólo funciona con la app agregada al inicio (iOS 16.4 o más).
 */
export type EstadoAvisos =
  | 'cargando'
  | 'sin-soporte'
  | 'ios-sin-instalar'
  | 'listo'
  | 'pidiendo'
  | 'suscripto'
  | 'bloqueado'
  | 'error';

const CLAVE = 'guiaunla.avisos';

@Injectable({ providedIn: 'root' })
export class Avisos {
  private readonly nube = inject(Nube);
  private readonly push = inject(SwPush);
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  readonly estado = signal<EstadoAvisos>('cargando');

  /** Mira qué puede hacer este navegador. Se llama después del primer dibujo. */
  revisar(): void {
    if (!this.enNavegador) return;
    const soporta = 'Notification' in window && 'PushManager' in window && this.push.isEnabled;
    if (!soporta) {
      this.estado.set(this.esIphoneSinInstalar() ? 'ios-sin-instalar' : 'sin-soporte');
      return;
    }
    if (Notification.permission === 'denied') {
      this.estado.set('bloqueado');
      return;
    }
    let guardada = false;
    try {
      guardada = localStorage.getItem(CLAVE) === '1';
    } catch {
      /* sin localStorage se vuelve a ofrecer */
    }
    this.estado.set(guardada && Notification.permission === 'granted' ? 'suscripto' : 'listo');
  }

  async suscribir(carrera: string | null): Promise<void> {
    if (this.estado() !== 'listo') return;
    this.estado.set('pidiendo');
    try {
      const sub = await this.push.requestSubscription({ serverPublicKey: VAPID_PUBLICA });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys) throw new Error('suscripción incompleta');
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const id = await huella(json.endpoint);
      await fs.setDoc(fs.doc(db, 'suscripciones', id), {
        endpoint: json.endpoint,
        p256dh: json.keys['p256dh'],
        auth: json.keys['auth'],
        carrera: carrera ?? '',
        creada: fs.serverTimestamp(),
      });
      try {
        localStorage.setItem(CLAVE, '1');
      } catch {
        /* igual quedó suscripto */
      }
      this.estado.set('suscripto');
    } catch {
      this.estado.set(Notification.permission === 'denied' ? 'bloqueado' : 'error');
    }
  }

  /** Safari en iPhone sólo permite avisos con la app en el inicio. */
  private esIphoneSinInstalar(): boolean {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua);
    const instalada = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
    return ios && !instalada;
  }
}

/** Un id estable por endpoint, así volver a suscribirse pisa el mismo documento. */
async function huella(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}
