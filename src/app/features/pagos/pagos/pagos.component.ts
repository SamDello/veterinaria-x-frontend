import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PagoService } from '../../../core/services/pago.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss'
})
export class PagosComponent implements OnInit {
  private pagoService = inject(PagoService);
  private fb = inject(FormBuilder);

  pagos: any[] = [];
  pagosFiltrados: any[] = [];

  loading = false;
  qrLoading = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';
  modalSuccessMessage = '';

  showDetailModal = false;
  selectedPago: any = null;

  filtroForm = this.fb.group({
    texto: ['']
  });

  ngOnInit(): void {
    this.loadPagos();

    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  loadPagos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.pagoService.getPagos().subscribe({
      next: (response) => {
        this.pagos = response?.data || [];
        this.pagosFiltrados = [...this.pagos];
        this.loading = false;
        this.aplicarFiltros();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar pagos';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.filtroForm.value.texto || '');

    this.pagosFiltrados = this.pagos.filter((pago: any) => {
      const cliente = `${pago?.venta?.cliente?.nombre || ''} ${pago?.venta?.cliente?.apellidos || ''}`;
      const empleado = `${pago?.venta?.empleado?.nombre || ''} ${pago?.venta?.empleado?.apellidos || ''}`;

      const textoPago = this.normalizarTexto(`
        ${cliente}
        ${empleado}
      `);

      return !texto || textoPago.includes(texto);
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      texto: ''
    });

    this.pagosFiltrados = [...this.pagos];
  }

  openDetailModal(pago: any): void {
    this.selectedPago = pago;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPago = null;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
  }

  consultarEstadoQr(): void {
    if (!this.selectedPago?.venta?.id_venta) return;

    this.qrLoading = true;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';

    this.pagoService.consultarEstadoQrVenta(this.selectedPago.venta.id_venta).subscribe({
      next: (response) => {
        this.modalSuccessMessage = response?.message || 'Estado QR consultado correctamente';
        this.loadPagos();

        this.pagoService.getPagoById(this.selectedPago.id_pago).subscribe({
          next: (detalleResponse) => {
            this.selectedPago = detalleResponse?.data || this.selectedPago;
            this.qrLoading = false;
          },
          error: () => {
            this.qrLoading = false;
          }
        });
      },
      error: (error) => {
        const detail = error?.error?.detail;

        this.modalErrorMessage =
          detail?.mensaje ||
          detail?.message ||
          error?.error?.message ||
          'Error al consultar estado del QR';

        this.qrLoading = false;
      }
    });
  }

  consultarEstadoQrDesdeTabla(pago: any): void {
    const idVenta = pago?.venta?.id_venta || pago?.id_venta;

    if (!idVenta) {
      this.errorMessage = 'No se encontró la venta relacionada al pago.';
      return;
    }

    this.qrLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pagoService.consultarEstadoQrVenta(idVenta).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado QR consultado correctamente.';
        this.qrLoading = false;
        this.loadPagos();
      },
      error: (error) => {
        const detail = error?.error?.detail;

        this.errorMessage =
          detail?.mensaje ||
          detail?.message ||
          error?.error?.message ||
          'Error al consultar estado del QR.';

        this.qrLoading = false;
      }
    });
  }

  esPagoQr(pago: any): boolean {
    return (
      pago?.metodoPago?.nombre === 'QR_LIBELULA' ||
      !!pago?.pagoQrLibelula
    );
  }

  getClienteText(pago: any): string {
    return `${pago?.venta?.cliente?.nombre || ''} ${pago?.venta?.cliente?.apellidos || ''}`.trim() || '-';
  }

  getEmpleadoText(pago: any): string {
    return `${pago?.venta?.empleado?.nombre || ''} ${pago?.venta?.empleado?.apellidos || ''}`.trim() || '-';
  }

  getMetodoText(pago: any): string {
    return pago?.metodoPago?.nombre || '-';
  }

  getEstadoQrText(pago: any): string {
    return pago?.pagoQrLibelula?.estado_libelula || '-';
  }

  getQrPaymentUrl(pago: any): string {
    return (
      pago?.pagoQrLibelula?.payment_url ||
      pago?.pagoQrLibelula?.respuesta_creacion?.url_pasarela_pagos ||
      ''
    );
  }

  getQrImageUrl(pago: any): string {
    return (
      pago?.pagoQrLibelula?.qr_url ||
      pago?.pagoQrLibelula?.respuesta_creacion?.qr_simple_url ||
      ''
    );
  }

  private normalizarTexto(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
