import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { PageVisitData, PageVisitService } from '../../core/services/page-visit.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private pageVisitService = inject(PageVisitService);
  private routerSubscription?: Subscription;
  private lastRegisteredPageKey = '';

  currentPageKey = '';
  currentPageLabel = '';
  totalVisits = 0;
  visitError = '';

  ngOnInit(): void {
    this.registerCurrentPage(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.registerCurrentPage(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private registerCurrentPage(url: string): void {
    const pageKey = this.getPageKeyFromUrl(url);

    if (!pageKey || pageKey === this.lastRegisteredPageKey) {
      return;
    }

    this.lastRegisteredPageKey = pageKey;
    this.currentPageKey = pageKey;
    this.currentPageLabel = this.getPageLabel(pageKey);
    this.visitError = '';

    this.pageVisitService.registerPageVisit(pageKey).subscribe({
      next: (response) => {
        this.updateVisitCounter(response.data);
      },
      error: () => {
        this.visitError = 'No se pudo cargar el contador de visitas.';
        this.totalVisits = 0;
      }
    });
  }

  private updateVisitCounter(data: PageVisitData): void {
    this.totalVisits = Number(data.total_visits) || 0;
  }

  private getPageKeyFromUrl(url: string): string {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const segments = cleanUrl.split('/').filter((segment) => segment.trim().length > 0);

    if (segments.length === 0) {
      return 'dashboard';
    }

    return segments.join('-');
  }

  private getPageLabel(pageKey: string): string {
    const labels: Record<string, string> = {
      dashboard: 'Panel principal',
      clientes: 'Clientes',
      mascotas: 'Mascotas',
      especies: 'Especies',
      razas: 'Razas',
      productos: 'Productos',
      categorias: 'Categorías',
      marcas: 'Marcas',
      proveedores: 'Proveedores',
      compras: 'Compras',
      ventas: 'Ventas',
      'atenciones-veterinarias': 'Atenciones veterinarias',
      'servicios-veterinarios': 'Servicios veterinarios',
      'historial-atenciones': 'Historial de atenciones',
      pagos: 'Pagos',
      'metodos-pago': 'Métodos de pago',
      'apertura-caja': 'Apertura de caja',
      'cierre-caja': 'Cierre de caja',
      'movimientos-caja': 'Movimientos de caja',
      'movimientos-inventario': 'Movimientos de inventario',
      caja: 'Caja',
      almacenes: 'Almacenes',
      stock: 'Stock',
      reportes: 'Reportes',
      roles: 'Roles',
      usuarios: 'Usuarios',
      empleados: 'Empleados'
    };

    return labels[pageKey] || this.formatPageKey(pageKey);
  }

  private formatPageKey(pageKey: string): string {
    return pageKey
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
