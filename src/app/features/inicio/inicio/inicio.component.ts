import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {
  private authService = inject(AuthService);

  user = this.authService.getUser();

  getNombreUsuario(): string {
    const empleado = this.user?.empleado;

    if (empleado?.nombre || empleado?.apellidos) {
      return `${empleado?.nombre || ''} ${empleado?.apellidos || ''}`.trim();
    }

    return this.user?.username || this.user?.correo || 'Usuario';
  }

  getRolesText(): string {
    const roles = this.user?.roles || [];

    if (!Array.isArray(roles) || roles.length === 0) {
      return 'Sin rol asignado';
    }

    return roles
      .map((rol: any) => typeof rol === 'string' ? rol : rol?.nombre)
      .filter(Boolean)
      .join(', ');
  }
}
