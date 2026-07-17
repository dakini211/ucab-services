import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import {
  ReportesService,
  KpisGenerales, ReporteServicios,
  ReporteInfraestructura, ReporteFinanzas, ReporteOfertas,
  OpcionesFiltro,
} from '../../services/reportes.service';

interface NavItem { id: string; label: string; route: string; icon: string; }
type ReporteTab = 'overview' | 'servicios' | 'infraestructura' | 'finanzas' | 'ofertas';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit, OnDestroy {
  private readonly reportesService = inject(ReportesService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  /* ── State ─────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading = signal(true);
  activeTab = signal<ReporteTab>('overview');
  currentRoute = signal('reportes');
  lastRefresh = signal<Date | null>(null);

  /* ── User ──────────────────────────────────────────── */
  userName = signal('Usuario');
  userEmail = signal('');
  userInitials = signal('US');
  userRol = signal('');

  /* ── Data signals ───────────────────────────────────── */
  kpis = signal<KpisGenerales | null>(null);
  servicios = signal<ReporteServicios | null>(null);
  infraestructura = signal<ReporteInfraestructura | null>(null);
  finanzas = signal<ReporteFinanzas | null>(null);
  ofertas = signal<ReporteOfertas | null>(null);
  alertas = signal<string[]>([]);
  opciones = signal<OpcionesFiltro | null>(null);

  /* ── Filtros por pestaña ────────────────────────────── */
  filtroServiciosEstado = signal('');
  filtroServiciosDesde = signal('');
  filtroServiciosHasta = signal('');

  filtroInfraTipo = signal('');
  filtroInfraEdificacion = signal('');

  filtroFinanzasEstado = signal('');
  filtroFinanzasDesde = signal('');
  filtroFinanzasHasta = signal('');
  filtroFinanzasMoneda = signal('');

  filtroOfertasEstatus = signal('');
  filtroOfertasEntidad = signal('');

  hasFiltrosServicios = computed(() =>
    !!(this.filtroServiciosEstado() || this.filtroServiciosDesde() || this.filtroServiciosHasta())
  );
  hasFiltrosInfra = computed(() => !!(this.filtroInfraTipo() || this.filtroInfraEdificacion()));
  hasFiltrosFinanzas = computed(() =>
    !!(this.filtroFinanzasEstado() || this.filtroFinanzasDesde() || this.filtroFinanzasHasta() || this.filtroFinanzasMoneda())
  );
  hasFiltrosOfertas = computed(() => !!(this.filtroOfertasEstatus() || this.filtroOfertasEntidad()));

  /* ── Computed KPIs para cards ──────────────────────── */
  totalMiembros = computed(() => this.kpis()?.totalMiembros ?? 0);
  totalServicios = computed(() => this.servicios()?.totalServicios ?? 0);
  totalBeneficiarios = computed(() => this.kpis()?.beneficiarios.total ?? 0);
  saldoTotal = computed(() => this.finanzas()?.billeteras.saldoTotal ?? 0);
  totalOfertas = computed(() => this.ofertas()?.totalOfertas ?? 0);
  solicitudesPendientes = computed(() =>
    this.servicios()?.solicitudesPorEstado.find(e => e.estado === 'pendiente')?.total ?? 0
  );

  /* ── Nav ────────────────────────────────────────────── */
  readonly navItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', route: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'perfil', label: 'Mi perfil', route: '/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'miembros', label: 'Miembros', route: '/miembros', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'edificaciones', label: 'Edificaciones', route: '/edificaciones', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'espacios', label: 'Espacios físicos', route: '/espacios', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'servicios', label: 'Servicios', route: '/catalogo', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'ofertas-laborales', label: 'Ofertas Laborales', route: '/ofertas-laborales', icon: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5zm10 13H4V9h16v9z' },
    { id: 'finanzas', label: 'Finanzas', route: '/finanzas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'reportes', label: 'Reportes', route: '/reportes', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  /* ── Lifecycle ──────────────────────────────────────── */
  ngOnInit(): void {
    this.loadUserFromStorage();
    this.loadAllReports();
    this.reportesService.getOpcionesFiltro()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (o) => this.opciones.set(o) });
    this.reportesService.getResumenCompleto()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (r) => this.alertas.set(r.alertas) });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── Load user ─────────────────────────────────────── */
  private loadUserFromStorage(): void {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        this.userName.set(u.nombre ?? 'Usuario');
        this.userEmail.set(u.email ?? '');
        this.userRol.set(u.rol ?? '');
        const initials = (u.nombre ?? 'U')
          .split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
        this.userInitials.set(initials);
      } catch { /* empty */ }
    }
  }

  /* ── Load all reports in parallel ──────────────────── */
  loadAllReports(): void {
    this.isLoading.set(true);
    this.reportesService.getTodosLosReportes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.kpis.set(data.kpis);
          this.servicios.set(data.servicios);
          this.infraestructura.set(data.infraestructura);
          this.finanzas.set(data.finanzas);
          this.ofertas.set(data.ofertas);
          this.lastRefresh.set(new Date());
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  /* ── Filtros: aplicar / limpiar por pestaña ────────── */
  aplicarFiltrosServicios(): void {
    this.reportesService.getServicios({
      estado: this.filtroServiciosEstado() || undefined,
      desde: this.filtroServiciosDesde() || undefined,
      hasta: this.filtroServiciosHasta() || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({ next: (r) => this.servicios.set(r) });
  }

  limpiarFiltrosServicios(): void {
    this.filtroServiciosEstado.set('');
    this.filtroServiciosDesde.set('');
    this.filtroServiciosHasta.set('');
    this.aplicarFiltrosServicios();
  }

  aplicarFiltrosInfra(): void {
    this.reportesService.getInfraestructura({
      tipo: this.filtroInfraTipo() || undefined,
      edificacion: this.filtroInfraEdificacion() || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({ next: (r) => this.infraestructura.set(r) });
  }

  limpiarFiltrosInfra(): void {
    this.filtroInfraTipo.set('');
    this.filtroInfraEdificacion.set('');
    this.aplicarFiltrosInfra();
  }

  aplicarFiltrosFinanzas(): void {
    this.reportesService.getFinanzas({
      estado: this.filtroFinanzasEstado() || undefined,
      desde: this.filtroFinanzasDesde() || undefined,
      hasta: this.filtroFinanzasHasta() || undefined,
      moneda: this.filtroFinanzasMoneda() || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({ next: (r) => this.finanzas.set(r) });
  }

  limpiarFiltrosFinanzas(): void {
    this.filtroFinanzasEstado.set('');
    this.filtroFinanzasDesde.set('');
    this.filtroFinanzasHasta.set('');
    this.filtroFinanzasMoneda.set('');
    this.aplicarFiltrosFinanzas();
  }

  aplicarFiltrosOfertas(): void {
    this.reportesService.getOfertasLaborales({
      estatus: this.filtroOfertasEstatus() || undefined,
      entidad: this.filtroOfertasEntidad() || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({ next: (r) => this.ofertas.set(r) });
  }

  limpiarFiltrosOfertas(): void {
    this.filtroOfertasEstatus.set('');
    this.filtroOfertasEntidad.set('');
    this.aplicarFiltrosOfertas();
  }

  /* ── Helpers ────────────────────────────────────────── */
  setTab(tab: ReporteTab): void { this.activeTab.set(tab); }

  getTotalSolicitudes(): number {
    return this.servicios()?.solicitudesPorEstado.reduce((acc, curr) => acc + curr.total, 0) ?? 0;
  }

  getBarWidth(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(value);
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = {
      activa: '#22C55E', suspendida: '#F59E0B', bloqueada: '#EF4444',
      pendiente: '#F59E0B', aprobada: '#22C55E', rechazada: '#EF4444',
      disponible: '#22C55E', no_disponible: '#EF4444', mantenimiento: '#F59E0B',
      operativo: '#22C55E', completada: '#3B82F6',
    };
    return map[estado] ?? '#6B7A99';
  }

  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }

  navigate(item: NavItem): void {
    this.router.navigate([item.route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


