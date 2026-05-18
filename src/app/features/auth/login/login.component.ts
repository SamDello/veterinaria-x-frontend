import { Component, inject } from '@angular/core';
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

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
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue() as { correo: string; password: string }).subscribe({
      next: () => {
        this.loading = false;

        const user = this.authService.getUser();

        if (this.esAdministrador(user)) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Error al iniciar sesión';
      }
    });
  }

  private esAdministrador(user: any): boolean {
    const roles = user?.roles || [];

    return (
      roles.includes('ADMINISTRADOR') ||
      roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR')
    );
  }
}
