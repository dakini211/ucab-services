import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule,
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MiembrosService, FamiliarDetalle } from '../../services/miembros.service';

/* ── Interfaces ──────────────────────────────────────────── */
interface MiembroDetalle {
  id: number;
  cedula?: string;
  cedula_identidad?: number | string;
  nombre?: string;
  primer_nombre?: string;
  primer_apellido?: string;
  correo?: string;
  correo_institucional?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  estado_cuenta: string;
  tipo_vinculacion: string;
  total_sesiones: number;
  direccion_habitacion?: string;
  estudiante?: {
    preparador?: {
      tipo_asignatura: string;
      horas_ayudantia: number;
    };
  };
  personal_ucab?: {
    profesor?: {
      escalafon_docente: string;
      carga_horaria_semanal: number;
    };
    administrativo?: {
      unidad_presupuestaria: string;
      carga_horaria_semanal: number;
    };
  };
  billetera_digital?: {
    uid: string;
    saldo: number | string;
  };
}

interface NavItem {
  id: string; label: string; route: string; icon: string;
}

/* ── Custom validator: confirmar contraseña ──────────────── */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const nueva = group.get('nueva_contrasena')?.value;
  const confirmar = group.get('confirmar_contrasena')?.value;
  return nueva && confirmar && nueva !== confirmar ? { mismatch: true } : null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly miembrosService = inject(MiembrosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  private readonly API = 'http://localhost:3000/api';

  /* ── State ─────────────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  showPasswordModal = signal(false);
  currentRoute = signal('perfil');

  /* ── User & miembro data ────────────────────────────────── */
  miembro = signal<MiembroDetalle | null>(null);
  userName = signal('Usuario');
  userEmail = signal('');
  userInitials = signal('US');
  userId = signal<number>(0);
  isAdmin = signal(false);
  userRol = signal('');

  /* ── Password form ──────────────────────────────────────── */
  passwordForm!: FormGroup;
  passError = signal('');
  passSuccess = signal('');
  showNueva = signal(false);
  showConfirmar = signal(false);

  /* ── Familiar form ──────────────────────────────────────── */
  familiarForm!: FormGroup;
  showFamiliarModal = signal(false);
  isSavingFamiliar = signal(false);
  familiarFormError = signal('');
  familiarFormSuccess = signal('');

  /* ── Familiares / Beneficiarios ─────────────────────────── */
  familiares = signal<FamiliarDetalle[]>([]);
  isPersonalUcab = computed(() => {
    const rol = this.userRol();
    return rol === 'Profesor' || rol === 'Administrativo';
  });
  canManageFamiliares = computed(() => {
    return this.isPersonalUcab() || this.userRol() === 'Admin';
  });

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

  /* ── Lifecycle ──────────────────────────────────────────── */
  ngOnInit(): void {
    this.loadUserFromStorage();
    this.buildPasswordForm();
    this.loadMiembroData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── Load user from sessionStorage ───────────────────────── */
  private loadUserFromStorage(): void {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        this.userName.set(u.nombre ?? 'Usuario');
        this.userEmail.set(u.email ?? '');
        this.userId.set(u.id ?? 0);
        const initials = (u.nombre ?? 'U')
          .split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
        this.userInitials.set(initials);
        this.userRol.set(u.rol ?? '');
        const rol = (u.rol ?? '').toLowerCase();
        const readonlyRoles = ['estudiante', 'preparador', 'profesor', 'egresado', 'miembro', 'administrativo'];
        this.isAdmin.set(!readonlyRoles.includes(rol));
      } catch { /* empty */ }
    }
  }

  /* ── Load miembro detail from backend ──────────────────── */
  loadMiembroData(): void {
    const id = this.userId();
    if (!id) {
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.http.get<MiembroDetalle>(`${this.API}/miembro/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (m) => {
          this.miembro.set(m);
          this.isLoading.set(false);
          // Si es personal UCAB o Admin, cargar familiares
          if (this.canManageFamiliares()) {
            this.loadFamiliares();
          }
        },
        error: () => {
          // Fallback: show what we have from sessionStorage
          this.isLoading.set(false);
        },
      });
  }

  private loadFamiliares(): void {
    if (this.userRol() === 'Admin') {
      this.miembrosService.getTodosFamiliares()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (lista) => this.familiares.set(lista),
          error: () => this.familiares.set([]),
        });
    } else {
      this.miembrosService.getMisFamiliares()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (lista) => this.familiares.set(lista),
          error: () => this.familiares.set([]),
        });
    }
  }

  /* ── Form builders ──────────────────────────────────────── */
  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group(
      {
        nueva_contrasena: [
          '',
          [Validators.required, Validators.minLength(6)],
        ],
        confirmar_contrasena: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    this.familiarForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      nombre_familiar: ['', Validators.required],
      parentesco: ['', Validators.required],
      edad_familiar: ['', [Validators.required, Validators.min(0)]],
      estudios: [''],
      vacunacion: [''],
      educacion_inicial: ['']
    });

    this.familiarForm.get('edad_familiar')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(edad => {
      const form = this.familiarForm;
      if (edad >= 18) {
        form.get('estudios')?.setValidators([Validators.required]);
        form.get('vacunacion')?.clearValidators();
        form.get('educacion_inicial')?.clearValidators();
      } else if (edad !== null && edad >= 0 && edad < 18) {
        form.get('estudios')?.clearValidators();
        form.get('vacunacion')?.setValidators([Validators.required]);
        form.get('educacion_inicial')?.setValidators([Validators.required]);
      } else {
        form.get('estudios')?.clearValidators();
        form.get('vacunacion')?.clearValidators();
        form.get('educacion_inicial')?.clearValidators();
      }
      form.get('estudios')?.updateValueAndValidity({ emitEvent: false });
      form.get('vacunacion')?.updateValueAndValidity({ emitEvent: false });
      form.get('educacion_inicial')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  /* ── Password modal ─────────────────────────────────────── */
  openPasswordModal(): void {
    this.passwordForm.reset();
    this.passError.set('');
    this.passSuccess.set('');
    this.showNueva.set(false);
    this.showConfirmar.set(false);
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }

  toggleShowNueva(): void { this.showNueva.update(v => !v); }
  toggleShowConfirmar(): void { this.showConfirmar.update(v => !v); }

  /* ── Submit password change ─────────────────────────────── */
  submitCambioContrasena(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const id = this.userId();
    if (!id) {
      this.passError.set('No se pudo identificar al usuario. Por favor, vuelve a iniciar sesión.');
      return;
    }

    this.isSaving.set(true);
    this.passError.set('');
    this.passSuccess.set('');

    const payload = {
      id_miembro: id,
      nueva_contrasena: this.passwordForm.value.nueva_contrasena,
    };

    this.http.post<{ message: string }>(
      `${this.API}/historial-contrasena/cambiar`,
      payload
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.passSuccess.set(res.message ?? '¡Contraseña actualizada con éxito!');
        this.passwordForm.reset();
        setTimeout(() => this.closePasswordModal(), 2000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.passError.set(
          err?.error?.message ?? 'Ocurrió un error al cambiar la contraseña. Inténtalo de nuevo.'
        );
      },
    });
  }

  /* ── Familiar Modal ─────────────────────────────────────── */
  openFamiliarModal(): void {
    this.familiarFormError.set('');
    this.familiarFormSuccess.set('');
    this.familiarForm.reset({
      cedula: '',
      nombre_familiar: '',
      parentesco: '',
      edad_familiar: ''
    });
    this.showFamiliarModal.set(true);
  }

  closeFamiliarModal(): void {
    this.showFamiliarModal.set(false);
  }

  submitFamiliar(): void {
    if (this.familiarForm.invalid) {
      this.familiarForm.markAllAsTouched();
      return;
    }
    
    this.isSavingFamiliar.set(true);
    this.familiarFormError.set('');
    
    const val = this.familiarForm.value;
    this.miembrosService.registrarFamiliar(
      Number(val.cedula),
      val.nombre_familiar,
      val.parentesco,
      Number(val.edad_familiar),
      val.edad_familiar >= 18 ? val.estudios : undefined,
      val.edad_familiar < 18 ? val.vacunacion : undefined,
      val.edad_familiar < 18 ? val.educacion_inicial : undefined
    ).subscribe({
      next: () => {
        this.isSavingFamiliar.set(false);
        this.familiarFormSuccess.set('¡Familiar registrado exitosamente!');
        this.loadFamiliares();
        setTimeout(() => { this.closeFamiliarModal(); }, 1500);
      },
      error: (err) => {
        this.isSavingFamiliar.set(false);
        this.familiarFormError.set(err?.error?.message ?? 'Ocurrió un error al registrar el familiar.');
      }
    });
  }

  /* ── Sidebar & nav ──────────────────────────────────────── */
  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }

  navigate(item: NavItem): void {
    const implementedRoutes = ['/dashboard', '/miembros', '/edificaciones', '/catalogo', '/espacios', '/perfil', '/finanzas', '/ofertas-laborales', '/reportes'];
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
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'activa': return 'badge-activo';
      case 'suspendida': return 'badge-suspendido';
      case 'bloqueada': return 'badge-bloqueado';
      default: return 'badge-inactivo';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'suspendida': return 'Suspendida';
      case 'bloqueada': return 'Bloqueada';
      default: return estado;
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'No registrada';
    try {
      return new Date(dateStr).toLocaleDateString('es-VE', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  getAvatarInitials(): string {
    const m = this.miembro();
    const nombre = m ? (m.nombre || m.primer_nombre) : null;
    if (nombre) {
      return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }
    return this.userInitials();
  }

  get f() { return this.passwordForm.controls; }
  get famF() { return this.familiarForm.controls; }
}


