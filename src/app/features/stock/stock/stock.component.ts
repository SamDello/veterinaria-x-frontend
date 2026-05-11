import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { StockService } from '../../../core/services/stock.service';
import { ProductoService } from '../../../core/services/producto.service';
import { AlmacenService } from '../../../core/services/almacen.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  private productoService = inject(ProductoService);
  private almacenService = inject(AlmacenService);

  stocks: any[] = [];
  productos: any[] = [];
  almacenes: any[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';
  modalErrorMessage = '';

  showModal = false;
  editingId: number | null = null;

  form = this.fb.group({
    id_producto: ['', Validators.required],
    id_almacen: ['', Validators.required],
    stock_actual: [0, [Validators.required, Validators.min(0)]],
    stock_minimo: [0, [Validators.min(0)]],
    stock_maximo: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadStocks();
    this.loadProductos();
    this.loadAlmacenes();
  }

  loadStocks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.stockService.getStocks().subscribe({
      next: (response) => {
        this.stocks = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar stock';
        this.loading = false;
      }
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = (response?.data || []).filter((p: any) => p.estado);
      }
    });
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = (response?.data || []).filter((a: any) => a.estado);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: any): void {
    this.resetForm();
    this.editingId = item.id_stock;

    this.form.patchValue({
      id_producto: item.id_producto,
      id_almacen: item.id_almacen,
      stock_actual: item.stock_actual,
      stock_minimo: item.stock_minimo,
      stock_maximo: item.stock_maximo,
    });

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

    this.saving = true;

    const payload = {
      id_producto: Number(this.form.value.id_producto),
      id_almacen: Number(this.form.value.id_almacen),
      stock_actual: Number(this.form.value.stock_actual || 0),
      stock_minimo: Number(this.form.value.stock_minimo || 0),
      stock_maximo: Number(this.form.value.stock_maximo || 0),
    };

    if (this.editingId) {
      this.stockService.updateStock(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Stock actualizado correctamente';
          this.loadStocks();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al actualizar stock';
          this.saving = false;
        }
      });
    } else {
      this.stockService.createStock(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Stock registrado correctamente';
          this.loadStocks();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.modalErrorMessage = error?.error?.message || 'Error al registrar stock';
          this.saving = false;
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      id_producto: '',
      id_almacen: '',
      stock_actual: 0,
      stock_minimo: 0,
      stock_maximo: 0,
    });
    this.editingId = null;
    this.modalErrorMessage = '';
    this.saving = false;
  }
}
