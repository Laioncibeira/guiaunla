import { Routes } from '@angular/router';
import { INDICE } from './core/datos';
import { resolverCarrera, resolverCarreraConGrilla } from './core/planes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/inicio').then((m) => m.Inicio),
    title: 'Guía UNLa',
  },
  {
    path: 'carrera',
    loadComponent: () => import('./paginas/carrera').then((m) => m.TuCarrera),
    title: 'Tu carrera · Guía UNLa',
  },
  {
    path: 'carrera/elegir',
    loadComponent: () => import('./paginas/carrera').then((m) => m.ElegirCarrera),
    title: 'Elegí tu carrera · Guía UNLa',
  },
  {
    path: 'carrera/:slug',
    loadComponent: () => import('./paginas/carreras').then((m) => m.DetalleCarrera),
    resolve: { carrera: resolverCarrera },
    title: 'Plan de estudios · Guía UNLa',
  },
  {
    path: 'carrera/:slug/correlatividades',
    loadComponent: () => import('./paginas/grafo').then((m) => m.Grafo),
    resolve: { carrera: resolverCarreraConGrilla },
    title: 'Correlatividades · Guía UNLa',
  },
  // Las rutas viejas siguen andando: hay links compartidos con /carreras.
  { path: 'carreras', redirectTo: 'carrera' },
  { path: 'carreras/:slug', redirectTo: 'carrera/:slug' },
  { path: 'carreras/:slug/correlatividades', redirectTo: 'carrera/:slug/correlatividades' },
  {
    path: 'horarios',
    loadComponent: () => import('./paginas/horarios').then((m) => m.Horarios),
    title: 'Horarios · Guía UNLa',
  },
  {
    path: 'campus',
    loadComponent: () => import('./paginas/otras').then((m) => m.Campus),
    title: 'Campus · Guía UNLa',
  },
  {
    path: 'novedades',
    loadComponent: () => import('./paginas/novedades').then((m) => m.PaginaNovedades),
    title: 'Novedades · Guía UNLa',
  },
  {
    path: 'fechas',
    loadComponent: () => import('./paginas/otras').then((m) => m.Fechas),
    title: 'Fechas · Guía UNLa',
  },
  {
    // El panel no se pre-genera ni aparece en la barra: se entra por URL.
    path: 'admin',
    loadChildren: () => import('./paginas/admin/rutas').then((m) => m.ADMIN_RUTAS),
    title: 'Administración · Guía UNLa',
  },
  {
    path: '**',
    loadComponent: () => import('./paginas/otras').then((m) => m.NoEncontrado),
    title: 'No encontrado · Guía UNLa',
  },
];

/** Rutas con parámetro que hay que pre-generar: una página por carrera. */
export const slugsDeCarreras = INDICE.map((c) => c.slug);
