import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TraspasoService } from '../../../core/services/traspaso.service';
import { AlmacenService } from '../../../core/services/almacen.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-traspasos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traspasos.component.html',
  styleUrl: './traspasos.component.scss'
})
export class TraspasosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private traspasoService = inject(TraspasoService);
  private almacenService = inject(AlmacenService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);

  traspasos: any[] = [];
  almacenes: any[] = [];
  productos: any[] = [];

  loading = false;
  saving = false;

  showModal = false;
  showDetailModal = false;

  selectedTraspaso: any = null;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  currentUser = this.authService.getUser();

  form = this.fb.group({
    id_almacen_origen: ['', Validators.required],
    id_almacen_destino: ['', Validators.required],
    observacion: [''],
    detalles: this.fb.array([])
  });

  ngOnInit(): void {
    this.loadTraspasos();
    this.loadAlmacenes();
    this.loadProductos();
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  createDetalleForm(): any {
    return this.fb.group({
      id_producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.01)]]
    });
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleForm());
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  loadTraspasos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.traspasoService.getTraspasos().subscribe({
      next: (response) => {
        this.traspasos = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar traspasos.';
        this.loading = false;
      }
    });
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = response?.data || [];
      },
      error: () => {
        this.almacenes = [];
      }
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = response?.data || [];
      },
      error: () => {
        this.productos = [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.addDetalle();
    this.modalErrorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalErrorMessage = '';
    this.resetForm();
  }

  openDetailModal(traspaso: any): void {
    this.selectedTraspaso = traspaso;
    this.showDetailModal = true;

    if (traspaso?.id_traspaso) {
      this.traspasoService.getTraspasoById(traspaso.id_traspaso).subscribe({
        next: (response) => {
          this.selectedTraspaso = response?.data || traspaso;
        },
        error: () => {
          this.selectedTraspaso = traspaso;
        }
      });
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTraspaso = null;
  }

  submit(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      this.form.markAllAsTouched();
      this.modalErrorMessage = 'Complete los datos obligatorios del traspaso.';
      return;
    }

    const idAlmacenOrigen = Number(this.form.value.id_almacen_origen);
    const idAlmacenDestino = Number(this.form.value.id_almacen_destino);

    if (idAlmacenOrigen === idAlmacenDestino) {
      this.modalErrorMessage = 'El almacén origen y destino no pueden ser el mismo.';
      return;
    }

    const detallesPayload = this.detalles.getRawValue().map((item: any) => ({
      id_producto: Number(item.id_producto),
      cantidad: Number(item.cantidad)
    }));

    const detalleInvalido = detallesPayload.some((item: any) => {
      return !item.id_producto || item.cantidad <= 0;
    });

    if (detalleInvalido) {
      this.modalErrorMessage = 'Cada detalle debe tener producto y cantidad mayor a cero.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.modalErrorMessage = '';

    const payload = {
      id_almacen_origen: idAlmacenOrigen,
      id_almacen_destino: idAlmacenDestino,
      id_empleado: this.currentUser?.empleado?.id_empleado,
      observacion: this.form.value.observacion || null,
      detalles: detallesPayload
    };

    this.traspasoService.createTraspaso(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Traspaso registrado correctamente.';
        this.loadTraspasos();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        this.modalErrorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Error al registrar traspaso.';
        this.saving = false;
      }
    });
  }

  getAlmacenText(almacen: any): string {
    return almacen?.nombre || '-';
  }

  getEmpleadoText(empleado: any): string {
    return `${empleado?.nombre || ''} ${empleado?.apellidos || ''}`.trim() || '-';
  }

  getProductoText(producto: any): string {
    return producto?.nombre || '-';
  }

  getCantidadTotal(traspaso: any): number {
    if (!Array.isArray(traspaso?.detalles)) return 0;

    return traspaso.detalles.reduce((acc: number, item: any) => {
      return acc + Number(item.cantidad || 0);
    }, 0);
  }

  getCostoTotal(traspaso: any): number {
    if (!Array.isArray(traspaso?.detalles)) return 0;

    return traspaso.detalles.reduce((acc: number, item: any) => {
      return acc + Number(item.costo_total || 0);
    }, 0);
  }

  resetForm(): void {
    this.form.reset({
      id_almacen_origen: '',
      id_almacen_destino: '',
      observacion: ''
    });

    this.detalles.clear();
  }
}
