import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProveedorService } from '../../../core/services/proveedor.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);

  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];

  loading = false;
  saving = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  showModal = false;

  filtrosProveedoresForm = this.fb.group({
    texto: ['']
  });

  form = this.fb.group({
    nombre: ['', Validators.required],
    nit: [''],
    telefono: [''],
    correo: [''],
    direccion: ['']
  });

  ngOnInit(): void {
    this.loadProveedores();

    this.filtrosProveedoresForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosProveedores();
    });
  }

  loadProveedores(): void {
    this.loading = true;
    this.errorMessage = '';

    this.proveedorService.getProveedores().subscribe({
      next: (response) => {
        this.proveedores = response?.data || [];
        this.proveedoresFiltrados = [...this.proveedores];
        this.loading = false;
        this.aplicarFiltrosProveedores();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar proveedores';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(proveedor: any): void {
    this.editingId = proveedor.id_proveedor;

    this.form.patchValue({
      nombre: proveedor.nombre || '',
      nit: proveedor.nit || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || ''
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
      this.proveedorService.updateProveedor(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Proveedor actualizado correctamente';
          this.loadProveedores();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al actualizar proveedor';
          this.saving = false;
        }
      });
    } else {
      this.proveedorService.createProveedor(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Proveedor registrado correctamente';
          this.loadProveedores();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al registrar proveedor';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(proveedor: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el proveedor ${proveedor.nombre}?`);

    if (!confirmado) return;

    this.proveedorService.changeStatus(proveedor.id_proveedor, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadProveedores();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del proveedor';
      }
    });
  }

  aplicarFiltrosProveedores(): void {
    const texto = this.normalizarTexto(this.filtrosProveedoresForm.value.texto || '');

    this.proveedoresFiltrados = this.proveedores.filter((proveedor: any) => {
      const proveedorTexto = this.normalizarTexto(proveedor?.nombre || '');

      return !texto || proveedorTexto.includes(texto);
    });
  }

  limpiarFiltrosProveedores(): void {
    this.filtrosProveedoresForm.reset({
      texto: ''
    });

    this.proveedoresFiltrados = [...this.proveedores];
  }

  private normalizarTexto(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}
