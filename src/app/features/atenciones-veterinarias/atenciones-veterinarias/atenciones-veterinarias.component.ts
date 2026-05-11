import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AtencionVeterinariaService } from '../../../core/services/atencion-veterinaria.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { ServicioVeterinarioService } from '../../../core/services/servicio-veterinario.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-atenciones-veterinarias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atenciones-veterinarias.component.html',
  styleUrl: './atenciones-veterinarias.component.scss'
})
export class AtencionesVeterinariasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private atencionService = inject(AtencionVeterinariaService);
  private mascotaService = inject(MascotaService);
  private servicioVeterinarioService = inject(ServicioVeterinarioService);
  private authService = inject(AuthService);

  atenciones: any[] = [];
  mascotas: any[] = [];
  serviciosCatalogo: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  currentUser = this.authService.getUser();

  form = this.fb.group({
    id_mascota: ['', Validators.required],
    fecha: [''],
    motivo_consulta: [''],
    diagnostico: [''],
    tratamiento: [''],
    observaciones: [''],
    peso: [''],
    temperatura: [''],
    servicios: this.fb.array([])
  });

  ngOnInit(): void {
    this.loadAtenciones();
    this.loadMascotas();
    this.loadServicios();
  }

  get serviciosFormArray(): FormArray {
    return this.form.get('servicios') as FormArray;
  }

  createServicioFormGroup(data?: any): FormGroup {
    return this.fb.group({
      id_servicio: [data?.id_servicio || '', Validators.required],
      cantidad: [data?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio_unitario: [data?.precio_unitario || '', [Validators.required, Validators.min(0)]],
      observacion: [data?.observacion || '']
    });
  }

  addServicio(data?: any): void {
    this.serviciosFormArray.push(this.createServicioFormGroup(data));
  }

  removeServicio(index: number): void {
    this.serviciosFormArray.removeAt(index);
  }

  loadAtenciones(): void {
    this.loading = true;
    this.errorMessage = '';

    this.atencionService.getAtencionesVeterinarias().subscribe({
      next: (response) => {
        this.atenciones = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar atenciones veterinarias';
        this.loading = false;
      }
    });
  }

  loadMascotas(): void {
    this.mascotaService.getMascotas().subscribe({
      next: (response) => {
        this.mascotas = (response?.data || []).filter((m: any) => m.estado);
      },
      error: () => {
        this.mascotas = [];
      }
    });
  }

  loadServicios(): void {
    this.servicioVeterinarioService.getServiciosVeterinarios().subscribe({
      next: (response) => {
        this.serviciosCatalogo = (response?.data || []).filter((s: any) => s.estado);
      },
      error: () => {
        this.serviciosCatalogo = [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: any): void {
    this.resetForm();
    this.editingId = item.id_atencion;

    this.form.patchValue({
      id_mascota: item.id_mascota,
      fecha: item.fecha ? this.toDatetimeLocalValue(item.fecha) : '',
      motivo_consulta: item.motivo_consulta || '',
      diagnostico: item.diagnostico || '',
      tratamiento: item.tratamiento || '',
      observaciones: item.observaciones || '',
      peso: item.peso || '',
      temperatura: item.temperatura || ''
    });

    if (Array.isArray(item.servicios) && item.servicios.length > 0) {
      item.servicios.forEach((servicio: any) => {
        this.addServicio({
          id_servicio: servicio.id_servicio,
          cantidad: servicio.AtencionServicio?.cantidad || 1,
          precio_unitario: servicio.AtencionServicio?.precio_unitario || servicio.precio || 0,
          observacion: servicio.AtencionServicio?.observacion || ''
        });
      });
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onServicioChange(index: number): void {
    const group = this.serviciosFormArray.at(index) as FormGroup;
    const idServicio = Number(group.get('id_servicio')?.value || 0);

    const servicio = this.serviciosCatalogo.find((s: any) => s.id_servicio === idServicio);
    if (servicio) {
      group.patchValue({
        precio_unitario: servicio.precio
      });
    }
  }

  submit(): void {
    this.modalErrorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.serviciosFormArray.controls.forEach(control => control.markAllAsTouched());
      return;
    }

    const idEmpleado = this.currentUser?.empleado?.id_empleado;
    if (!idEmpleado) {
      this.modalErrorMessage = 'El usuario actual no tiene un empleado asociado.';
      return;
    }

    this.saving = true;

    const payload = {
      id_mascota: Number(this.form.value.id_mascota),
      id_empleado: idEmpleado,
      fecha: this.form.value.fecha || null,
      motivo_consulta: this.form.value.motivo_consulta || null,
      diagnostico: this.form.value.diagnostico || null,
      tratamiento: this.form.value.tratamiento || null,
      observaciones: this.form.value.observaciones || null,
      peso: this.form.value.peso ? Number(this.form.value.peso) : null,
      temperatura: this.form.value.temperatura ? Number(this.form.value.temperatura) : null,
      servicios: this.serviciosFormArray.value.map((item: any) => ({
        id_servicio: Number(item.id_servicio),
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
        observacion: item.observacion || null
      }))
    };

    if (this.editingId) {
      this.atencionService.updateAtencionVeterinaria(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Atención actualizada correctamente';
          this.loadAtenciones();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar atención';
          this.saving = false;
        }
      });
    } else {
      this.atencionService.createAtencionVeterinaria(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Atención registrada correctamente';
          this.loadAtenciones();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar atención';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(item: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la atención #${item.id_atencion}?`);

    if (!confirmado) return;

    this.atencionService.changeStatus(item.id_atencion, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadAtenciones();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la atención';
      }
    });
  }

  getMascotaText(item: any): string {
    return item?.mascota?.nombre || '-';
  }

  getEmpleadoText(item: any): string {
    const nombre = item?.empleado?.nombre || '';
    const apellidos = item?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getServiciosText(item: any): string {
    if (!Array.isArray(item?.servicios) || item.servicios.length === 0) {
      return '-';
    }

    return item.servicios.map((s: any) => s.nombre).join(', ');
  }

  getEmpleadoSesionText(): string {
    const nombre = this.currentUser?.empleado?.nombre || '';
    const apellidos = this.currentUser?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim();
  }

  private toDatetimeLocalValue(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  resetForm(): void {
    this.form.reset({
      id_mascota: '',
      fecha: '',
      motivo_consulta: '',
      diagnostico: '',
      tratamiento: '',
      observaciones: '',
      peso: '',
      temperatura: ''
    });

    while (this.serviciosFormArray.length > 0) {
      this.serviciosFormArray.removeAt(0);
    }

    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
