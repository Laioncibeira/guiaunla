import { RenderMode, ServerRoute } from '@angular/ssr';
import { slugsDeCarreras } from './app.routes';

const porCarrera = () => Promise.resolve(slugsDeCarreras.map((slug) => ({ slug })));

/**
 * Todo se pre-genera al compilar: cada carrera y cada mapa de correlatividades
 * quedan como archivos HTML, así abren al instante y Google los indexa.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'carreras/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: porCarrera },
  {
    path: 'carreras/:slug/correlatividades',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: porCarrera,
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
