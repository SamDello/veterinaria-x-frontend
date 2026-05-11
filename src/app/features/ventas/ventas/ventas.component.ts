import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { VentaService } from '../../../core/services/venta.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);

  ventas: any[] = [];
  ventasFiltradas: any[] = [];

  clientes: any[] = [];
  productos: any[] = [];

  mascotasCliente: any[] = [];
  atencionesPendientes: any[] = [];
  atencionSeleccionada: any = null;
  detalleServiciosAtencion: any[] = [];
  subtotalServicios = 0;
  totalServicios = 0;

  loading = false;
  saving = false;
  qrLoading = false;

  pageErrorMessage = '';
  pageSuccessMessage = '';

  productosErrorMessage = '';
  productosSuccessMessage = '';

  serviciosErrorMessage = '';
  serviciosSuccessMessage = '';

  qrErrorMessage = '';
  qrSuccessMessage = '';

  showProductosModal = false;
  showServiciosModal = false;
  showQrModal = false;

  selectedVentaQr: any = null;
  qrData: any = null;

  stockAlmacenesPorDetalle: any[][] = [];
  stockDisponiblePorDetalle: (number | null)[] = [];
  stockLoadingPorDetalle: boolean[] = [];
  stockMensajePorDetalle: string[] = [];

  private qrPollingTimer: ReturnType<typeof setInterval> | null = null;
  private qrPollingIntentos = 0;
  private readonly qrPollingMaxIntentos = 120;
  private readonly qrPollingIntervalMs = 3000;

  currentUser = this.authService.getUser();

  filtrosVentasForm = this.fb.group({
    texto: ['']
  });

  productosForm = this.fb.group({
    id_cliente: ['', Validators.required],
    observacion: [''],
    descuento: [0],
    productos: this.fb.array([])
  });

  serviciosForm = this.fb.group({
    id_cliente: ['', Validators.required],
    id_mascota: ['', Validators.required],
    id_atencion: ['', Validators.required],
    observacion: [''],
    descuento: [0]
  });

  ngOnInit(): void {
    this.loadVentas();
    this.loadClientes();
    this.loadProductos();

    this.filtrosVentasForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosVentas();
    });

    this.serviciosForm.get('id_cliente')?.valueChanges.subscribe((value) => {
      this.onClienteServicioChange(value);
    });

    this.serviciosForm.get('id_mascota')?.valueChanges.subscribe((value) => {
      this.onMascotaServicioChange(value);
    });

    this.serviciosForm.get('id_atencion')?.valueChanges.subscribe((value) => {
      this.onAtencionServicioChange(value);
    });

    this.serviciosForm.get('descuento')?.valueChanges.subscribe(() => {
      this.recalcularTotalServicios();
    });
  }

  ngOnDestroy(): void {
    this.stopQrPolling();
  }

  get productosArray(): FormArray {
    return this.productosForm.get('productos') as FormArray;
  }

  createProductoDetalleForm(): any {
    return this.fb.group({
      id_producto: ['', Validators.required],
      id_almacen: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addProductoDetalle(): void {
    this.productosArray.push(this.createProductoDetalleForm());

    this.stockAlmacenesPorDetalle.push([]);
    this.stockDisponiblePorDetalle.push(null);
    this.stockLoadingPorDetalle.push(false);
    this.stockMensajePorDetalle.push('');
  }

  removeProductoDetalle(index: number): void {
    this.productosArray.removeAt(index);

    this.stockAlmacenesPorDetalle.splice(index, 1);
    this.stockDisponiblePorDetalle.splice(index, 1);
    this.stockLoadingPorDetalle.splice(index, 1);
    this.stockMensajePorDetalle.splice(index, 1);
  }

  loadVentas(): void {
    this.loading = true;
    this.pageErrorMessage = '';

    this.ventaService.getVentas().subscribe({
      next: (response) => {
        this.ventas = response?.data || [];
        this.ventasFiltradas = [...this.ventas];
        this.loading = false;
        this.aplicarFiltrosVentas();
      },
      error: (error) => {
        this.pageErrorMessage = error?.error?.message || 'Error al cargar ventas';
        this.loading = false;
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (response) => {
        this.clientes = response?.data || [];
      }
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = response?.data || [];
      }
    });
  }

  onProductoChange(index: number): void {
    const detalle = this.productosArray.at(index);
    const idProducto = Number(detalle.get('id_producto')?.value);

    detalle.patchValue({
      id_almacen: ''
    });

    this.stockAlmacenesPorDetalle[index] = [];
    this.stockDisponiblePorDetalle[index] = null;
    this.stockMensajePorDetalle[index] = '';

    const productoSeleccionado = this.productos.find(
      (p: any) => Number(p.id_producto) === idProducto
    );

    if (productoSeleccionado) {
      detalle.patchValue({
        precio_unitario: Number(productoSeleccionado.precio_venta || 0)
      });
    }

    if (!idProducto) {
      return;
    }

    this.stockLoadingPorDetalle[index] = true;

    this.ventaService.getStockAlmacenesByProducto(idProducto).subscribe({
      next: (response) => {
        const almacenesStock = response?.data || [];

        this.stockAlmacenesPorDetalle[index] = almacenesStock;
        this.stockLoadingPorDetalle[index] = false;

        const tieneStock = almacenesStock.some((item: any) => Number(item.stock_actual || 0) > 0);

        if (!tieneStock) {
          this.stockMensajePorDetalle[index] = 'Este producto no tiene stock disponible en ningún almacén.';
        }
      },
      error: (error) => {
        this.stockAlmacenesPorDetalle[index] = [];
        this.stockDisponiblePorDetalle[index] = null;
        this.stockLoadingPorDetalle[index] = false;
        this.stockMensajePorDetalle[index] =
          error?.error?.message || 'Error al consultar stock del producto.';
      }
    });
  }

  onAlmacenProductoChange(index: number): void {
    this.actualizarStockDisponibleDetalle(index);
    this.validarStockDetalle(index);
  }

  onCantidadProductoChange(index: number): void {
    this.validarStockDetalle(index);
  }

  actualizarStockDisponibleDetalle(index: number): void {
    const detalle = this.productosArray.at(index);
    const idAlmacen = Number(detalle.get('id_almacen')?.value);

    this.stockDisponiblePorDetalle[index] = null;
    this.stockMensajePorDetalle[index] = '';

    if (!idAlmacen) {
      return;
    }

    const stockSeleccionado = this.stockAlmacenesPorDetalle[index]?.find((item: any) => {
      return Number(item.id_almacen) === idAlmacen;
    });

    const stockActual = Number(stockSeleccionado?.stock_actual || 0);

    this.stockDisponiblePorDetalle[index] = stockActual;

    if (stockActual <= 0) {
      this.stockMensajePorDetalle[index] = 'No hay stock disponible en este almacén.';
    }
  }

  validarStockDetalle(index: number): boolean {
    const detalle = this.productosArray.at(index);
    const idProducto = Number(detalle.get('id_producto')?.value);
    const idAlmacen = Number(detalle.get('id_almacen')?.value);
    const cantidad = Number(detalle.get('cantidad')?.value || 0);
    const stockDisponible = this.stockDisponiblePorDetalle[index];

    this.stockMensajePorDetalle[index] = '';

    if (!idProducto) {
      return false;
    }

    if (!idAlmacen) {
      this.stockMensajePorDetalle[index] = 'Seleccione un almacén para este producto.';
      return false;
    }

    if (stockDisponible === null || stockDisponible === undefined) {
      this.actualizarStockDisponibleDetalle(index);
      return false;
    }

    if (stockDisponible <= 0) {
      this.stockMensajePorDetalle[index] = 'No hay stock disponible en este almacén.';
      return false;
    }

    if (cantidad <= 0) {
      this.stockMensajePorDetalle[index] = 'La cantidad debe ser mayor a cero.';
      return false;
    }

    if (cantidad > stockDisponible) {
      this.stockMensajePorDetalle[index] =
        `Stock insuficiente. Disponible: ${stockDisponible}. Solicitado: ${cantidad}.`;
      return false;
    }

    return true;
  }

  validarStockProductosAntesEnviar(): boolean {
    let valido = true;

    for (let i = 0; i < this.productosArray.length; i++) {
      const detalleValido = this.validarStockDetalle(i);

      if (!detalleValido) {
        valido = false;
      }
    }

    if (!valido) {
      this.productosErrorMessage = 'Revise el stock de los productos antes de registrar la venta.';
    }

    return valido;
  }

  onClienteServicioChange(value: any): void {
    const idCliente = Number(value || 0);

    this.mascotasCliente = [];
    this.atencionesPendientes = [];
    this.atencionSeleccionada = null;
    this.detalleServiciosAtencion = [];
    this.subtotalServicios = 0;
    this.totalServicios = 0;

    this.serviciosForm.patchValue(
      {
        id_mascota: '',
        id_atencion: ''
      },
      { emitEvent: false }
    );

    if (!idCliente) return;

    this.ventaService.getMascotasByCliente(idCliente).subscribe({
      next: (response) => {
        this.mascotasCliente = response?.data || [];
      },
      error: () => {
        this.mascotasCliente = [];
      }
    });
  }

  onMascotaServicioChange(value: any): void {
    const idMascota = Number(value || 0);

    this.atencionesPendientes = [];
    this.atencionSeleccionada = null;
    this.detalleServiciosAtencion = [];
    this.subtotalServicios = 0;
    this.totalServicios = 0;

    this.serviciosForm.patchValue(
      {
        id_atencion: ''
      },
      { emitEvent: false }
    );

    if (!idMascota) return;

    this.ventaService.getAtencionesPendientesByMascota(idMascota).subscribe({
      next: (response) => {
        this.atencionesPendientes = response?.data || [];
      },
      error: () => {
        this.atencionesPendientes = [];
      }
    });
  }

  onAtencionServicioChange(value: any): void {
    const idAtencion = Number(value || 0);

    this.atencionSeleccionada =
      this.atencionesPendientes.find((a: any) => a.id_atencion === idAtencion) || null;

    if (!this.atencionSeleccionada) {
      this.detalleServiciosAtencion = [];
      this.subtotalServicios = 0;
      this.totalServicios = 0;
      return;
    }

    this.detalleServiciosAtencion = this.atencionSeleccionada.servicios || [];

    this.subtotalServicios = this.detalleServiciosAtencion.reduce((acc: number, item: any) => {
      return acc + Number(item.AtencionServicio?.subtotal || 0);
    }, 0);

    this.recalcularTotalServicios();
  }

  recalcularTotalServicios(): void {
    const descuento = Number(this.serviciosForm.value.descuento || 0);
    this.totalServicios = this.subtotalServicios - descuento;

    if (this.totalServicios < 0) {
      this.totalServicios = 0;
    }
  }

  openProductosModal(): void {
    this.resetProductosForm();
    this.productosErrorMessage = '';
    this.productosSuccessMessage = '';
    this.addProductoDetalle();
    this.showProductosModal = true;
  }

  closeProductosModal(): void {
    this.showProductosModal = false;
    this.productosErrorMessage = '';
    this.productosSuccessMessage = '';
    this.resetProductosForm();
  }

  openServiciosModal(): void {
    this.resetServiciosForm();
    this.serviciosErrorMessage = '';
    this.serviciosSuccessMessage = '';
    this.showServiciosModal = true;
  }

  closeServiciosModal(): void {
    this.showServiciosModal = false;
    this.serviciosErrorMessage = '';
    this.serviciosSuccessMessage = '';
    this.resetServiciosForm();
  }

  openQrModal(venta: any): void {
    this.stopQrPolling();
    this.selectedVentaQr = venta;
    this.qrData = null;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';
    this.showQrModal = true;
  }

  closeQrModal(): void {
    this.stopQrPolling();
    this.showQrModal = false;
    this.selectedVentaQr = null;
    this.qrData = null;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';
  }

  pagarEfectivo(): void {
    if (!this.selectedVentaQr) return;

    this.qrLoading = true;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';

    this.ventaService.pagarVentaEfectivo(this.selectedVentaQr.id_venta).subscribe({
      next: (response) => {
        const idVenta = this.selectedVentaQr?.id_venta;

        this.qrLoading = false;
        this.showQrModal = false;
        this.selectedVentaQr = null;
        this.qrData = null;
        this.qrErrorMessage = '';
        this.qrSuccessMessage = '';

        this.pageSuccessMessage =
          response?.message || `Pago en efectivo de venta #${idVenta} registrado correctamente.`;

        this.loadVentas();
      },
      error: (error) => {
        this.qrErrorMessage =
          error?.error?.message || 'Error al registrar pago en efectivo.';
        this.qrLoading = false;
      }
    });
  }

  anularPagoVenta(): void {
    if (!this.selectedVentaQr) return;

    this.qrLoading = true;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';

    this.ventaService.anularPagoVenta(this.selectedVentaQr.id_venta).subscribe({
      next: (response) => {
        const idVenta = this.selectedVentaQr?.id_venta;

        this.qrLoading = false;
        this.showQrModal = false;
        this.selectedVentaQr = null;
        this.qrData = null;
        this.qrErrorMessage = '';
        this.qrSuccessMessage = '';

        this.pageSuccessMessage =
          response?.message || `Pago de venta #${idVenta} anulado correctamente.`;

        this.loadVentas();
      },
      error: (error) => {
        this.qrErrorMessage =
          error?.error?.message || 'Error al anular el pago.';
        this.qrLoading = false;
      }
    });
  }

  generarQr(): void {
    if (!this.selectedVentaQr) return;

    this.qrLoading = true;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';

    this.ventaService.generarQrVenta(this.selectedVentaQr.id_venta).subscribe({
      next: (response) => {
        this.qrData = response?.data || null;
        this.qrSuccessMessage = response?.message || 'QR generado correctamente';
        this.qrLoading = false;

        if (this.isQrPagado(response?.data)) {
          this.finalizarPagoQrConfirmado();
          return;
        }

        this.startQrPolling();
      },
      error: (error) => {
        this.qrErrorMessage = error?.error?.message || 'Error al generar QR';
        this.qrLoading = false;
      }
    });
  }

  consultarEstadoQr(): void {
    if (!this.selectedVentaQr) return;

    this.qrLoading = true;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';

    this.ventaService.consultarEstadoQrVenta(this.selectedVentaQr.id_venta).subscribe({
      next: (response) => {
        this.qrData = response?.data || null;
        this.qrSuccessMessage = response?.message || 'Estado consultado correctamente';
        this.loadVentas();
        this.qrLoading = false;

        if (this.isQrPagado(response?.data)) {
          this.finalizarPagoQrConfirmado();
        }
      },
      error: (error) => {
        this.qrErrorMessage = error?.error?.message || 'Error al consultar estado del QR';
        this.qrLoading = false;
      }
    });
  }

  submitVentaProductos(): void {
    if (this.productosForm.invalid || this.productosArray.length === 0) {
      this.productosForm.markAllAsTouched();
      return;
    }

    if (!this.validarStockProductosAntesEnviar()) {
      return;
    }

    this.saving = true;
    this.productosErrorMessage = '';
    this.productosSuccessMessage = '';
    this.pageErrorMessage = '';

    const payload = {
      id_cliente: Number(this.productosForm.value.id_cliente),
      id_empleado: this.currentUser?.empleado?.id_empleado,
      observacion: this.productosForm.value.observacion,
      descuento: Number(this.productosForm.value.descuento || 0),
      productos: this.productosArray.getRawValue().map((item: any) => ({
        id_producto: Number(item.id_producto),
        id_almacen: Number(item.id_almacen),
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario)
      }))
    };

    this.ventaService.createVentaProductos(payload).subscribe({
      next: (response) => {
        this.productosSuccessMessage =
          response?.message || 'Venta de productos registrada correctamente';
        this.pageSuccessMessage = this.productosSuccessMessage;
        this.loadVentas();
        this.closeProductosModal();
        this.saving = false;
      },
      error: (error) => {
        this.productosErrorMessage =
          error?.error?.message || 'Error al registrar venta de productos';
        this.saving = false;
      }
    });
  }

  submitVentaServicios(): void {
    if (this.serviciosForm.invalid) {
      this.serviciosForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.serviciosErrorMessage = '';
    this.serviciosSuccessMessage = '';
    this.pageErrorMessage = '';

    const payload = {
      id_cliente: Number(this.serviciosForm.value.id_cliente),
      id_empleado: this.currentUser?.empleado?.id_empleado,
      id_atencion: Number(this.serviciosForm.value.id_atencion),
      observacion: this.serviciosForm.value.observacion,
      descuento: Number(this.serviciosForm.value.descuento || 0)
    };

    this.ventaService.createVentaServicios(payload).subscribe({
      next: (response) => {
        this.serviciosSuccessMessage =
          response?.message || 'Venta de servicios registrada correctamente';
        this.pageSuccessMessage = this.serviciosSuccessMessage;
        this.loadVentas();
        this.closeServiciosModal();
        this.saving = false;
      },
      error: (error) => {
        this.serviciosErrorMessage =
          error?.error?.message || 'Error al registrar venta de servicios';
        this.saving = false;
      }
    });
  }

  calcularSubtotal(detalle: any): number {
    return Number(detalle?.cantidad || 0) * Number(detalle?.precio_unitario || 0);
  }

  getTotalProductos(): number {
    const subtotal = this.productosArray.getRawValue().reduce((acc: number, item: any) => {
      return acc + (Number(item.cantidad) * Number(item.precio_unitario));
    }, 0);

    return subtotal - Number(this.productosForm.value.descuento || 0);
  }

  getDetalleServiciosVentaText(venta: any): string {
    const productos = Array.isArray(venta?.detalleProductos)
      ? venta.detalleProductos.map((item: any) => `${item.producto?.nombre || 'Producto'} x${item.cantidad}`)
      : [];

    const servicios = Array.isArray(venta?.detalleServicios)
      ? venta.detalleServicios.map((item: any) => `${item.servicio?.nombre || 'Servicio'} x${item.cantidad}`)
      : [];

    const detalle = [...productos, ...servicios];

    return detalle.length > 0 ? detalle.join(', ') : '-';
  }

  getQrPaymentUrl(): string {
    return (
      this.qrData?.pago_qr_libelula?.payment_url ||
      this.qrData?.respuesta_libelula?.url_pasarela_pagos ||
      this.qrData?.url_pasarela_pagos ||
      ''
    );
  }

  getQrImageUrl(): string {
    return (
      this.qrData?.pago_qr_libelula?.qr_url ||
      this.qrData?.respuesta_libelula?.qr_simple_url ||
      this.qrData?.qr_simple_url ||
      ''
    );
  }

  getQrBase64(): string {
    return (
      this.qrData?.pago_qr_libelula?.qr_base64 ||
      this.qrData?.qr_base64 ||
      ''
    );
  }

  getQrEstado(): string {
    return (
      this.qrData?.pago_qr_libelula?.estado_libelula ||
      this.qrData?.estado_libelula ||
      '-'
    );
  }

  aplicarFiltrosVentas(): void {
    const texto = this.normalizarTexto(this.filtrosVentasForm.value.texto || '');

    this.ventasFiltradas = this.ventas.filter((venta: any) => {
      const cliente = `${venta?.cliente?.nombre || ''} ${venta?.cliente?.apellidos || ''}`;
      const empleado = `${venta?.empleado?.nombre || ''} ${venta?.empleado?.apellidos || ''}`;

      const textoVenta = this.normalizarTexto(`
        ${cliente}
        ${empleado}
      `);

      return !texto || textoVenta.includes(texto);
    });
  }

  limpiarFiltrosVentas(): void {
    this.filtrosVentasForm.reset({
      texto: ''
    });

    this.ventasFiltradas = [...this.ventas];
  }

  private startQrPolling(): void {
    if (!this.selectedVentaQr?.id_venta) {
      return;
    }

    this.stopQrPolling();
    this.qrPollingIntentos = 0;

    this.qrPollingTimer = setInterval(() => {
      this.verificarPagoQrAutomaticamente();
    }, this.qrPollingIntervalMs);
  }

  private stopQrPolling(): void {
    if (this.qrPollingTimer) {
      clearInterval(this.qrPollingTimer);
      this.qrPollingTimer = null;
    }
  }

  private verificarPagoQrAutomaticamente(): void {
    if (!this.selectedVentaQr?.id_venta) {
      this.stopQrPolling();
      return;
    }

    this.qrPollingIntentos++;

    if (this.qrPollingIntentos > this.qrPollingMaxIntentos) {
      this.stopQrPolling();
      return;
    }

    this.ventaService.consultarEstadoQrLocalVenta(this.selectedVentaQr.id_venta).subscribe({
      next: (response) => {
        if (this.isQrPagado(response?.data)) {
          this.finalizarPagoQrConfirmado();
        }
      },
      error: () => {
        // Verificación automática silenciosa.
      }
    });
  }

  private isQrPagado(data: any): boolean {
    const estadoPago = String(
      data?.estado_pago ||
      data?.pago?.estado ||
      data?.pago_qr_libelula?.pago?.estado ||
      ''
    ).toUpperCase();

    const estadoLibelula = String(
      data?.estado_libelula ||
      data?.pago_qr_libelula?.estado_libelula ||
      ''
    ).toUpperCase();

    return estadoPago === 'PAGADO' || estadoLibelula === 'PAGADO';
  }

  private finalizarPagoQrConfirmado(): void {
    const idVenta = this.selectedVentaQr?.id_venta;

    this.stopQrPolling();
    this.showQrModal = false;
    this.selectedVentaQr = null;
    this.qrData = null;
    this.qrErrorMessage = '';
    this.qrSuccessMessage = '';

    this.pageSuccessMessage = idVenta
      ? `Pago QR de la venta #${idVenta} confirmado correctamente.`
      : 'Pago QR confirmado correctamente.';

    this.loadVentas();
  }

  private normalizarTexto(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  resetProductosForm(): void {
    this.productosForm.reset({
      id_cliente: '',
      observacion: '',
      descuento: 0
    });

    this.productosArray.clear();

    this.stockAlmacenesPorDetalle = [];
    this.stockDisponiblePorDetalle = [];
    this.stockLoadingPorDetalle = [];
    this.stockMensajePorDetalle = [];
  }

  resetServiciosForm(): void {
    this.serviciosForm.reset({
      id_cliente: '',
      id_mascota: '',
      id_atencion: '',
      observacion: '',
      descuento: 0
    });

    this.mascotasCliente = [];
    this.atencionesPendientes = [];
    this.atencionSeleccionada = null;
    this.detalleServiciosAtencion = [];
    this.subtotalServicios = 0;
    this.totalServicios = 0;
  }
}
