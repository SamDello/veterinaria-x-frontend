import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);

  usuarios: any[] = [];
  roles: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  modalErrorMessage = '';
  modalSuccessMessage = '';
  passwordWarningMessage = '';

  showModal = false;
  showRolesModal = false;

  editingId: number | null = null;
  selectedUsuario: any = null;
  selectedRoles: number[] = [];

  private passwordWarningTimeout: any = null;

  form = this.fb.group({
    username: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRoles();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usuarioService.getUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.rolService.getRoles().subscribe({
      next: (response) => {
        this.roles = response?.data || [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  openEditModal(usuario: any): void {
    this.resetForm();
    this.editingId = usuario.id_usuario;
    this.form.patchValue({
      username: usuario.username || '',
      correo: usuario.correo || '',
      password: ''
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.setValidators([Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submit(): void {
  this.modalErrorMessage = '';
  this.modalSuccessMessage = '';
  this.clearPasswordWarning();

  const raw = this.form.getRawValue();

  // Validación especial para creación de usuario
  if (!this.editingId) {
    if (!raw.password || !this.isStrongPassword(raw.password)) {
      this.showTemporaryPasswordWarning();
    }
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (!this.editingId && this.selectedRoles.length === 0) {
    this.modalErrorMessage = 'Debe seleccionar al menos un rol.';
    return;
  }

  this.saving = true;

  if (this.editingId) {
    const payload: any = {
      username: raw.username,
      correo: raw.correo
    };

    if (raw.password) {
      payload.password = raw.password;
    }

    this.usuarioService.updateUsuario(this.editingId, payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Usuario actualizado correctamente';
        this.loadUsuarios();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('ERROR UPDATE USUARIO:', error);
        this.modalErrorMessage =
          error?.error?.message || 'Error al actualizar usuario';
        this.saving = false;
      }
    });
  } else {
    const payload = {
      username: raw.username,
      correo: raw.correo,
      password: raw.password,
      roles: this.selectedRoles
    };

    console.log('Payload crear usuario:', payload);

    this.usuarioService.createUsuario(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Usuario registrado correctamente';
        this.loadUsuarios();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
  console.error('ERROR CREATE USUARIO:', error);

  const backendMessage = error?.error?.message || 'Error al registrar usuario';

  if (
    backendMessage.toLowerCase().includes('contraseña') ||
    backendMessage.toLowerCase().includes('mayuscula') ||
    backendMessage.toLowerCase().includes('minuscula') ||
    backendMessage.toLowerCase().includes('numero') ||
    backendMessage.toLowerCase().includes('caracter especial')
  ) {
    this.passwordWarningMessage = backendMessage;

    if (this.passwordWarningTimeout) {
      clearTimeout(this.passwordWarningTimeout);
    }

    this.passwordWarningTimeout = setTimeout(() => {
      this.passwordWarningMessage = '';
    }, 3500);
  } else {
    this.modalErrorMessage = backendMessage;
  }

  this.saving = false;
}
    });
  }
}

  changeStatus(usuario: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el usuario ${usuario.username}?`);

    if (!confirmado) return;

    this.usuarioService.changeStatus(usuario.id_usuario, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadUsuarios();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del usuario';
      }
    });
  }

  openRolesModal(usuario: any): void {
    this.selectedUsuario = usuario;
    this.selectedRoles = (usuario.roles || []).map((r: any) => r.id_rol);
    this.showRolesModal = true;
  }

  closeRolesModal(): void {
    this.showRolesModal = false;
    this.selectedUsuario = null;
    this.selectedRoles = [];
  }

  toggleRol(idRol: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedRoles.includes(idRol)) {
        this.selectedRoles.push(idRol);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter((id) => id !== idRol);
    }
  }

  saveRoles(): void {
    if (!this.selectedUsuario) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.usuarioService.assignRoles(this.selectedUsuario.id_usuario, this.selectedRoles).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Roles asignados correctamente';
        this.loadUsuarios();
        this.closeRolesModal();
        this.saving = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al asignar roles';
        this.saving = false;
      }
    });
  }

  isRolSelected(idRol: number): boolean {
    return this.selectedRoles.includes(idRol);
  }

  onCreateRoleChange(idRol: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedRoles.includes(idRol)) {
        this.selectedRoles.push(idRol);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter((id) => id !== idRol);
    }
  }

  getRolesText(usuario: any): string {
    if (!usuario?.roles?.length) {
      return 'Sin roles';
    }

    return usuario.roles.map((r: any) => r.nombre).join(', ');
  }

  getEmpleadoText(usuario: any): string {
    if (!usuario?.empleado) {
      return 'Sin empleado';
    }

    return `${usuario.empleado.nombre} ${usuario.empleado.apellidos}`;
  }

  isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  showTemporaryPasswordWarning(): void {
    this.passwordWarningMessage =
      'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

    if (this.passwordWarningTimeout) {
      clearTimeout(this.passwordWarningTimeout);
    }

    this.passwordWarningTimeout = setTimeout(() => {
      this.passwordWarningMessage = '';
    }, 3500);
  }

  clearPasswordWarning(): void {
    this.passwordWarningMessage = '';

    if (this.passwordWarningTimeout) {
      clearTimeout(this.passwordWarningTimeout);
      this.passwordWarningTimeout = null;
    }
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.selectedRoles = [];
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
    this.clearPasswordWarning();
    this.saving = false;
  }
}
