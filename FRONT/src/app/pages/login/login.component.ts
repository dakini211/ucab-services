import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@ucab\.edu\.ve$/),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Inicio de sesión exitoso! Redirigiendo...');
        // Redirige al dashboard después del login
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  onForgotPassword(): void {
    const email = this.emailControl?.value;
    if (!email) {
      this.errorMessage.set('Ingresa tu correo institucional primero.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Se envió un correo de recuperación.');
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
