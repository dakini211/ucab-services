import {
  Component, OnInit, OnDestroy, inject, signal, computed, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  EspaciosFisicosService,
  EspacioFisico,
  CreateEspacioDto,
  ReservaCalendario
} from '../../services/espacios-fisicos.service';
import { AuthService } from '../../services/auth.service';

type ModalMode = 'ver' | 'registrar' | 'editar' | 'eliminar' | 'reservar' | 'mes' | null;

interface NavItem { id: string; label: string; route: string; icon: string; }

interface CalendarDay {
  date: Date | null;
  day: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-espacios-fisicos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './espacios-fisicos.component.html',
  styleUrl: './espacios-fisicos.component.scss',
})
export class EspaciosFisicosComponent implements OnInit, OnDestroy {
  private readonly espaciosService = inject(EspaciosFisicosService);
  private readonly authService     = inject(AuthService);
  private readonly router          = inject(Router);
  private readonly fb              = inject(FormBuilder);
  private readonly destroy$        = new Subject<void>();
  private readonly searchSubject   = new Subject<string>();

  /* ── UI State ───────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading        = signal(true);
  isSaving         = signal(false);
  modalMode        = signal<ModalMode>(null);
  selectedEspacio  = signal<EspacioFisico | null>(null);
  openMenuId       = signal<number | null>(null);
  currentRoute     = signal('espacios');

  /* ── Data ──────────────────────────────────────────────── */
  espacios    = signal<EspacioFisico[]>([]);
  total       = signal(0);
  totalPages  = signal(0);
  currentPage = signal(1);
  pageSize    = signal(10);

  /* ── Filters ────────────────────────────────────────────── */
  searchQuery      = signal('');
  filterSede       = signal('');
  filterEdificacion = signal('');
  filterTipo       = signal('');
  filterDisponibilidad = signal('');
  sedes            = signal<string[]>([]);
  edificaciones    = signal<string[]>([]);
  tiposEspacio     = signal<string[]>([]);

  /* ── Calendar ────────────────────────────────────────────── */
  calendarMonth    = signal(new Date().getMonth());
  calendarYear     = signal(new Date().getFullYear());
  reservas         = signal<ReservaCalendario[]>([]);
  calendarEspacioNombre = signal('Seleccione un espacio');
  showMesModal     = signal(false);

  /* ── User ──────────────────────────────────────────────── */
  userName     = signal('Usuario');
  userEmail    = signal('');
  userInitials = signal('US');
  isAdmin = signal(false);

  /* ── Form ──────────────────────────────────────────────── */
  espacioForm!: FormGroup;
  reservaForm!: FormGroup;
  formError   = signal('');
  formSuccess = signal('');

  /* ── Nav ────────────────────────────────────────────────── */
  readonly navItems: NavItem[] = [
    { id: 'inicio',       label: 'Inicio',                route: '/dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'perfil',       label: 'Mi perfil',             route: '/perfil',        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'miembros',     label: 'Miembros',              route: '/miembros',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'edificaciones',label: 'Edificaciones',         route: '/edificaciones', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'espacios',     label: 'Espacios físicos',      route: '/espacios',      icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'tramites',     label: 'Trámites y Solicitudes',route: '/tramites',      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'servicios',    label: 'Servicios',             route: '/catalogo',      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'reservaciones',label: 'Reservaciones',         route: '/reservaciones', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'finanzas',     label: 'Finanzas',              route: '/finanzas',      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'reportes',     label: 'Reportes',              route: '/reportes',      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'configuracion',label: 'Configuración',         route: '/configuracion', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: 'seguridad',    label: 'Seguridad',             route: '/seguridad',     icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  /* ── Computed ────────────────────────────────────────────── */
  pages = computed(() => {
    const total = this.totalPages();
    const curr  = this.currentPage();
    const pages: (number | '...')[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (curr > 3) pages.push('...');
      for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) pages.push(i);
      if (curr < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  showingFrom = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  showingTo   = computed(() => Math.min(this.currentPage() * this.pageSize(), this.total()));

  hasActiveFilters = computed(() =>
    !!this.filterSede() || !!this.filterEdificacion() || !!this.filterTipo() || !!this.filterDisponibilidad()
  );

  /** Días del mes actual para el calendario */
  calendarDays = computed<CalendarDay[]>(() => {
    const year  = this.calendarYear();
    const month = this.calendarMonth();
    const firstDay = new Date(year, month, 1).getDay();  // 0=Dom
    // Ajustar para que empiece en Lunes (0=Lun)
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const today       = new Date();

    const days: CalendarDay[] = [];

    // Días del mes anterior
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      days.push({ date: new Date(year, month - 1, d), day: d, isToday: false, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();
      days.push({ date, day: d, isToday, isCurrentMonth: true });
    }

    // Completar hasta 42 celdas (6 semanas)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), day: d, isToday: false, isCurrentMonth: false });
    }

    return days;
  });

  calendarMonthLabel = computed(() => {
    const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${names[this.calendarMonth()]} ${this.calendarYear()}`;
  });

  /** Reservas del día seleccionado (hoy) */
  todayReservas = computed(() => {
    const today = new Date().toDateString();
    return this.reservas().filter(r => new Date(r.fecha_inicio).toDateString() === today);
  });

  /** Agrupa todas las reservas del mes por fecha para el modal */
  reservasPorDia = computed(() => {
    const month = this.calendarMonth();
    const year  = this.calendarYear();
    const map = new Map<string, ReservaCalendario[]>();
    this.reservas()
      .filter(r => {
        const d = new Date(r.fecha_inicio);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .forEach(r => {
        const key = new Date(r.fecha_inicio).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      });
    return Array.from(map.entries()).map(([fecha, reservas]) => ({ fecha, reservas }));
  });

  todayLabel = computed(() => {
    return new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  /* ── Lifecycle ──────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadUserFromStorage();
    this.buildForms();
    this.loadFiltrosAuxiliares();
    this.loadEspacios();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadEspacios();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openMenuId.set(null); }

  /* ── User ──────────────────────────────────────────────── */
  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        this.userName.set(u.nombre ?? 'Usuario');
        this.userEmail.set(u.email ?? '');
        this.isAdmin.set(u.rol === 'Administrativo' || u.rol === 'Admin');
        const initials = (u.nombre ?? 'U')
          .split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
        this.userInitials.set(initials);
      } catch { /* empty */ }
    }
  }

  /* ── Forms ─────────────────────────────────────────────── */
  private buildForms(): void {
    this.espacioForm = this.fb.group({
      numero:        ['', Validators.required],
      edificacion:   ['', Validators.required],
      tipo_espacio:  ['', Validators.required],
      capacidad:     [null, [Validators.required, Validators.min(1)]],
      disponibilidad:['Disponible', Validators.required],
      sede:          ['', Validators.required],
      descripcion:   [''],
    });

    this.reservaForm = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_fin:    ['', Validators.required],
      motivo:       ['', Validators.required],
    });
  }

  /* ── Data Loading ───────────────────────────────────────── */
  loadEspacios(): void {
    this.isLoading.set(true);
    this.espaciosService.getAll({
      search:         this.searchQuery()           || undefined,
      sede:           this.filterSede()            || undefined,
      edificacion:    this.filterEdificacion()     || undefined,
      tipo_espacio:   this.filterTipo()            || undefined,
      disponibilidad: this.filterDisponibilidad()  || undefined,
      page:           this.currentPage(),
      limit:          this.pageSize(),
    }).subscribe({
      next: (res) => {
        this.espacios.set(res.data || []);
        this.total.set(res.total || 0);
        this.totalPages.set(res.totalPages || 0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadFiltrosAuxiliares(): void {
    this.espaciosService.getSedes().subscribe({ next: (s) => this.sedes.set(s), error: () => {} });
    this.espaciosService.getEdificaciones().subscribe({ next: (e) => this.edificaciones.set(e), error: () => {} });
    this.espaciosService.getTipos().subscribe({ next: (t) => this.tiposEspacio.set(t), error: () => {} });
  }

  private loadReservas(espacioId: number): void {
    this.espaciosService.getReservas(
      espacioId,
      this.calendarMonth() + 1,
      this.calendarYear()
    ).subscribe({ next: (r) => this.reservas.set(r), error: () => {} });
  }

  /* ── Filters ────────────────────────────────────────────── */
  onSearch(value: string): void { this.searchSubject.next(value); }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadEspacios();
  }

  clearFilters(): void {
    this.filterSede.set('');
    this.filterEdificacion.set('');
    this.filterTipo.set('');
    this.filterDisponibilidad.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadEspacios();
  }

  /* ── Pagination ─────────────────────────────────────────── */
  goToPage(page: number | '...'): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadEspacios();
  }

  prevPage():  void { this.goToPage(this.currentPage() - 1); }
  nextPage():  void { this.goToPage(this.currentPage() + 1); }
  firstPage(): void { this.goToPage(1); }
  lastPage():  void { this.goToPage(this.totalPages()); }

  /* ── Calendar Nav ───────────────────────────────────────── */
  prevMonth(): void {
    if (this.calendarMonth() === 0) {
      this.calendarMonth.set(11);
      this.calendarYear.update(y => y - 1);
    } else {
      this.calendarMonth.update(m => m - 1);
    }
    const e = this.selectedEspacio();
    if (e) this.loadReservas(e.id);
  }

  nextMonth(): void {
    if (this.calendarMonth() === 11) {
      this.calendarMonth.set(0);
      this.calendarYear.update(y => y + 1);
    } else {
      this.calendarMonth.update(m => m + 1);
    }
    const e = this.selectedEspacio();
    if (e) this.loadReservas(e.id);
  }

  /** Verifica si un día tiene reservas */
  hasReservaOnDay(day: CalendarDay): boolean {
    if (!day.date || !day.isCurrentMonth) return false;
    const ds = day.date.toDateString();
    return this.reservas().some(r => new Date(r.fecha_inicio).toDateString() === ds);
  }

  /* ── Kebab Menu ─────────────────────────────────────────── */
  toggleMenu(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  /* ── Modals ─────────────────────────────────────────────── */
  openRegistrar(): void {
    this.espacioForm.reset({ disponibilidad: 'Disponible' });
    this.formError.set('');
    this.formSuccess.set('');
    this.selectedEspacio.set(null);
    this.openMenuId.set(null);
    this.modalMode.set('registrar');
  }

  openVer(e: EspacioFisico): void {
    this.selectedEspacio.set(e);
    this.calendarEspacioNombre.set(`${e.edificacion} (${e.numero})`);
    this.loadReservas(e.id);
    this.openMenuId.set(null);
    this.modalMode.set('ver');
  }

  openEditar(e: EspacioFisico): void {
    this.selectedEspacio.set(e);
    this.formError.set('');
    this.formSuccess.set('');
    this.espacioForm.patchValue({
      numero:         e.numero,
      edificacion:    e.edificacion,
      tipo_espacio:   e.tipo_espacio,
      capacidad:      e.capacidad,
      disponibilidad: e.disponibilidad,
      sede:           e.sede,
      descripcion:    e.descripcion ?? '',
    });
    this.openMenuId.set(null);
    this.modalMode.set('editar');
  }

  openEliminar(e: EspacioFisico): void {
    this.selectedEspacio.set(e);
    this.openMenuId.set(null);
    this.modalMode.set('eliminar');
  }

  openReservar(e: EspacioFisico): void {
    this.selectedEspacio.set(e);
    this.reservaForm.reset();
    this.formError.set('');
    this.formSuccess.set('');
    this.openMenuId.set(null);
    this.modalMode.set('reservar');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.formError.set('');
    this.formSuccess.set('');
  }

  openVerMes(): void {
    this.modalMode.set('mes');
  }

  /* ── CRUD Actions ───────────────────────────────────────── */
  saveEspacio(): void {
    if (this.espacioForm.invalid) {
      this.espacioForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.formError.set('');

    const dto: CreateEspacioDto = this.espacioForm.value;
    const isEdit = this.modalMode() === 'editar';
    const obs = isEdit
      ? this.espaciosService.update(this.selectedEspacio()!.id, dto)
      : this.espaciosService.create(dto);

    obs.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formSuccess.set(isEdit ? '¡Espacio actualizado!' : '¡Espacio registrado!');
        setTimeout(() => { this.closeModal(); this.loadEspacios(); }, 1200);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.formError.set(err?.error?.message ?? 'Ocurrió un error al guardar.');
      },
    });
  }

  confirmEliminar(): void {
    const e = this.selectedEspacio();
    if (!e) return;
    this.isSaving.set(true);
    this.espaciosService.delete(e.id).subscribe({
      next:  () => { this.isSaving.set(false); this.closeModal(); this.loadEspacios(); },
      error: () => this.isSaving.set(false),
    });
  }

  confirmReservar(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }
    const e = this.selectedEspacio();
    if (!e) return;
    this.isSaving.set(true);
    this.formError.set('');
    this.espaciosService.reservar(e.id, this.reservaForm.value).subscribe({
      next:  () => { this.isSaving.set(false); this.formSuccess.set('¡Reserva realizada con éxito!'); setTimeout(() => this.closeModal(), 1400); },
      error: (err) => { this.isSaving.set(false); this.formError.set(err?.error?.message ?? 'Error al reservar.'); },
    });
  }

  marcarDisponible(e: EspacioFisico): void {
    this.openMenuId.set(null);
    this.espaciosService.marcarDisponible(e.id).subscribe({
      next: () => this.loadEspacios(),
      error: () => {},
    });
  }

  /* ── Sidebar & Nav ──────────────────────────────────────── */
  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }

  navigate(item: NavItem): void {
    const implementedRoutes = ['/dashboard', '/miembros', '/edificaciones', '/catalogo', '/espacios'];
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

  /* ── Helpers ────────────────────────────────────────────── */
  getDisponibilidadClass(d: string): string {
    switch (d) {
      case 'Disponible':               return 'badge-disponible';
      case 'Parcialmente disponible':  return 'badge-parcial';
      case 'No disponible':            return 'badge-nodisponible';
      default:                         return '';
    }
  }

  getRecursoIcon(tipo: string): string {
    const map: Record<string, string> = {
      'proyector':    'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
      'microfono':    'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
      'parlante':     'M15.536 8.464a5 5 0 010 7.072M12 6v12M8.464 8.464a5 5 0 000 7.072',
      'computadora':  'M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8',
      'wifi':         'M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01',
      'televisor':    'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM8 21h8M12 17v4',
      'pizarron':     'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V3h16v14H6.5M4 19.5v.5',
      'laboratorio':  'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v4m0 0H5m4 0h10M5 7v14a2 2 0 002 2h10a2 2 0 002-2V7',
    };
    return map[tipo.toLowerCase()] ?? 'M12 6v6m0 0v6m0-6h6m-6 0H6';
  }

  getReservaColor(r: ReservaCalendario): string {
    const colors = ['#E63946','#3B82F6','#F59E0B','#8B5CF6','#22C55E','#06B6D4'];
    return r.color ?? colors[r.id % colors.length];
  }

  formatHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }


  trackById(_i: number, e: EspacioFisico): number { return e.id; }
  isNumber(val: unknown): boolean { return typeof val === 'number'; }
}
