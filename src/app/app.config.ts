import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Cambiar de pantalla lleva arriba; volver atrás recupera dónde estabas.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    // Sin hidratación incremental (la app no usa `@defer (hydrate ...)`): así
    // Angular no mete scripts inline en el HTML, que la CSP de firebase.json
    // bloquea con razón (`script-src 'self'`).
    provideClientHydration(withNoIncrementalHydration()),
    // La app queda guardada en el teléfono: abre sin señal, que en el campus pasa.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
