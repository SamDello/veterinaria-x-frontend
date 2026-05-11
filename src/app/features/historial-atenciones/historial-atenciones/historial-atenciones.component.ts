import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AtencionVeterinariaService } from '../../../core/services/atencion-veterinaria.service';
import { MascotaService } from '../../../core/services/mascota.service';

@Component({
  selector: 'app-historial-atenciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historial-atenciones.component.html',
  styleUrl: './historial-atenciones.component.scss'
})
export class HistorialAtencionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private atencionService = inject(AtencionVeterinariaService);
  private mascotaService = inject(MascotaService);

  atenciones: any[] = [];
  atencionesFiltradas: any[] = [];
  mascotas: any[] = [];

  loading = false;
  errorMessage = '';

  showDetailModal = false;
  selectedAtencion: any = null;

  filtroForm = this.fb.group({
    id_mascota: [''],
    fecha_inicio: [''],
    fecha_fin: ['']
  });

  ngOnInit(): void {
    this.loadMascotas();
    this.loadAtenciones();

    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  loadMascotas(): void {
    this.mascotaService.getMascotas().subscribe({
      next: (response) => {
        this.mascotas = (response?.data || []).filter((m: any) => m.estado);
      },
      error: () => {
        this.mascotas = [];
      }
    });
  }

  loadAtenciones(): void {
    this.loading = true;
    this.errorMessage = '';

    this.atencionService.getAtencionesVeterinarias().subscribe({
      next: (response) => {
        this.atenciones = response?.data || [];
        this.atencionesFiltradas = [...this.atenciones];
        this.loading = false;
        this.aplicarFiltros();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al cargar historial de atenciones';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    const idMascota = this.filtroForm.value.id_mascota ? Number(this.filtroForm.value.id_mascota) : null;
    const fechaInicio = this.filtroForm.value.fecha_inicio || '';
    const fechaFin = this.filtroForm.value.fecha_fin || '';

    this.atencionesFiltradas = this.atenciones.filter((item: any) => {
      const cumpleMascota = !idMascota || item.id_mascota === idMascota;

      let cumpleFecha = true;
      if (fechaInicio || fechaFin) {
        const fechaAtencion = new Date(item.fecha);

        if (fechaInicio) {
          const inicio = new Date(`${fechaInicio}T00:00:00`);
          if (fechaAtencion < inicio) {
            cumpleFecha = false;
          }
        }

        if (fechaFin) {
          const fin = new Date(`${fechaFin}T23:59:59`);
          if (fechaAtencion > fin) {
            cumpleFecha = false;
          }
        }
      }

      return cumpleMascota && cumpleFecha;
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      id_mascota: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    this.atencionesFiltradas = [...this.atenciones];
  }

  openDetailModal(item: any): void {
    this.selectedAtencion = item;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.selectedAtencion = null;
    this.showDetailModal = false;
  }

  getMascotaText(item: any): string {
    return item?.mascota?.nombre || '-';
  }

  getClienteText(item: any): string {
    const nombre = item?.mascota?.cliente?.nombre || '';
    const apellidos = item?.mascota?.cliente?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getEmpleadoText(item: any): string {
    const nombre = item?.empleado?.nombre || '';
    const apellidos = item?.empleado?.apellidos || '';
    return `${nombre} ${apellidos}`.trim() || '-';
  }

  getServiciosText(item: any): string {
    if (!Array.isArray(item?.servicios) || item.servicios.length === 0) {
      return '-';
    }

    return item.servicios.map((s: any) => s.nombre).join(', ');
  }

  getServicioDetalleText(servicio: any): string {
    const cantidad = servicio?.AtencionServicio?.cantidad || 0;
    const precio = servicio?.AtencionServicio?.precio_unitario || 0;
    const subtotal = servicio?.AtencionServicio?.subtotal || 0;
    return `Cant.: ${cantidad} | P/U: ${precio} | Subtotal: ${subtotal}`;
  }
}
