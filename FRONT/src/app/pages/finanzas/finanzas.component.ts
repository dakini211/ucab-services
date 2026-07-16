import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  FinanzasService, Folio, Factura, DetalleFactura, FinanzasStats,
  FolioKey, RegistrarPagoDto
} from '../../services/finanzas.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'folios' | 'facturas';
type ModalMode = 'detalle' | 'pago' | 'cierre' | null;

interface NavItem {
  id: string; label: string; route: string; icon: string;
}

interface Columna {
  campo: string; titulo: string; ordenable: boolean; money: boolean;
}

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './finanzas.component.html',
  styleUrl: './finanzas.component.scss',
})
export class FinanzasComponent implements OnInit, OnDestroy {
  private readonly finanzasService = inject(FinanzasService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  /* ── UI State ───────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  modalMode = signal<ModalMode>(null);
  currentRoute = signal('finanzas');
  tab = signal<Tab>('folios');

  /* ── Data ──────────────────────────────────────────────── */
  folios = signal<Folio[]>([]);
  facturas = signal<Factura[]>([]);
  detalle = signal<DetalleFactura | null>(null);
  stats = signal<FinanzasStats | null>(null);

  total = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchQuery = signal('');
  filterEstado = signal('todos');
  sortBy = signal('fecha_inicio_mes');
  order = signal<'asc' | 'desc'>('desc');

  /* ── Feedback ──────────────────────────────────────────── */
  formError = signal('');
  formSuccess = signal('');

  /* ── Cierre masivo ─────────────────────────────────────── */
  mesCierre = signal(new Date().toISOString().slice(0, 7));

  /* ── Formulario de abono ───────────────────────────────── */
  pago = signal<RegistrarPagoDto>({ numero_de_control: '', monto: 0, tipo: 'zelle' });

  /* ── User ──────────────────────────────────────────────── */
  userName = signal('Usuario');
  userEmail = signal('');
  userInitials = signal('US');
  userRol = signal('Miembro');
  canEdit = signal(false);

  /* ── Nav ───────────────────────────────────────────────── */
  readonly navItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', route: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'perfil', label: 'Mi perfil', route: '/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'miembros', label: 'Miembros', route: '/miembros', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'edificaciones', label: 'Edificaciones', route: '/edificaciones', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'espacios', label: 'Espacios físicos', route: '/espacios', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'tramites', label: 'Trámites y Solicitudes', route: '/tramites', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'servicios', label: 'Servicios', route: '/catalogo', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'finanzas', label: 'Finanzas', route: '/finanzas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'reportes', label: 'Reportes', route: '/reportes', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  /* ── Columnas por pestaña ──────────────────────────────── */
  readonly columnasFolios: Columna[] = [
    { campo: 'nro_de_folio', titulo: 'N.º de folio', ordenable: true, money: false },
    { campo: 'miembro', titulo: 'Miembro', ordenable: true, money: false },
    { campo: 'nombre_servicio', titulo: 'Servicio', ordenable: true, money: false },
    { campo: 'fecha_inicio_mes', titulo: 'Período', ordenable: true, money: false },
    { campo: 'cantidad_items', titulo: 'Ítems', ordenable: false, money: true },
    { campo: 'total', titulo: 'Total', ordenable: true, money: true },
    { campo: 'estado', titulo: 'Estado', ordenable: true, money: false },
  ];

  readonly columnasFacturas: Columna[] = [
    { campo: 'numero_de_control', titulo: 'N.º de control', ordenable: true, money: false },
    { campo: 'miembro', titulo: 'Miembro', ordenable: true, money: false },
    { campo: 'nombre_servicio', titulo: 'Servicio', ordenable: true, money: false },
    { campo: 'fecha_de_emision', titulo: 'Emisión', ordenable: true, money: false },
    { campo: 'total', titulo: 'Total', ordenable: false, money: true },
    { campo: 'pagado', titulo: 'Pagado', ordenable: false, money: true },
    { campo: 'saldo', titulo: 'Saldo', ordenable: true, money: true },
    { campo: 'estatus', titulo: 'Estatus', ordenable: true, money: false },
  ];

  columnas = computed(() =>
    this.tab() === 'folios' ? this.columnasFolios : this.columnasFacturas
  );

  desde = computed(() =>
    this.total() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  hasta = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.total())
  );

  porcentajePagado = computed(() => {
    const d = this.detalle();
    if (!d || !d.factura.total) return 0;
    return Math.min(100, (d.factura.pagado / d.factura.total) * 100);
  });

  /* ── Ciclo de vida ─────────────────────────────────────── */
  ngOnInit(): void {
    this.cargarUsuario();

    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((texto) => {
        this.searchQuery.set(texto);
        this.currentPage.set(1);
        this.cargar();
      });

    this.cargarStats();
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarUsuario(): void {
    const raw = sessionStorage.getItem('user');
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      const nombre = u.nombre ?? u.primer_nombre ?? 'Usuario';
      this.userName.set(nombre);
      this.userEmail.set(u.email ?? u.correo_institucional ?? '');
      this.userRol.set(u.rol ?? 'Miembro');
      this.userInitials.set(
        nombre
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      );
      // Validar si el usuario tiene rol Admin o Administrativo para ciertas acciones
      this.canEdit.set(u.rol === 'Admin' || u.rol === 'Administrativo');
    } catch { }
  }

  /* ── Carga de datos ────────────────────────────────────── */
  cargarStats(): void {
    this.finanzasService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (s) => this.stats.set(s),
        error: () => this.stats.set(null),
      });
  }

  cargar(): void {
    this.isLoading.set(true);
    this.formError.set('');

    const params = {
      search: this.searchQuery(),
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
    };

    if (this.tab() === 'folios') {
      this.finanzasService.getFolios({ ...params, estado: this.filterEstado() })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            this.folios.set(r.data);
            this.total.set(r.total);
            this.totalPages.set(r.totalPages);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.formError.set(this.mensajeDeError(err, 'No se pudo cargar el listado de folios.'));
            this.isLoading.set(false);
          },
        });
    } else {
      this.finanzasService.getFacturas({ ...params, estatus: this.filterEstado() })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            this.facturas.set(r.data);
            this.total.set(r.total);
            this.totalPages.set(r.totalPages);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.formError.set(this.mensajeDeError(err, 'No se pudo cargar el listado de facturas.'));
            this.isLoading.set(false);
          },
        });
    }
  }

  /* ── Pestañas ──────────────────────────────────────────── */
  cambiarTab(t: Tab): void {
    if (this.tab() === t) return;
    this.tab.set(t);
    this.currentPage.set(1);
    this.searchQuery.set('');
    this.filterEstado.set('todos');
    this.sortBy.set(t === 'folios' ? 'fecha_inicio_mes' : 'fecha_de_emision');
    this.order.set('desc');
    this.cargar();
  }

  /* ── Búsqueda, filtros, orden, paginado ────────────────── */
  onSearch(texto: string): void { this.searchSubject.next(texto); }

  onFiltrarEstado(valor: string): void {
    this.filterEstado.set(valor);
    this.currentPage.set(1);
    this.cargar();
  }

  onCambiarPageSize(valor: number): void {
    this.pageSize.set(Number(valor));
    this.currentPage.set(1);
    this.cargar();
  }

  /** Un click ordena ascendente; el segundo sobre la misma columna invierte. */
  ordenarPor(col: Columna): void {
    if (!col.ordenable) return;
    if (this.sortBy() === col.campo) {
      this.order.set(this.order() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(col.campo);
      this.order.set('asc');
    }
    this.currentPage.set(1);
    this.cargar();
  }

  irA(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.cargar();
  }

  flecha(campo: string): string {
    if (this.sortBy() !== campo) return '↕';
    return this.order() === 'asc' ? '↑' : '↓';
  }

  ariaSort(campo: string): string {
    if (this.sortBy() !== campo) return 'none';
    return this.order() === 'asc' ? 'ascending' : 'descending';
  }

  /* ── Acciones del folio ────────────────────────────────── */
  facturar(f: Folio): void {
    this.isSaving.set(true);
    this.formError.set('');

    const key: FolioKey = {
      id_miembro: f.id_miembro,
      id_servicio: f.id_servicio,
      fecha_de_creacion: f.fecha_de_creacion,
      nro_de_folio: f.nro_de_folio,
    };

    this.finanzasService.facturarFolio(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r) => {
          this.isSaving.set(false);
          this.formSuccess.set(`Factura ${r.numero_de_control} emitida por ${r.saldo.toFixed(2)}.`);
          setTimeout(() => this.formSuccess.set(''), 4000);
          this.cargarStats();
          this.cargar();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.formError.set(this.mensajeDeError(err, 'No se pudo emitir la factura.'));
        },
      });
  }

  abrirModalCierre(): void {
    this.formError.set('');
    this.formSuccess.set('');
    this.modalMode.set('cierre');
  }

  /** Cierre masivo mensual: regla pág. 7 del enunciado. */
  ejecutarCierre(): void {
    this.isSaving.set(true);
    this.formError.set('');

    // El input type="month" entrega 'YYYY-MM'; el procedimiento espera una fecha.
    const mes = this.mesCierre() ? `${this.mesCierre()}-01` : null;

    this.finanzasService.cierreMasivo(mes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r) => {
          this.isSaving.set(false);
          this.formSuccess.set(r.mensaje);
          this.cargarStats();
          this.cargar();
          setTimeout(() => this.closeModal(), 2500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.formError.set(this.mensajeDeError(err, 'No se pudo ejecutar el cierre masivo.'));
        },
      });
  }

  /* ── Detalle de factura ────────────────────────────────── */
  verDetalle(numero: string): void {
    this.formError.set('');
    this.detalle.set(null);
    this.modalMode.set('detalle');

    this.finanzasService.getFactura(numero)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => this.detalle.set(d),
        error: (err) => this.formError.set(this.mensajeDeError(err, 'No se pudo cargar la factura.')),
      });
  }

  verDetalleDeFolio(f: Folio): void {
    if (f.numero_de_control) this.verDetalle(f.numero_de_control);
  }

  /* ── Registro de abonos ────────────────────────────────── */
  abrirModalPago(): void {
    const d = this.detalle();
    if (!d) return;
    this.formError.set('');
    this.formSuccess.set('');
    this.pago.set({
      numero_de_control: d.factura.numero_de_control,
      monto: 0,
      tipo: 'zelle',
    });
    this.modalMode.set('pago');
  }

  actualizarPago<K extends keyof RegistrarPagoDto>(campo: K, valor: RegistrarPagoDto[K]): void {
    this.pago.update((p) => ({ ...p, [campo]: valor }));
  }

  pagarTodo(): void {
    const d = this.detalle();
    if (d) this.actualizarPago('monto', d.factura.saldo);
  }

  puedeRegistrar(): boolean {
    const p = this.pago();
    return !!p.monto && p.monto > 0 && !!p.tipo;
  }

  registrarPago(): void {
    this.isSaving.set(true);
    this.formError.set('');

    const numero = this.pago().numero_de_control;

    this.finanzasService.registrarPago(this.pago())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r) => {
          this.isSaving.set(false);
          // El estatus lo decidió el trigger en la base de datos, no el front.
          this.formSuccess.set(r.mensaje);
          this.cargarStats();
          this.cargar();
          setTimeout(() => {
            this.formSuccess.set('');
            this.verDetalle(numero);
          }, 1600);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.formError.set(this.mensajeDeError(err, 'No se pudo registrar el abono.'));
        },
      });
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.detalle.set(null);
    this.formError.set('');
    this.formSuccess.set('');
  }

  /**
   * Los errores llegan de dos sitios distintos:
   *   - ValidationPipe  -> { message: string[] }
   *   - PL/pgSQL vía PrismaExceptionFilter -> { error: string }
   */
  private mensajeDeError(err: any, porDefecto: string): string {
    const e = err?.error;
    if (Array.isArray(e?.message)) return e.message.join('. ');
    return e?.error ?? e?.message ?? porDefecto;
  }

  /* ── Sidebar & Nav ─────────────────────────────────────── */
  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }

  navigate(item: NavItem): void {
    const implementedRoutes = [
      '/dashboard', '/perfil', '/miembros', '/edificaciones',
      '/catalogo', '/espacios', '/finanzas',
    ];
    if (implementedRoutes.includes(item.route)) {
      this.currentRoute.set(item.id);
      this.router.navigate([item.route]);
    } else {
      console.warn(`La ruta ${item.route} aún no está implementada.`);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /* ── Helpers ───────────────────────────────────────────── */
  getEstadoBadgeClass(valor: string): string {
    switch (valor) {
      case 'pagada':
      case 'facturado': return 'badge-activo';
      case 'parcial':
      case 'abierto': return 'badge-inactivo';
      case 'pendiente': return 'badge-pendiente';
      case 'anulada': return 'badge-bloqueado';
      default: return 'badge-inactivo';
    }
  }

  getEstadoLabel(valor: string): string {
    switch (valor) {
      case 'pagada': return 'Pagada';
      case 'parcial': return 'Parcial';
      case 'pendiente': return 'Pendiente';
      case 'anulada': return 'Anulada';
      case 'abierto': return 'Abierto';
      case 'facturado': return 'Facturado';
      default: return valor;
    }
  }

  trackFolio(_i: number, f: Folio): string { return f.nro_de_folio; }
  trackFactura(_i: number, f: Factura): string { return f.numero_de_control; }
  trackConcepto(_i: number, it: { concepto: string }): string { return it.concepto; }
  trackPago(_i: number, p: { fecha_operacion: string }): string { return p.fecha_operacion; }

  /* ── Borrado (Eliminar Factura/Folio) ─────────────────────────── */
  eliminarFactura(numero: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la factura ${numero}?`)) return;
    this.finanzasService.eliminarFactura(numero).subscribe({
      next: (res) => {
        this.formSuccess.set(res.message || 'Factura eliminada.');
        this.cargar(); // Recarga la tabla
      },
      error: (err) => this.formError.set(err.error?.message || 'Error al eliminar factura.'),
    });
  }

  eliminarFolio(row: Folio): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el folio ${row.nro_de_folio}?`)) return;
    const key: FolioKey = {
      id_miembro: row.id_miembro.toString(),
      id_servicio: Number(row.id_servicio),
      fecha_de_creacion: row.fecha_de_creacion,
      nro_de_folio: row.nro_de_folio
    };
    this.finanzasService.eliminarFolio(key).subscribe({
      next: (res) => {
        this.formSuccess.set(res.message || 'Folio eliminado.');
        this.cargar();
      },
      error: (err) => this.formError.set(err.error?.message || 'Error al eliminar folio.'),
    });
  }
}
