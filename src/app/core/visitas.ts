import { inject, Injectable } from '@angular/core';
import { Nube } from './firebase';
import { claveDeRuta, diaUtc } from './visitas-clave';

/**
 * Contador de visitas por pantalla y por día. Sin cookies, sin identificador
 * de nadie: un documento por día y pantalla que sólo sabe sumar uno.
 * Es orientativo, no auditable, y así está pensado.
 */
@Injectable({ providedIn: 'root' })
export class Visitas {
  private readonly nube = inject(Nube);

  registrar(url: string): void {
    if (!this.nube.disponible) return;
    const clave = claveDeRuta(url);
    if (!clave) return;
    // Una vez por pantalla por sesión del navegador: recargar no cuenta de nuevo.
    const marca = 'guiaunla.visita.' + clave;
    try {
      if (sessionStorage.getItem(marca)) return;
      sessionStorage.setItem(marca, '1');
    } catch {
      /* sin sessionStorage se cuenta igual */
    }
    const tarea = () => this.sumar(clave).catch(() => undefined);
    if ('requestIdleCallback' in window) window.requestIdleCallback(tarea, { timeout: 4000 });
    else setTimeout(tarea, 1500);
  }

  private async sumar(clave: string): Promise<void> {
    const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')]);
    const dia = diaUtc();
    await fs.setDoc(fs.doc(db, 'visitas', `${dia}_${clave}`), { dia, ruta: clave, n: fs.increment(1) }, { merge: true });
  }
}
