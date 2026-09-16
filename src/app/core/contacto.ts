import { inject, Injectable } from '@angular/core';
import { Nube } from './firebase';

export const MENSAJE_MIN = 5;
export const MENSAJE_MAX = 300;
export const CONTACTO_MIN = 3;
export const CONTACTO_MAX = 120;
export const NOMBRE_MAX = 80;

/** Cuánto esperar entre dos envíos desde el mismo teléfono. */
const ESPERA_ENTRE_ENVIOS_MS = 60_000;
const CLAVE_ULTIMO = 'guiaunla.contacto.ultimo';

export type ResultadoEnvio = 'enviado' | 'encolado' | 'cerrado' | 'esperar' | 'error';

/**
 * Qué falla en lo que se quiere mandar, o null si está bien.
 * Es la misma validación que aplican las reglas del servidor; acá se avisa
 * antes para no mandar algo que va a rebotar.
 */
export function validar(mensaje: string, contacto: string, nombre = ''): string | null {
  const m = mensaje.trim();
  const c = contacto.trim();
  if (nombre.trim().length > NOMBRE_MAX) return 'El nombre puede tener hasta ' + NOMBRE_MAX + ' caracteres.';
  if (m.length < MENSAJE_MIN) return `Contanos un poco más: al menos ${MENSAJE_MIN} caracteres.`;
  if (m.length > MENSAJE_MAX) return `El mensaje puede tener hasta ${MENSAJE_MAX} caracteres.`;
  if (c.length < CONTACTO_MIN) return 'Dejanos un mail, un Instagram o un teléfono para responderte.';
  if (c.length > CONTACTO_MAX) return `El contacto puede tener hasta ${CONTACTO_MAX} caracteres.`;
  return null;
}

@Injectable({ providedIn: 'root' })
export class Contacto {
  private readonly nube = inject(Nube);

  /** Si el formulario está abierto. Sin conexión o sin dato, se asume que sí. */
  async abierto(): Promise<boolean> {
    if (!this.nube.disponible) return true;
    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const doc = await fs.getDoc(fs.doc(db, 'config', 'contacto'));
      return doc.exists() ? doc.data()['abierto'] !== false : true;
    } catch {
      return true;
    }
  }

  /** Segundos que faltan para poder mandar otro, o 0. */
  esperaRestante(): number {
    try {
      const ultimo = Number(localStorage.getItem(CLAVE_ULTIMO) ?? 0);
      return Math.max(0, Math.ceil((ultimo + ESPERA_ENTRE_ENVIOS_MS - Date.now()) / 1000));
    } catch {
      return 0;
    }
  }

  async enviar(mensaje: string, contacto: string, nombre: string, ruta: string): Promise<ResultadoEnvio> {
    if (!this.nube.disponible) return 'error';
    if (this.esperaRestante() > 0) return 'esperar';
    if (!(await this.abierto())) return 'cerrado';

    try {
      const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
      const escritura = fs.addDoc(fs.collection(db, 'contactos'), {
        mensaje: mensaje.trim(),
        contacto: contacto.trim(),
        // El nombre es optativo: si no lo ponen, el campo no viaja.
        ...(nombre.trim() ? { nombre: nombre.trim() } : {}),
        ruta: ruta.slice(0, 60),
        creado: fs.serverTimestamp(),
      });
      // Con caché persistente, addDoc no resuelve hasta que el servidor
      // confirma. Sin señal quedaría esperando: pasado un rato se da por
      // encolado y se manda solo cuando vuelva la conexión.
      const resultado = await Promise.race<ResultadoEnvio>([
        escritura.then(() => 'enviado' as const),
        new Promise<ResultadoEnvio>((r) => setTimeout(() => r('encolado'), 4000)),
      ]);
      this.marcarEnvio();
      return resultado;
    } catch (e) {
      const codigo = (e as { code?: string }).code ?? '';
      return codigo === 'permission-denied' ? 'cerrado' : 'error';
    }
  }

  private marcarEnvio(): void {
    try {
      localStorage.setItem(CLAVE_ULTIMO, String(Date.now()));
    } catch {
      /* sin guardado: la espera vale sólo en memoria */
    }
  }
}
