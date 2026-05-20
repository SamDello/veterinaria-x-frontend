import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  // Por defecto la contraseña está oculta
  passwordVisible = false;

  private errorTimeout: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.clearErrorMessage();

    this.authService.login(this.form.getRawValue() as { correo: string; password: string }).subscribe({
      next: () => {
        this.loading = false;
        this.clearErrorMessage();

        const user = this.authService.getUser();

        if (this.esAdministrador(user)) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: (error) => {
        this.loading = false;

        const message = error?.error?.message || 'Error al iniciar sesión';
        this.showTemporaryError(message);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private showTemporaryError(message: string): void {
    this.clearErrorMessage();

    this.errorMessage = message;

    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
      this.errorTimeout = null;
    }, 2000);
  }

  private clearErrorMessage(): void {
    this.errorMessage = '';

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  private esAdministrador(user: any): boolean {
    const roles = user?.roles || [];

    return (
      roles.includes('ADMINISTRADOR') ||
      roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR')
    );
  }

  ngOnDestroy(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }
}
