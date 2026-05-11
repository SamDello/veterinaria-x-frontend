import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReporteService } from '../../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);

  loading = false;
  sendingMail = false;
  exportingPdf = false;

  errorMessage = '';
  successMessage = '';
  mailErrorMessage = '';
  mailSuccessMessage = '';

  resultados: any[] = [];
  resumen: any = null;

  showMailModal = false;

  form = this.fb.group({
  tipo: ['ventas', Validators.required],
  fecha_inicio: [''],
  fecha_fin: [''],
  id_almacen: [''],
  stock_bajo: [false],
  id_mascota: [''],
  estado_pago: ['']
});

  mailForm = this.fb.group({
    correo: ['', [Validators.required]]
  });

  consultar(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.resultados = [];
    this.resumen = null;

    const tipo = this.form.value.tipo;
    const params = this.buildQueryParams();

    let request$;

    switch (tipo) {
      case 'ventas':
        request$ = this.reporteService.getReporteVentas(params);
        break;
      case 'compras':
        request$ = this.reporteService.getReporteCompras(params);
        break;
      case 'stock':
        request$ = this.reporteService.getReporteStock(params);
        break;
      case 'atenciones':
        request$ = this.reporteService.getReporteAtenciones(params);
        break;

      case 'pagos':
        request$ = this.reporteService.getReportePagos(params);
        break;
      default:
        this.errorMessage = 'Tipo de reporte no válido.';
        this.loading = false;
        return;
    }

    request$.subscribe({
      next: (response) => {
        this.resultados = response?.data || [];
        this.resumen = {
          total_registros: response?.total_registros || 0,
          total_ventas: response?.total_ventas || null,
          total_compras: response?.total_compras || null,
          total_pagos: response?.total_pagos || null,
          resumen_estados: response?.resumen_estados || null
        };
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al consultar reporte';
        this.loading = false;
      }
    });
  }

  limpiar(): void {
    this.form.reset({
      tipo: 'ventas',
      fecha_inicio: '',
      fecha_fin: '',
      id_almacen: '',
      stock_bajo: false,
      id_mascota: '',
      estado_pago: ''
    });

    this.resultados = [];
    this.resumen = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  exportarPdf(): void {
    this.exportingPdf = true;
    this.errorMessage = '';

    const tipo = this.form.value.tipo;
    const params = this.buildQueryParams();

    let request$;

    switch (tipo) {
      case 'ventas':
        request$ = this.reporteService.exportReporteVentasPdf(params);
        break;
      case 'compras':
        request$ = this.reporteService.exportReporteComprasPdf(params);
        break;
      case 'stock':
        request$ = this.reporteService.exportReporteStockPdf(params);
        break;
      case 'atenciones':
        request$ = this.reporteService.exportReporteAtencionesPdf(params);
        break;
      case 'pagos':
        request$ = this.reporteService.exportReportePagosPdf(params);
        break;
      default:
        this.errorMessage = 'Tipo de reporte no válido.';
        this.exportingPdf = false;
        return;
    }

    request$.subscribe({
      next: (blob) => {
        const tipoReporte = this.form.value.tipo || 'reporte';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `reporte-${tipoReporte}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url);
        this.exportingPdf = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al exportar PDF';
        this.exportingPdf = false;
      }
    });
  }

  openMailModal(): void {
    this.mailForm.reset({ correo: '' });
    this.mailErrorMessage = '';
    this.mailSuccessMessage = '';
    this.showMailModal = true;
  }

  closeMailModal(): void {
    this.showMailModal = false;
    this.mailForm.reset({ correo: '' });
    this.mailErrorMessage = '';
    this.mailSuccessMessage = '';
    this.sendingMail = false;
  }

  enviarCorreo(): void {
    this.mailErrorMessage = '';
    this.mailSuccessMessage = '';
    this.successMessage = '';

    if (this.mailForm.invalid) {
      this.mailForm.markAllAsTouched();
      return;
    }

    const correos = this.getCorreosDestino();

    if (correos.length === 0) {
      this.mailErrorMessage = 'Debe ingresar al menos un correo válido.';
      return;
    }

    if (this.tieneCorreosInvalidos(correos)) {
      this.mailErrorMessage = 'Revise los correos. Separe cada correo con coma.';
      return;
    }

    this.sendingMail = true;

    const tipo = this.form.value.tipo;

    const payload = {
      to: correos,
      subject: `Reporte de ${tipo} - Veterinaria X`,
      ...this.buildQueryParams()
    };

    let request$;

    switch (tipo) {
      case 'ventas':
        request$ = this.reporteService.sendReporteVentasMail(payload);
        break;
      case 'compras':
        request$ = this.reporteService.sendReporteComprasMail(payload);
        break;
      case 'stock':
        request$ = this.reporteService.sendReporteStockMail(payload);
        break;
      case 'atenciones':
        request$ = this.reporteService.sendReporteAtencionesMail(payload);
        break;
      case 'pagos':
        request$ = this.reporteService.sendReportePagosMail(payload);
        break;
      default:
        this.mailErrorMessage = 'Tipo de reporte no válido.';
        this.sendingMail = false;
        return;
    }

    request$.subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Reporte enviado correctamente por correo.';
        this.sendingMail = false;
        this.closeMailModal();
      },
      error: (error) => {
        this.mailErrorMessage =
          error?.error?.message ||
          error?.error?.errors?.[0]?.msg ||
          'Error al enviar reporte por correo';

        this.sendingMail = false;
      }
    });
  }

  getCorreosDestino(): string[] {
    const valor = this.mailForm.value.correo || '';

    return valor
      .split(',')
      .map((correo) => correo.trim())
      .filter((correo) => correo.length > 0);
  }

  tieneCorreosInvalidos(correos: string[]): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return correos.some((correo) => !emailRegex.test(correo));
  }

  buildQueryParams(): any {
    return {
      fecha_inicio: this.form.value.fecha_inicio || '',
      fecha_fin: this.form.value.fecha_fin || '',
      id_almacen: this.form.value.id_almacen || '',
      stock_bajo: this.form.value.stock_bajo ? 'true' : '',
      id_mascota: this.form.value.id_mascota || '',
      estado_pago: this.form.value.estado_pago || ''
    };
  }

  isVentas(): boolean {
    return this.form.value.tipo === 'ventas';
  }

  isCompras(): boolean {
    return this.form.value.tipo === 'compras';
  }

  isStock(): boolean {
    return this.form.value.tipo === 'stock';
  }

  isAtenciones(): boolean {
    return this.form.value.tipo === 'atenciones';
  }

  isPagos(): boolean {
  return this.form.value.tipo === 'pagos';
}
}
