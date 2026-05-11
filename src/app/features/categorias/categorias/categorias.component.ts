import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);

  categorias: any[] = [];

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
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoriaService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar categorías';
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
    this.editingId = item.id_categoria;

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
      this.categoriaService.updateCategoria(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Categoría actualizada correctamente';
          this.loadCategorias();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar categoría';
          this.saving = false;
        }
      });
    } else {
      this.categoriaService.createCategoria(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Categoría registrada correctamente';
          this.loadCategorias();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar categoría';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la categoría ${item.nombre}?`);

    if (!confirmado) return;

    this.categoriaService.changeStatus(item.id_categoria, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadCategorias();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la categoría';
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
