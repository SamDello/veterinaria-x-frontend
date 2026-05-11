import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AperturaCajaService } from '../../../core/services/apertura-caja.service';
import { CajaService } from '../../../core/services/caja.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-apertura-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apertura-caja.component.html',
  styleUrl: './apertura-caja.component.scss'
})
export class AperturaCajaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private aperturaCajaService = inject(AperturaCajaService);
  private cajaService = inject(CajaService);
  private authService = inject(AuthService);

  aperturas: any[] = [];
  cajas: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;

  currentUser = this.authService.getUser();

  form = this.fb.group({
    id_caja: ['', Validators.required],
    monto_inicial: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadAperturas();
    this.loadCajas();
  }

  loadAperturas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.aperturaCajaService.getAperturasCaja().subscribe({
      next: (response) => {
        this.aperturas = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar aperturas de caja';
        this.loading = false;
      }
    });
  }

  loadCajas(): void {
    this.cajaService.getCajas().subscribe({
      next: (response) => {
        this.cajas = (response?.data || []).filter((caja: any) => caja.estado);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
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

    const idEmpleado = this.currentUser?.empleado?.id_empleado;

    if (!idEmpleado) {
      this.modalErrorMessage = 'El usuario actual no tiene un empleado asociado.';
      return;
    }

    this.saving = true;

    const payload = {
      id_caja: Number(this.form.value.id_caja),
      id_empleado: idEmpleado,
      monto_inicial: Number(this.form.value.monto_inicial || 0)
    };

    this.aperturaCajaService.createAperturaCaja(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Apertura de caja registrada correctamente';
        this.loadAperturas();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        this.modalErrorMessage = error?.error?.message || 'Error al registrar apertura de caja';
        this.saving = false;
      }
    });
  }

  getCajaText(apertura: any): string {
    return apertura?.caja?.nombre || '-';
  }

  getEmpleadoText(apertura: any): string {
    const nombre = apertura?.empleado?.nombre || '';
    const apellidos = apertura?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  resetForm(): void {
    this.form.reset({
      id_caja: '',
      monto_inicial: 0
    });
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
