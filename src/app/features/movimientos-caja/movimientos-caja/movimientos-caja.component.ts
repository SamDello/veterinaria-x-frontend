import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MovimientoCajaService } from '../../../core/services/movimiento-caja.service';

@Component({
  selector: 'app-movimientos-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimientos-caja.component.html',
  styleUrl: './movimientos-caja.component.scss'
})
export class MovimientosCajaComponent implements OnInit {
  private movimientoCajaService = inject(MovimientoCajaService);
  private fb = inject(FormBuilder);

  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];

  loading = false;
  errorMessage = '';

  showDetailModal = false;
  selectedMovimiento: any = null;

  filtroForm = this.fb.group({
    texto: [''],
    tipo_movimiento: [''],
    referencia_tipo: ['']
  });

  ngOnInit(): void {
    this.loadMovimientos();

    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  loadMovimientos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.movimientoCajaService.getMovimientosCaja().subscribe({
      next: (response) => {
        this.movimientos = response?.data || [];
        this.movimientosFiltrados = [...this.movimientos];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar movimientos de caja';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    const texto = (this.filtroForm.value.texto || '').toLowerCase().trim();
    const tipoMovimiento = this.filtroForm.value.tipo_movimiento || '';
    const referenciaTipo = this.filtroForm.value.referencia_tipo || '';

    this.movimientosFiltrados = this.movimientos.filter((mov: any) => {
      const caja = mov?.aperturaCaja?.caja?.nombre || '';
      const empleado = `${mov?.empleado?.nombre || ''} ${mov?.empleado?.apellidos || ''}`.trim();
      const metodoPago = mov?.metodoPago?.nombre || '';
      const cliente = `${mov?.pago?.venta?.cliente?.nombre || ''} ${mov?.pago?.venta?.cliente?.apellidos || ''}`.trim();
      const observacion = mov?.observacion || '';
      const referencia = mov?.referencia_tipo || '';

      const textoGeneral =
        `${caja} ${empleado} ${metodoPago} ${cliente} ${observacion} ${referencia} ${mov?.id_movimiento_caja || ''}`
          .toLowerCase();

      const cumpleTexto = !texto || textoGeneral.includes(texto);
      const cumpleTipoMovimiento = !tipoMovimiento || mov?.tipo_movimiento === tipoMovimiento;
      const cumpleReferencia = !referenciaTipo || mov?.referencia_tipo === referenciaTipo;

      return cumpleTexto && cumpleTipoMovimiento && cumpleReferencia;
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      texto: '',
      tipo_movimiento: '',
      referencia_tipo: ''
    });
    this.movimientosFiltrados = [...this.movimientos];
  }

  openDetailModal(movimiento: any): void {
    this.selectedMovimiento = movimiento;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.selectedMovimiento = null;
    this.showDetailModal = false;
  }

  getCajaText(mov: any): string {
    return mov?.aperturaCaja?.caja?.nombre || '-';
  }

  getEmpleadoText(mov: any): string {
    const nombre = mov?.empleado?.nombre || '';
    const apellidos = mov?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getMetodoPagoText(mov: any): string {
    return mov?.metodoPago?.nombre || '-';
  }

  getClienteText(mov: any): string {
    const nombre = mov?.pago?.venta?.cliente?.nombre || '';
    const apellidos = mov?.pago?.venta?.cliente?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }
}
