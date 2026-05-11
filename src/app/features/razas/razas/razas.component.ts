import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RazaService } from '../../../core/services/raza.service';
import { EspecieService } from '../../../core/services/especie.service';

@Component({
  selector: 'app-razas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './razas.component.html',
  styleUrl: './razas.component.scss'
})
export class RazasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private razaService = inject(RazaService);
  private especieService = inject(EspecieService);

  razas: any[] = [];
  especies: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    id_especie: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.loadRazas();
    this.loadEspecies();
  }

  loadRazas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.razaService.getRazas().subscribe({
      next: (response) => {
        this.razas = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar razas';
        this.loading = false;
      }
    });
  }

  loadEspecies(): void {
    this.especieService.getEspecies().subscribe({
      next: (response) => {
        this.especies = (response?.data || []).filter((e: any) => e.estado);
      },
      error: () => {
        this.especies = [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: any): void {
    this.resetForm();
    this.editingId = item.id_raza;

    this.form.patchValue({
      id_especie: item.id_especie,
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
      id_especie: Number(this.form.value.id_especie),
      nombre: this.form.value.nombre,
      descripcion: this.form.value.descripcion
    };

    if (this.editingId) {
      this.razaService.updateRaza(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Raza actualizada correctamente';
          this.loadRazas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar raza';
          this.saving = false;
        }
      });
    } else {
      this.razaService.createRaza(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Raza registrada correctamente';
          this.loadRazas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar raza';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la raza ${item.nombre}?`);

    if (!confirmado) return;

    this.razaService.changeStatus(item.id_raza, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadRazas();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la raza';
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      id_especie: '',
      nombre: '',
      descripcion: ''
    });
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
