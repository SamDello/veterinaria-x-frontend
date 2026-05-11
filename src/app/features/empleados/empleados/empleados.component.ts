import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss'
})
export class EmpleadosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empleadoService = inject(EmpleadoService);
  private usuarioService = inject(UsuarioService);

  empleados: any[] = [];
  usuarios: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    id_usuario: ['', Validators.required],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    ci: [''],
    telefono: [''],
    direccion: [''],
    cargo: [''],
    especialidad: ['']
  });

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadUsuarios();
  }

  loadEmpleados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.empleadoService.getEmpleados().subscribe({
      next: (response) => {
        this.empleados = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar empleados';
        this.loading = false;
      }
    });
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response?.data || [];
      }
    });
  }

  getUsuariosDisponibles(): any[] {
    const usados = new Set(
      this.empleados
        .filter((e: any) => e.id_usuario && (!this.editingId || e.id_empleado !== this.editingId))
        .map((e: any) => e.id_usuario)
    );

    if (this.editingId) {
      const empleadoEditando = this.empleados.find((e: any) => e.id_empleado === this.editingId);
      if (empleadoEditando?.id_usuario) {
        usados.delete(empleadoEditando.id_usuario);
      }
    }

    return this.usuarios.filter((u: any) => u.estado && !usados.has(u.id_usuario));
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(empleado: any): void {
    this.resetForm();
    this.editingId = empleado.id_empleado;

    this.form.patchValue({
      id_usuario: empleado.id_usuario,
      nombre: empleado.nombre || '',
      apellidos: empleado.apellidos || '',
      ci: empleado.ci || '',
      telefono: empleado.telefono || '',
      direccion: empleado.direccion || '',
      cargo: empleado.cargo || '',
      especialidad: empleado.especialidad || ''
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

    const raw = this.form.getRawValue();
    const payload = {
      id_usuario: Number(raw.id_usuario),
      nombre: raw.nombre,
      apellidos: raw.apellidos,
      ci: raw.ci,
      telefono: raw.telefono,
      direccion: raw.direccion,
      cargo: raw.cargo,
      especialidad: raw.especialidad
    };

    if (this.editingId) {
      this.empleadoService.updateEmpleado(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Empleado actualizado correctamente';
          this.loadEmpleados();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar empleado';
          this.saving = false;
        }
      });
    } else {
      this.empleadoService.createEmpleado(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Empleado registrado correctamente';
          this.loadEmpleados();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar empleado';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(empleado: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} al empleado ${empleado.nombre} ${empleado.apellidos}?`);

    if (!confirmado) return;

    this.empleadoService.changeStatus(empleado.id_empleado, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadEmpleados();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del empleado';
      }
    });
  }

  getUsuarioText(empleado: any): string {
    if (!empleado?.usuario) {
      return 'Sin usuario';
    }

    return `${empleado.usuario.username} - ${empleado.usuario.correo}`;
  }

  getRolesText(empleado: any): string {
    const roles = empleado?.usuario?.roles || [];
    if (!roles.length) {
      return 'Sin roles';
    }

    return roles.map((r: any) => r.nombre).join(', ');
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
