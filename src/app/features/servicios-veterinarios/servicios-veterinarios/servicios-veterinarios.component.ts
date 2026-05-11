import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioVeterinarioService } from '../../../core/services/servicio-veterinario.service';

@Component({
  selector: 'app-servicios-veterinarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicios-veterinarios.component.html',
  styleUrl: './servicios-veterinarios.component.scss'
})
export class ServiciosVeterinariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicioVeterinarioService = inject(ServicioVeterinarioService);

  servicios: any[] = [];

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
    precio: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicioVeterinarioService.getServiciosVeterinarios().subscribe({
      next: (response) => {
        this.servicios = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar servicios veterinarios';
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
    this.editingId = item.id_servicio;

    this.form.patchValue({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      precio: item.precio || 0
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
      precio: Number(this.form.value.precio || 0)
    };

    if (this.editingId) {
      this.servicioVeterinarioService.updateServicioVeterinario(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Servicio veterinario actualizado correctamente';
          this.loadServicios();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar servicio veterinario';
          this.saving = false;
        }
      });
    } else {
      this.servicioVeterinarioService.createServicioVeterinario(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Servicio veterinario registrado correctamente';
          this.loadServicios();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar servicio veterinario';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el servicio ${item.nombre}?`);

    if (!confirmado) return;

    this.servicioVeterinarioService.changeStatus(item.id_servicio, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadServicios();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del servicio veterinario';
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0
    });
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
