import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
    path: '**',
    redirectTo: 'login',
  },
];

