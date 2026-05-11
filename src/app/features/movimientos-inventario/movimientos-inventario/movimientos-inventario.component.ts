import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MovimientoInventarioService } from '../../../core/services/movimiento-inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AlmacenService } from '../../../core/services/almacen.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-movimientos-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimientos-inventario.component.html',
  styleUrl: './movimientos-inventario.component.scss'
})
export class MovimientosInventarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movimientoInventarioService = inject(MovimientoInventarioService);
  private productoService = inject(ProductoService);
  private almacenService = inject(AlmacenService);
  private authService = inject(AuthService);

  movimientos: any[] = [];
  productos: any[] = [];
  almacenes: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;

  currentUser = this.authService.getUser();

  form = this.fb.group({
    id_producto: ['', Validators.required],
    id_almacen: ['', Validators.required],
    tipo_movimiento: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    motivo: [''],
    referencia_tipo: [''],
    referencia_id: ['']
  });

  ngOnInit(): void {
    this.loadMovimientos();
    this.loadProductos();
    this.loadAlmacenes();
  }

  loadMovimientos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.movimientoInventarioService.getMovimientosInventario().subscribe({
      next: (response) => {
        this.movimientos = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar movimientos de inventario';
        this.loading = false;
      }
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = (response?.data || []).filter((p: any) => p.estado);
      }
    });
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = (response?.data || []).filter((a: any) => a.estado);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submit(): void {
    this.modalErrorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idEmpleado = this.currentUser?.empleado?.id_empleado;

    if (!idEmpleado) {
      this.modalErrorMessage = 'El usuario actual no tiene un empleado asociado.';
      return;
    }

    this.saving = true;

    const payload = {
      id_producto: Number(this.form.value.id_producto),
      id_almacen: Number(this.form.value.id_almacen),
      id_empleado: idEmpleado,
      tipo_movimiento: this.form.value.tipo_movimiento,
      cantidad: Number(this.form.value.cantidad || 0),
      motivo: this.form.value.motivo || null,
      referencia_tipo: this.form.value.referencia_tipo || null,
      referencia_id: this.form.value.referencia_id
        ? Number(this.form.value.referencia_id)
        : null
    };

    this.movimientoInventarioService.createMovimientoInventario(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Movimiento de inventario registrado correctamente';
        this.loadMovimientos();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        this.modalErrorMessage = error?.error?.message || 'Error al registrar movimiento de inventario';
        this.saving = false;
      }
    });
  }

  getProductoText(item: any): string {
    return item?.producto?.nombre || '-';
  }

  getAlmacenText(item: any): string {
    return item?.almacen?.nombre || '-';
  }

  getEmpleadoText(item: any): string {
    const nombre = item?.empleado?.nombre || '';
    const apellidos = item?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getEmpleadoSesionText(): string {
    const nombre = this.currentUser?.empleado?.nombre || '';
    const apellidos = this.currentUser?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim();
  }

  resetForm(): void {
    this.form.reset({
      id_producto: '',
      id_almacen: '',
      tipo_movimiento: '',
      cantidad: 0,
      motivo: '',
      referencia_tipo: '',
      referencia_id: ''
    });
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
