import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspecieService } from '../../../core/services/especie.service';

@Component({
  selector: 'app-especies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './especies.component.html',
  styleUrl: './especies.component.scss'
})
export class EspeciesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private especieService = inject(EspecieService);

  especies: any[] = [];

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
    this.loadEspecies();
  }

  loadEspecies(): void {
    this.loading = true;
    this.errorMessage = '';

    this.especieService.getEspecies().subscribe({
      next: (response) => {
        this.especies = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar especies';
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
    this.editingId = item.id_especie;

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
      this.especieService.updateEspecie(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Especie actualizada correctamente';
          this.loadEspecies();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar especie';
          this.saving = false;
        }
      });
    } else {
      this.especieService.createEspecie(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Especie registrada correctamente';
          this.loadEspecies();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar especie';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la especie ${item.nombre}?`);

    if (!confirmado) return;

    this.especieService.changeStatus(item.id_especie, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadEspecies();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la especie';
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      nombre: '',
      descripcion: ''
    });
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
