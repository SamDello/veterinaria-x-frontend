import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';

import { CompraService } from '../../../core/services/compra.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AlmacenService } from '../../../core/services/almacen.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss'
})
export class ComprasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private compraService = inject(CompraService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private almacenService = inject(AlmacenService);
  private authService = inject(AuthService);

  compras: any[] = [];
  comprasFiltradas: any[] = [];

  proveedores: any[] = [];
  productos: any[] = [];
  almacenes: any[] = [];

  loading = false;
  saving = false;
  showModal = false;
  errorMessage = '';
  successMessage = '';

  currentUser = this.authService.getUser();

  filtrosComprasForm = this.fb.group({
    texto: ['']
  });

  form = this.fb.group({
    id_proveedor: ['', Validators.required],
    id_almacen: ['', Validators.required],
    observacion: [''],
    detalles: this.fb.array([])
  });

  ngOnInit(): void {
    this.loadCompras();
    this.loadProveedores();
    this.loadProductos();
    this.loadAlmacenes();

    this.filtrosComprasForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosCompras();
    });
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  createDetalleForm(): any {
    return this.fb.group({
      id_producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costo_unitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleForm());
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  loadCompras(): void {
    this.loading = true;
    this.errorMessage = '';

    this.compraService.getCompras().subscribe({
      next: (response) => {
        this.compras = response?.data || [];
        this.comprasFiltradas = [...this.compras];
        this.loading = false;
        this.aplicarFiltrosCompras();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar compras';
        this.loading = false;
      }
    });
  }

  loadProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (response) => {
        this.proveedores = response?.data || [];
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

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = response?.data || [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.addDetalle();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submit(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      id_proveedor: Number(this.form.value.id_proveedor),
      id_empleado: this.currentUser?.empleado?.id_empleado,
      id_almacen: Number(this.form.value.id_almacen),
      observacion: this.form.value.observacion,
      detalles: this.detalles.getRawValue().map((item: any) => ({
        id_producto: Number(item.id_producto),
        cantidad: Number(item.cantidad),
        costo_unitario: Number(item.costo_unitario)
      }))
    };

    this.compraService.createCompra(payload).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Compra registrada correctamente';
        this.loadCompras();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al registrar compra';
        this.saving = false;
      }
    });
  }

  calcularSubtotal(detalle: any): number {
    const cantidad = Number(detalle?.cantidad || 0);
    const costo = Number(detalle?.costo_unitario || 0);
    return cantidad * costo;
  }

  getTotalGeneral(): number {
    return this.detalles.getRawValue().reduce((acc: number, item: any) => {
      return acc + (Number(item.cantidad) * Number(item.costo_unitario));
    }, 0);
  }

  aplicarFiltrosCompras(): void {
    const texto = this.normalizarTexto(this.filtrosComprasForm.value.texto || '');

    this.comprasFiltradas = this.compras.filter((compra: any) => {
      const proveedor = compra?.proveedor?.nombre || '';
      const empleado = `${compra?.empleado?.nombre || ''} ${compra?.empleado?.apellidos || ''}`;

      const textoCompra = this.normalizarTexto(`
        ${proveedor}
        ${empleado}
      `);

      return !texto || textoCompra.includes(texto);
    });
  }

  limpiarFiltrosCompras(): void {
    this.filtrosComprasForm.reset({
      texto: ''
    });

    this.comprasFiltradas = [...this.compras];
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
    this.detalles.clear();
  }
}
