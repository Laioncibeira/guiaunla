import { Routes } from '@angular/router';
import { conSesion, sinSesion } from './sesion';

/**
 * El panel de la agrupación. No aparece en la barra ni se pre-genera: se
 * entra por /admin y pide cuenta.
 */
export const ADMIN_RUTAS: Routes = [
  {
    path: 'ingreso',
    canActivate: [sinSesion],
    loadComponent: () => import('./ingreso').then((m) => m.Ingreso),
    title: 'Ingresar · Guía UNLa',
  },
  {
    path: '',
    canActivate: [conSesion],
    loadComponent: () => import('./panel').then((m) => m.Panel),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contactos' },
      {
        path: 'contactos',
        loadComponent: () => import('./contactos').then((m) => m.AdminContactos),
        title: 'Contactos · Administración',
      },
      {
        path: 'novedades',
        loadComponent: () => import('./novedades').then((m) => m.AdminNovedades),
        title: 'Novedades · Administración',
      },
      {
        path: 'visitas',
        loadComponent: () => import('./visitas').then((m) => m.AdminVisitas),
        title: 'Visitas · Administración',
      },
    ],
  },
];
