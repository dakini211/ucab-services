import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  DashboardService,
  DashboardStats,
  ActividadReciente,
  UserProfile,
} from '../../services/dashboard.service';

/* ── Nav item model ─────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string; // SVG path data
}

/* ── Component ──────────────────────────────────────────── */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /* ── State ─────────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading = signal(true);
  currentRoute = signal('inicio');

  /* ── Data ──────────────────────────────────────────────── */
  user = signal<UserProfile | null>(null);
  stats = signal<DashboardStats>({
    totalMiembros: 0,
    totalServicios: 0,
    solicitudesActivas: 0,
    pagosPendientes: 0,
  });
  actividad = signal<ActividadReciente[]>([]);
  notificacionesCount = signal(0);
  currentDateTime = signal('');

  /* ── Navigation items ───────────────────────────────────── */
  readonly navItems: NavItem[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      route: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      id: 'perfil',
      label: 'Mi perfil',
      route: '/perfil',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      id: 'miembros',
      label: 'Miembros',
      route: '/miembros',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      id: 'edificaciones',
      label: 'Edificaciones',
      route: '/edificaciones',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      id: 'espacios',
      label: 'Espacios físicos',
      route: '/espacios',
      icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    },
    {
      id: 'tramites',
      label: 'Trámites y Solicitudes',
      route: '/tramites',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      id: 'servicios',
      label: 'Servicios',
      route: '/servicios',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      id: 'reservaciones',
      label: 'Reservaciones',
      route: '/reservaciones',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      route: '/finanzas',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'reportes',
      label: 'Reportes',
      route: '/reportes',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      route: '/configuracion',
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    },
    {
      id: 'seguridad',
      label: 'Seguridad',
      route: '/seguridad',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
  ];

  /* ── Quick access items ─────────────────────────────────── */
  readonly quickAccessItems = [
    {
      id: 'crear-solicitud',
      label: 'Crear solicitud',
      route: '/tramites/nueva',
      icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      id: 'buscar-miembro',
      label: 'Buscar miembro',
      route: '/miembros/buscar',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
    },
    {
      id: 'reservar-espacio',
      label: 'Reservar espacio',
      route: '/reservaciones/nueva',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      id: 'mis-solicitudes',
      label: 'Mis solicitudes',
      route: '/tramites/mis-solicitudes',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
      id: 'mis-pagos',
      label: 'Mis pagos',
      route: '/finanzas/mis-pagos',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'reportes',
      label: 'Reportes',
      route: '/reportes',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ];

  /* ── Lifecycle ──────────────────────────────────────────── */
  ngOnInit(): void {
    this.setCurrentDateTime();
    this.loadUserFromStorage(); // Carga inmediata desde localStorage
    this.loadDashboardData();   // Después actualiza con datos reales del backend
  }

  /* ── Load user from localStorage immediately ────────────── */
  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        this.user.set({
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          email: parsedUser.email,
          rol: parsedUser.rol ?? 'Miembro',
        });
      } catch {
        // Si falla el parse, quedará null y el backend lo llenará
      }
    }
  }

  /* ── Data loading ───────────────────────────────────────── */
  loadDashboardData(): void {
    this.isLoading.set(true);

    // Load user profile
    this.dashboardService.getUserProfile().subscribe({
      next: (profile) => this.user.set(profile),
    });

    // Load stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });

    // Load recent activity
    this.dashboardService.getActividadReciente().subscribe({
      next: (items) => {
        this.actividad.set(items);
        this.isLoading.set(false);
      },
    });

    // Load notification count
    this.dashboardService.getNotificacionesCount().subscribe({
      next: (res) => this.notificacionesCount.set(res.count),
    });
  }

  /* ── Sidebar ────────────────────────────────────────────── */
  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  /* ── Navigation ─────────────────────────────────────────── */
  navigate(item: NavItem): void {
    const implementedRoutes = ['/dashboard', '/miembros'];
    if (implementedRoutes.includes(item.route)) {
      this.currentRoute.set(item.id);
      this.router.navigate([item.route]);
    } else {
      console.warn(`La ruta ${item.route} aún no está implementada.`);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /* ── Helpers ────────────────────────────────────────────── */
  formatNumber(n: number): string {
    // Venezuelan number format: 1.248
    return n.toLocaleString('es-VE');
  }

  getFirstName(): string {
    const nombre = this.user()?.nombre ?? '';
    return nombre.split(' ')[0];
  }

  getUserInitials(): string {
    const nombre = this.user()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  private setCurrentDateTime(): void {
    const now = new Date();
    const time = now.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const date = now.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    this.currentDateTime.set(`Hoy, ${time} — ${date}`);
  }
}
