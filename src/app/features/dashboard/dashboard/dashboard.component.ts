import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  user = this.authService.getUser();

  loading = false;
  errorMessage = '';

  data: any = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getResumen().subscribe({
      next: (response) => {
        this.data = response?.data || null;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Error al cargar el dashboard administrativo.';
        this.loading = false;
      }
    });
  }

  getVentas7DiasMax(): number {
    const ventas = this.data?.ventas_ultimos_7_dias || [];

    if (ventas.length === 0) return 1;

    const max = Math.max(...ventas.map((item: any) => Number(item.total || 0)));

    return max > 0 ? max : 1;
  }

  getVentaBarWidth(total: any): number {
    const max = this.getVentas7DiasMax();
    const value = Number(total || 0);

    return Math.max(5, Math.round((value / max) * 100));
  }

  getClienteText(venta: any): string {
    return `${venta?.cliente?.nombre || ''} ${venta?.cliente?.apellidos || ''}`.trim() || '-';
  }

  getEmpleadoText(venta: any): string {
    return `${venta?.empleado?.nombre || ''} ${venta?.empleado?.apellidos || ''}`.trim() || '-';
  }

  getMovimientoAlmacenText(movimiento: any): string {
    const origen = movimiento?.almacenOrigen?.nombre;
    const destino = movimiento?.almacenDestino?.nombre;

    if (origen && destino) return `${origen} → ${destino}`;
    if (origen) return origen;
    if (destino) return destino;

    return '-';
  }
}
