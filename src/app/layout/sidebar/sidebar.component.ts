import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ThemeSelectorComponent } from '../../shared/components/theme-selector/theme-selector.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSelectorComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  user = this.authService.getUser();

  expandedMenus: Record<string, boolean> = {
    administracion: true,
    veterinaria: false,
    comercial: false,
    inventario: false,
    cajaReportes: false
  };

  toggleMenu(menu: string): void {
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }

  hasPermission(permission: string): boolean {
    const permisos = this.user?.permisos || [];
    const roles = this.user?.roles || [];

    const isAdmin =
      roles.includes('ADMINISTRADOR') ||
      roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR');

    const hasDirectPermission =
      permisos.includes(permission) ||
      permisos.some((permiso: any) => permiso?.nombre === permission);

    return isAdmin || hasDirectPermission;
  }

  isAdmin(): boolean {
    const roles = this.user?.roles || [];

    return (
      roles.includes('ADMINISTRADOR') ||
      roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR')
    );
  }

  canShowAdministracion(): boolean {
    return (
      this.hasPermission('GESTIONAR_USUARIOS') ||
      this.hasPermission('GESTIONAR_ROLES') ||
      this.hasPermission('GESTIONAR_PERMISOS') ||
      this.hasPermission('GESTIONAR_EMPLEADOS')
    );
  }

  canShowVeterinaria(): boolean {
    return (
      this.hasPermission('GESTIONAR_CLIENTES') ||
      this.hasPermission('GESTIONAR_MASCOTAS') ||
      this.hasPermission('GESTIONAR_ESPECIES') ||
      this.hasPermission('GESTIONAR_RAZAS') ||
      this.hasPermission('GESTIONAR_SERVICIOS_VETERINARIOS') ||
      this.hasPermission('REGISTRAR_ATENCION_VETERINARIA')
    );
  }

  canShowComercial(): boolean {
    return (
      this.hasPermission('REGISTRAR_VENTAS_PRODUCTOS') ||
      this.hasPermission('REGISTRAR_VENTAS_SERVICIOS') ||
      this.hasPermission('GESTIONAR_PAGOS') ||
      this.hasPermission('REGISTRAR_COMPRAS') ||
      this.hasPermission('GESTIONAR_PROVEEDORES')
    );
  }

  canShowInventario(): boolean {
    return (
      this.hasPermission('GESTIONAR_PRODUCTOS') ||
      this.hasPermission('GESTIONAR_CATEGORIAS') ||
      this.hasPermission('GESTIONAR_MARCAS') ||
      this.hasPermission('GESTIONAR_ALMACENES') ||
      this.hasPermission('GESTIONAR_STOCK') ||
      this.hasPermission('GESTIONAR_TRASPASOS') ||
      this.hasPermission('GESTIONAR_MOVIMIENTOS_INVENTARIO')
    );
  }

  canShowCajaReportes(): boolean {
    return (
      this.hasPermission('GESTIONAR_CAJA') ||
      this.hasPermission('REGISTRAR_APERTURA_CAJA') ||
      this.hasPermission('REGISTRAR_CIERRE_CAJA') ||
      this.hasPermission('GESTIONAR_MOVIMIENTOS_CAJA') ||
      this.hasPermission('GESTIONAR_METODOS_PAGO') ||
      this.hasPermission('CONSULTAR_REPORTES_OPERATIVOS')
    );
  }
}
