import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CierreCajaService } from '../../../core/services/cierre-caja.service';
import { AperturaCajaService } from '../../../core/services/apertura-caja.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cierre-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cierre-caja.component.html',
  styleUrl: './cierre-caja.component.scss'
})
export class CierreCajaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cierreCajaService = inject(CierreCajaService);
  private aperturaCajaService = inject(AperturaCajaService);
  private authService = inject(AuthService);

  cierres: any[] = [];
  aperturasAbiertas: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;

  currentUser = this.authService.getUser();

  form = this.fb.group({
    id_apertura_caja: ['', Validators.required],
    monto_final: [0, [Validators.required, Validators.min(0)]],
    observacion: ['']
  });

  ngOnInit(): void {
    this.loadCierres();
    this.loadAperturasAbiertas();
  }

  loadCierres(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cierreCajaService.getCierresCaja().subscribe({
      next: (response) => {
        this.cierres = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar cierres de caja';
        this.loading = false;
      }
    });
  }

  loadAperturasAbiertas(): void {
    this.aperturaCajaService.getAperturasCaja().subscribe({
      next: (response) => {
        this.aperturasAbiertas = (response?.data || []).filter(
          (apertura: any) => apertura.estado === 'ABIERTA'
        );
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
      id_apertura_caja: Number(this.form.value.id_apertura_caja),
      id_empleado: idEmpleado,
      monto_final: Number(this.form.value.monto_final || 0),
      observacion: this.form.value.observacion
    };

    this.cierreCajaService.createCierreCaja(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Cierre de caja registrado correctamente';
        this.loadCierres();
        this.loadAperturasAbiertas();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        this.modalErrorMessage = error?.error?.message || 'Error al registrar cierre de caja';
        this.saving = false;
      }
    });
  }

  getCajaText(cierre: any): string {
    return cierre?.apertura?.caja?.nombre || '-';
  }

  getEmpleadoAperturaText(cierre: any): string {
    const nombre = cierre?.apertura?.empleado?.nombre || '';
    const apellidos = cierre?.apertura?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getEmpleadoCierreText(cierre: any): string {
    const nombre = cierre?.empleado?.nombre || '';
    const apellidos = cierre?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getEmpleadoSesionText(): string {
    const nombre = this.currentUser?.empleado?.nombre || '';
    const apellidos = this.currentUser?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim();
  }

  getAperturaOptionText(apertura: any): string {
    return `#${apertura.id_apertura_caja} - ${apertura?.caja?.nombre || 'Caja'} - ${apertura.fecha_apertura}`;
  }

  resetForm(): void {
    this.form.reset({
      id_apertura_caja: '',
      monto_final: 0,
      observacion: ''
    });
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
