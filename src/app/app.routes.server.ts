import { RenderMode, ServerRoute } from '@angular/ssr';
import { slugsDeCarreras } from './app.routes';

const porCarrera = () => Promise.resolve(slugsDeCarreras.map((slug) => ({ slug })));

/**
 * Todo se pre-genera al compilar: cada carrera y cada mapa de correlatividades
 * quedan como archivos HTML, así abren al instante y Google los indexa.
 */
export const serverRoutes: ServerRoute[] = [
  // El panel de administración vive sólo en el navegador: sin pre-render.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Las rutas viejas redirigen en el navegador; no hay nada que pre-generar.
  { path: 'carreras', renderMode: RenderMode.Client },
  { path: 'carreras/**', renderMode: RenderMode.Client },
  { path: 'carrera/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: porCarrera },
  {
    path: 'carrera/:slug/correlatividades',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: porCarrera,
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
