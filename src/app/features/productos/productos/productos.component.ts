import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MarcaService } from '../../../core/services/marca.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);

  productos: any[] = [];
  categorias: any[] = [];
  marcas: any[] = [];

  loading = false;
  saving = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  showModal = false;

  form = this.fb.group({
    id_categoria: ['', Validators.required],
    id_marca: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    precio_compra: ['', Validators.required],
    precio_venta: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadProductos();
    this.loadCategorias();
    this.loadMarcas();
  }

  loadProductos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = response?.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar productos';
        this.loading = false;
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = response?.data || [];
      }
    });
  }

  loadMarcas(): void {
    this.marcaService.getMarcas().subscribe({
      next: (response) => {
        this.marcas = response?.data || [];
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(producto: any): void {
    this.editingId = producto.id_producto;
    this.form.patchValue({
      id_categoria: producto.id_categoria,
      id_marca: producto.id_marca,
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio_compra: producto.precio_compra || '',
      precio_venta: producto.precio_venta || ''
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
      this.productoService.updateProducto(this.editingId, payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Producto actualizado correctamente';
          this.loadProductos();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al actualizar producto';
          this.saving = false;
        }
      });
    } else {
      this.productoService.createProducto(payload).subscribe({
        next: (response) => {
          this.successMessage = response?.message || 'Producto registrado correctamente';
          this.loadProductos();
          this.closeModal();
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al registrar producto';
          this.saving = false;
        }
      });
    }
  }

  changeStatus(producto: any, estado: boolean): void {
    const accion = estado ? 'activar' : 'desactivar';
    const confirmado = confirm(`¿Deseas ${accion} el producto ${producto.nombre}?`);

    if (!confirmado) return;

    this.productoService.changeStatus(producto.id_producto, estado).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Estado actualizado correctamente';
        this.loadProductos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cambiar estado del producto';
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}
