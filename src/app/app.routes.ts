import { Routes } from '@angular/router';
import { CARRERAS } from './core/datos';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/inicio').then((m) => m.Inicio),
    title: 'Guía UNLa · Humanidades y Artes',
  },
  {
    path: 'carreras',
    loadComponent: () => import('./paginas/carreras').then((m) => m.Carreras),
    title: 'Carreras · Guía UNLa',
  },
  {
    path: 'carreras/:slug',
    loadComponent: () => import('./paginas/carreras').then((m) => m.DetalleCarrera),
    title: 'Plan de estudios · Guía UNLa',
  },
  {
    path: 'carreras/:slug/correlatividades',
    loadComponent: () => import('./paginas/grafo').then((m) => m.Grafo),
    title: 'Correlatividades · Guía UNLa',
  },
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
    path: 'fechas',
    loadComponent: () => import('./paginas/otras').then((m) => m.Fechas),
    title: 'Fechas · Guía UNLa',
  },
  {
    path: '**',
    loadComponent: () => import('./paginas/otras').then((m) => m.NoEncontrado),
    title: 'No encontrado · Guía UNLa',
  },
];

/** Rutas con parámetro que hay que pre-generar: una página por carrera. */
export const slugsDeCarreras = CARRERAS.map((c) => c.slug);
