import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  clientes: any[] = [];
  loading = false;
  saving = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  showModal = false;

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellidos: [''],
    ci_nit: [''],
    telefono: [''],
    correo: [''],
    direccion: ['']
  });

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clienteService.getClientes().subscribe({
      next: (response) => {
        this.clientes = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar clientes';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(cliente: any): void {
    this.editingId = cliente.id_cliente;
    this.form.patchValue({
      nombre: cliente.nombre || '',
      apellidos: cliente.apellidos || '',
      ci_nit: cliente.ci_nit || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || ''
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
      this.clienteService.updateCliente(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Cliente actualizado correctamente';
          this.loadClientes();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al actualizar cliente';
          this.saving = false;
        }
      });
    } else {
      this.clienteService.createCliente(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Cliente registrado correctamente';
          this.loadClientes();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al registrar cliente';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(cliente: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} al cliente ${cliente.nombre}?`);

    if (!confirmado) return;

    this.clienteService.changeStatus(cliente.id_cliente, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadClientes();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del cliente';
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}
