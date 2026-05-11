import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MascotaService } from '../../../core/services/mascota.service';
import { ClienteService } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.scss'
})
export class MascotasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mascotaService = inject(MascotaService);
  private clienteService = inject(ClienteService);

  mascotas: any[] = [];
  mascotasFiltradas: any[] = [];
  clientes: any[] = [];

  loading = false;
  saving = false;
  showModal = false;

  editingId: number | null = null;

  errorMessage = '';
  successMessage = '';

  filtrosMascotasForm = this.fb.group({
    texto: ['']
  });

  form = this.fb.group({
    id_cliente: ['', Validators.required],
    nombre: ['', Validators.required],
    especie: ['', Validators.required],
    raza: [''],
    sexo: [''],
    fecha_nacimiento: [''],
    color: [''],
    peso: ['']
  });

  ngOnInit(): void {
    this.loadMascotas();
    this.loadClientes();

    this.filtrosMascotasForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosMascotas();
    });
  }

  loadMascotas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.mascotaService.getMascotas().subscribe({
      next: (response) => {
        this.mascotas = response?.data || [];
        this.mascotasFiltradas = [...this.mascotas];
        this.loading = false;
        this.aplicarFiltrosMascotas();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar mascotas';
        this.loading = false;
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (response) => {
        this.clientes = response?.data || [];
      },
      error: () => {
        this.clientes = [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(mascota: any): void {
    this.editingId = mascota.id_mascota;

    this.form.patchValue({
      id_cliente: String(mascota.id_cliente || mascota.cliente?.id_cliente || ''),
      nombre: mascota.nombre || '',
      especie: this.getEspecieText(mascota),
      raza: this.getRazaText(mascota),
      sexo: mascota.sexo || '',
      fecha_nacimiento: this.getFechaNacimientoInput(mascota),
      color: mascota.color || '',
      peso: mascota.peso !== null && mascota.peso !== undefined ? String(mascota.peso) : ''
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

    const formData = new FormData();

    formData.append('id_cliente', String(this.form.value.id_cliente || ''));
    formData.append('nombre', this.form.value.nombre || '');
    formData.append('especie', this.form.value.especie || '');
    formData.append('raza', this.form.value.raza || '');
    formData.append('sexo', this.form.value.sexo || '');
    formData.append('color', this.form.value.color || '');

    if (this.form.value.fecha_nacimiento) {
      formData.append('fecha_nacimiento', this.form.value.fecha_nacimiento);
    }

    if (this.form.value.peso) {
      formData.append('peso', String(this.form.value.peso));
    }

    if (this.editingId) {
      this.mascotaService.updateMascota(this.editingId, formData).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Mascota actualizada correctamente';
          this.loadMascotas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al actualizar mascota';
          this.saving = false;
        }
      });
    } else {
      this.mascotaService.createMascota(formData).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Mascota registrada correctamente';
          this.loadMascotas();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al registrar mascota';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(mascota: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} la mascota ${mascota.nombre}?`);

    if (!confirmado) return;

    this.mascotaService.changeStatus(mascota.id_mascota, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadMascotas();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado de la mascota';
      }
    });
  }

  aplicarFiltrosMascotas(): void {
    const texto = this.normalizarTexto(this.filtrosMascotasForm.value.texto || '');

    this.mascotasFiltradas = this.mascotas.filter((mascota: any) => {
      const cliente = this.getClienteText(mascota);
      const textoCliente = this.normalizarTexto(cliente);

      return !texto || textoCliente.includes(texto);
    });
  }

  limpiarFiltrosMascotas(): void {
    this.filtrosMascotasForm.reset({
      texto: ''
    });

    this.mascotasFiltradas = [...this.mascotas];
  }

  getClienteText(mascota: any): string {
    return `${mascota?.cliente?.nombre || ''} ${mascota?.cliente?.apellidos || ''}`.trim() || '-';
  }

  getEspecieText(mascota: any): string {
    if (!mascota) return '';

    if (typeof mascota.especie === 'string') {
      return mascota.especie;
    }

    return (
      mascota?.especie?.nombre ||
      mascota?.Especie?.nombre ||
      mascota?.nombre_especie ||
      mascota?.tipo_especie ||
      ''
    );
  }

  getRazaText(mascota: any): string {
    if (!mascota) return '';

    if (typeof mascota.raza === 'string') {
      return mascota.raza;
    }

    return (
      mascota?.raza?.nombre ||
      mascota?.Raza?.nombre ||
      mascota?.razaMascota?.nombre ||
      mascota?.raza_mascota?.nombre ||
      mascota?.nombre_raza ||
      mascota?.descripcion_raza ||
      ''
    );
  }

  getFechaNacimientoInput(mascota: any): string {
    const fecha = mascota?.fecha_nacimiento;

    if (!fecha) return '';

    return String(fecha).substring(0, 10);
  }

  private normalizarTexto(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  resetForm(): void {
    this.form.reset({
      id_cliente: '',
      nombre: '',
      especie: '',
      raza: '',
      sexo: '',
      fecha_nacimiento: '',
      color: '',
      peso: ''
    });

    this.editingId = null;
  }
}
