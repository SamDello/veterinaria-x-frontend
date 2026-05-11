import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CajaService } from '../../../core/services/caja.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.scss'
})
export class CajaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cajaService = inject(CajaService);

  cajas: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    ubicacion: ['']
  });

  ngOnInit(): void {
    this.loadCajas();
  }

  loadCajas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cajaService.getCajas().subscribe({
      next: (response) => {
        this.cajas = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar cajas';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(caja: any): void {
    this.resetForm();
    this.editingId = caja.id_caja;

    this.form.patchValue({
      nombre: caja.nombre || '',
      descripcion: caja.descripcion || '',
      ubicacion: caja.ubicacion || ''
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
      descripcion: this.form.value.descripcion,
      ubicacion: this.form.value.ubicacion
    };

    if (this.editingId) {
      this.cajaService.updateCaja(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Caja actualizada correctamente';
          this.loadCajas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar caja';
          this.saving = false;
        }
      });
    } else {
      this.cajaService.createCaja(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Caja registrada correctamente';
          this.loadCajas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar caja';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(caja: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la caja ${caja.nombre}?`);

    if (!confirmado) return;

    this.cajaService.changeStatus(caja.id_caja, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadCajas();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la caja';
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
