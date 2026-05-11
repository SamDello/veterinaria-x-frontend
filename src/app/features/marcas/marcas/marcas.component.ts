import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarcaService } from '../../../core/services/marca.service';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marcas.component.html',
  styleUrl: './marcas.component.scss'
})
export class MarcasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private marcaService = inject(MarcaService);

  marcas: any[] = [];

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
    this.loadMarcas();
  }

  loadMarcas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.marcaService.getMarcas().subscribe({
      next: (response) => {
        this.marcas = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar marcas';
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
    this.editingId = item.id_marca;

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
      this.marcaService.updateMarca(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Marca actualizada correctamente';
          this.loadMarcas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar marca';
          this.saving = false;
        }
      });
    } else {
      this.marcaService.createMarca(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Marca registrada correctamente';
          this.loadMarcas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar marca';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la marca ${item.nombre}?`);

    if (!confirmado) return;

    this.marcaService.changeStatus(item.id_marca, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadMarcas();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la marca';
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
