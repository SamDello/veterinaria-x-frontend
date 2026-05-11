import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlmacenService } from '../../../core/services/almacen.service';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './almacenes.component.html',
  styleUrl: './almacenes.component.scss'
})
export class AlmacenesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private almacenService = inject(AlmacenService);

  almacenes: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    ubicacion: [''],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.loadAlmacenes();
  }

  loadAlmacenes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar almacenes';
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
    this.editingId = item.id_almacen;

    this.form.patchValue({
      nombre: item.nombre || '',
      ubicacion: item.ubicacion || '',
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
      ubicacion: this.form.value.ubicacion,
      descripcion: this.form.value.descripcion
    };

    if (this.editingId) {
      this.almacenService.updateAlmacen(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Almacén actualizado correctamente';
          this.loadAlmacenes();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar almacén';
          this.saving = false;
        }
      });
    } else {
      this.almacenService.createAlmacen(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Almacén registrado correctamente';
          this.loadAlmacenes();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar almacén';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el almacén ${item.nombre}?`);

    if (!confirmado) return;

    this.almacenService.changeStatus(item.id_almacen, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadAlmacenes();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del almacén';
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
