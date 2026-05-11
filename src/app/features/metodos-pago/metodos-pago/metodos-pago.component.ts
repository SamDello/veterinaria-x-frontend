import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss'
})
export class MetodosPagoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private metodoPagoService = inject(MetodoPagoService);

  metodosPago: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.loadMetodosPago();
  }

  loadMetodosPago(): void {
    this.loading = true;
    this.errorMessage = '';

    this.metodoPagoService.getMetodosPago().subscribe({
      next: (response) => {
        this.metodosPago = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar métodos de pago';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: any): void {
    this.resetForm();
    this.editingId = item.id_metodo_pago;

    this.form.patchValue({
      nombre: item.nombre || '',
      descripcion: item.descripcion || ''
    });

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

    this.saving = true;

    const payload = {
      nombre: this.form.value.nombre,
      descripcion: this.form.value.descripcion
    };

    if (this.editingId) {
      this.metodoPagoService.updateMetodoPago(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Método de pago actualizado correctamente';
          this.loadMetodosPago();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar método de pago';
          this.saving = false;
        }
      });
    } else {
      this.metodoPagoService.createMetodoPago(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Método de pago registrado correctamente';
          this.loadMetodosPago();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar método de pago';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el método de pago ${item.nombre}?`);

    if (!confirmado) return;

    this.metodoPagoService.changeStatus(item.id_metodo_pago, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadMetodosPago();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del método de pago';
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
