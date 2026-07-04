import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión | UCAB-Services',
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard | UCAB-Services',
    canActivate: [authGuard],
  },
  {
    path: 'miembros',
    loadComponent: () =>
      import('./pages/miembros/miembros.component').then((m) => m.MiembrosComponent),
    title: 'Gestión de Miembros | UCAB-Services',
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
    title: 'Catálogo de Servicios | UCAB-Services',
    canActivate: [authGuard],
  },
  {
    path: 'edificaciones',
    loadComponent: () =>
      import('./pages/edificaciones/edificaciones.component').then((m) => m.EdificacionesComponent),
    title: 'Gestión de Edificaciones | UCAB-Services',
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'espacios',
    loadComponent: () =>
      import('./pages/espacios-fisicos/espacios-fisicos.component').then((m) => m.EspaciosFisicosComponent),
    title: 'Gestión de Espacios Físicos | UCAB-Services',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

