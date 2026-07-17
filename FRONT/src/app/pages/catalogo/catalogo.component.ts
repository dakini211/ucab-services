import {
  Component, OnInit, OnDestroy, inject, signal, computed, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  CatalogoService, Servicio, CreateServicioDto
} from '../../services/catalogo.service';
import { AuthService } from '../../services/auth.service';

type ModalMode = 'consultar' | 'modificar' | 'eliminar' | 'solicitar' | 'publicar' | null;

interface NavItem { id: string; label: string; route: string; icon: string; }

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit, OnDestroy {
  private readonly catalogoService = inject(CatalogoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  /* ── UI State ───────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  modalMode = signal<ModalMode>(null);
  selectedServicio = signal<Servicio | null>(null);
  openMenuId = signal<number | null>(null);
  currentRoute = signal('catalogo');

  /* ── Data ──────────────────────────────────────────────── */
  servicios = signal<Servicio[]>([]);
  total = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  pageSize = signal(5);

  /* ── Filters ────────────────────────────────────────────── */
  searchQuery = signal('');
  filterCategoria = signal('');
  filterSede = signal('');
  filterEstado = signal('');
  filterTipo = signal('');
  categorias = signal<string[]>([]);
  sedes = signal<string[]>([]);

  /* ── User ──────────────────────────────────────────────── */
  userName = signal('Usuario');
  userEmail = signal('');
  userInitials = signal('US');
  canEdit = signal(false);
  userRol = signal('');

  /* ── Form ──────────────────────────────────────────────── */
  servicioForm!: FormGroup;
  formError = signal('');
  formSuccess = signal('');

  /* ── Nav ────────────────────────────────────────────────── */
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
    { id: 'configuracion', label: 'Configuración', route: '/configuracion', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: 'seguridad', label: 'Seguridad', route: '/seguridad', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  /** Ofertas Laborales: Estudiante y Admin. Reportes: solo Admin (admin_general). */
  visibleNavItems = computed(() =>
    this.navItems.filter((item) => {
      if (item.id === 'ofertas-laborales') return this.userRol() === 'Estudiante' || this.userRol() === 'Admin';
      if (item.id === 'reportes') return this.userRol() === 'Admin';
      return true;
    })
  );

  /* ── Computed ────────────────────────────────────────────── */
  pages = computed(() => {
    const total = this.totalPages();
    const curr = this.currentPage();
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
  showingTo = computed(() => Math.min(this.currentPage() * this.pageSize(), this.total()));

  hasActiveFilters = computed(() =>
    !!this.filterCategoria() || !!this.filterSede() || !!this.filterEstado() || !!this.filterTipo()
  );

  /* ── Lifecycle ──────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadUserFromStorage();
    this.buildForm();
    this.loadCategorias();
    this.loadSedes();
    this.loadServicios();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadServicios();
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
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        this.userName.set(u.nombre ?? 'Usuario');
        this.userEmail.set(u.email ?? '');
        const initials = (u.nombre ?? 'U')
          .split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
        this.userInitials.set(initials);

        this.userRol.set(u.rol ?? '');
        const rol = (u.rol ?? '').toLowerCase();
        const readonlyRoles = ['estudiante', 'preparador', 'profesor', 'egresado', 'miembro', 'administrativo'];
        this.canEdit.set(!readonlyRoles.includes(rol));
      } catch { /* empty */ }
    }
  }

  /* ── Form ──────────────────────────────────────────────── */
  private buildForm(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoria: ['', Validators.required],
      sede: ['', Validators.required],
      tipo: ['Digital', Validators.required],
      precio_base: [null],
      estado: ['Borrador', Validators.required],
    });
  }

  /* ── Data Loading ───────────────────────────────────────── */
  loadServicios(): void {
    this.isLoading.set(true);
    this.catalogoService.getAll({
      search: this.searchQuery() || undefined,
      categoria: this.filterCategoria() || undefined,
      sede: this.filterSede() || undefined,
      estado: this.filterEstado() || undefined,
      tipo: this.filterTipo() || undefined,
      page: this.currentPage(),
      limit: this.pageSize(),
    }).subscribe({
      next: (res) => {
        this.servicios.set(res.data || []);
        this.total.set(res.total || 0);
        this.totalPages.set(res.totalPages || 0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadCategorias(): void {
    this.catalogoService.getCategorias().subscribe({
      next: (c) => this.categorias.set(c),
      error: () => { },
    });
  }

  loadSedes(): void {
    this.catalogoService.getSedes().subscribe({
      next: (s) => this.sedes.set(s),
      error: () => { },
    });
  }

  /* ── Filters ────────────────────────────────────────────── */
  onSearch(value: string): void { this.searchSubject.next(value); }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadServicios();
  }

  clearFilters(): void {
    this.filterCategoria.set('');
    this.filterSede.set('');
    this.filterEstado.set('');
    this.filterTipo.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadServicios();
  }

  /* ── Pagination ─────────────────────────────────────────── */
  goToPage(page: number | '...'): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadServicios();
  }

  prevPage(): void { this.goToPage(this.currentPage() - 1); }
  nextPage(): void { this.goToPage(this.currentPage() + 1); }
  firstPage(): void { this.goToPage(1); }
  lastPage(): void { this.goToPage(this.totalPages()); }

  /* ── Kebab Menu ─────────────────────────────────────────── */
  toggleMenu(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  /* ── Modals ─────────────────────────────────────────────── */
  openPublicar(): void {
    this.servicioForm.reset({ tipo: 'Digital', estado: 'Borrador' });
    this.formError.set('');
    this.formSuccess.set('');
    this.selectedServicio.set(null);
    this.openMenuId.set(null);
    this.modalMode.set('publicar');
  }

  openConsultar(s: Servicio): void {
    this.selectedServicio.set(s);
    this.openMenuId.set(null);
    this.modalMode.set('consultar');
  }

  openModificar(s: Servicio): void {
    this.selectedServicio.set(s);
    this.formError.set('');
    this.formSuccess.set('');
    this.servicioForm.patchValue({
      nombre: s.nombre,
      descripcion: s.descripcion,
      categoria: s.categoria,
      sede: s.sede,
      tipo: s.tipo,
      precio_base: s.precio_base,
      estado: s.estado,
    });
    this.openMenuId.set(null);
    this.modalMode.set('modificar');
  }

  openEliminar(s: Servicio): void {
    this.selectedServicio.set(s);
    this.openMenuId.set(null);
    this.modalMode.set('eliminar');
  }

  openSolicitar(s: Servicio): void {
    this.selectedServicio.set(s);
    this.openMenuId.set(null);
    this.modalMode.set('solicitar');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedServicio.set(null);
    this.formError.set('');
    this.formSuccess.set('');
  }

  /* ── CRUD Actions ───────────────────────────────────────── */
  saveServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.formError.set('');

    const dto: CreateServicioDto = this.servicioForm.value;
    const isEdit = this.modalMode() === 'modificar';
    const obs = isEdit
      ? this.catalogoService.update(this.selectedServicio()!.id, dto)
      : this.catalogoService.create(dto);

    obs.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.formSuccess.set(isEdit ? '¡Servicio actualizado!' : '¡Servicio publicado!');
        setTimeout(() => { this.closeModal(); this.loadServicios(); }, 1200);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.formError.set(err?.error?.message ?? 'Ocurrió un error al guardar.');
      },
    });
  }

  confirmEliminar(): void {
    const s = this.selectedServicio();
    if (!s) return;
    this.isSaving.set(true);
    this.catalogoService.delete(s.id).subscribe({
      next: () => { this.isSaving.set(false); this.closeModal(); this.loadServicios(); },
      error: () => this.isSaving.set(false),
    });
  }

  confirmSolicitar(): void {
    const s = this.selectedServicio();
    if (!s) return;
    this.isSaving.set(true);
    this.catalogoService.solicitar(s.id).subscribe({
      next: () => { this.isSaving.set(false); this.formSuccess.set('¡Solicitud enviada con éxito!'); setTimeout(() => this.closeModal(), 1400); },
      error: (err) => { this.isSaving.set(false); this.formError.set(err?.error?.message ?? 'Error al solicitar.'); },
    });
  }

  /* ── Sidebar & Nav ──────────────────────────────────────── */
  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }

  navigate(item: NavItem): void {
    const implementedRoutes = ['/dashboard', '/perfil', '/miembros', '/edificaciones', '/catalogo', '/espacios', '/finanzas', '/ofertas-laborales', '/reportes'];
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
  getTipoBadgeClass(tipo: string): string {
    return tipo === 'Digital' ? 'badge-digital' : 'badge-presencial';
  }

  getEstadoBadgeClass(estado: string): string {
    return estado === 'Publicado' ? 'badge-publicado' : 'badge-borrador';
  }

  getPrecioLabel(precio: number | null): string {
    return precio == null || precio === 0 ? 'Gratuito' : `Bs. ${precio.toFixed(2)}`;
  }

  getCategoriaIcon(categoria: string): string {
    const map: Record<string, string> = {
      'Académicos': 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      'Administrativos': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'Estudiantiles': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'Tecnológicos': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
    };
    return map[categoria] ?? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  trackById(_i: number, s: Servicio): number { return s.id; }
  isNumber(val: unknown): boolean { return typeof val === 'number'; }
}


