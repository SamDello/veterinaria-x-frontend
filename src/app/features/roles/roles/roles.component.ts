import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../../../core/services/rol.service';
import { PermisoService } from '../../../core/services/permiso.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);

  roles: any[] = [];
  permisos: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  showModal = false;
  showPermisosModal = false;

  editingId: number | null = null;
  selectedRol: any = null;
  selectedPermisos: number[] = [];

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermisos();
  }

  loadRoles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.rolService.getRoles().subscribe({
      next: (response) => {
        this.roles = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar roles';
        this.loading = false;
      }
    });
  }

  loadPermisos(): void {
    this.permisoService.getPermisos().subscribe({
      next: (response) => {
        this.permisos = response?.data || [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(rol: any): void {
    this.editingId = rol.id_rol;
    this.form.patchValue({
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.form.getRawValue();

    if (this.editingId) {
      this.rolService.updateRol(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Rol actualizado correctamente';
          this.loadRoles();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al actualizar rol';
          this.saving = false;
        }
      });
    } else {
      this.rolService.createRol(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Rol registrado correctamente';
          this.loadRoles();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al registrar rol';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(rol: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el rol ${rol.nombre}?`);

    if (!confirmado) return;

    this.rolService.changeStatus(rol.id_rol, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadRoles();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del rol';
      }
    });
  }

  openPermisosModal(rol: any): void {
    this.selectedRol = rol;
    this.selectedPermisos = (rol.permisos || []).map((p: any) => p.id_permiso);
    this.showPermisosModal = true;
  }

  closePermisosModal(): void {
    this.showPermisosModal = false;
    this.selectedRol = null;
    this.selectedPermisos = [];
  }

  togglePermiso(idPermiso: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedPermisos.includes(idPermiso)) {
        this.selectedPermisos.push(idPermiso);
      }
    } else {
      this.selectedPermisos = this.selectedPermisos.filter((id) => id !== idPermiso);
    }
  }

  savePermisos(): void {
    if (!this.selectedRol) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rolService.assignPermisos(this.selectedRol.id_rol, this.selectedPermisos).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Permisos asignados correctamente';
        this.loadRoles();
        this.closePermisosModal();
        this.saving = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al asignar permisos';
        this.saving = false;
      }
    });
  }

  isPermisoSelected(idPermiso: number): boolean {
    return this.selectedPermisos.includes(idPermiso);
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}
