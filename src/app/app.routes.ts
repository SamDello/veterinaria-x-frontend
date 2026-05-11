import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ClientesComponent } from './features/clientes/clientes/clientes.component';
import { MascotasComponent } from './features/mascotas/mascotas/mascotas.component';
import { ProductosComponent } from './features/productos/productos/productos.component';
import { ProveedoresComponent } from './features/proveedores/proveedores/proveedores.component';
import { ComprasComponent } from './features/compras/compras/compras.component';
import { VentasComponent } from './features/ventas/ventas/ventas.component';
import { RolesComponent } from './features/roles/roles/roles.component';
import { UsuariosComponent } from './features/usuarios/usuarios/usuarios.component';
import { EmpleadosComponent } from './features/empleados/empleados/empleados.component';
import { PagosComponent } from './features/pagos/pagos/pagos.component';
import { MetodosPagoComponent } from './features/metodos-pago/metodos-pago/metodos-pago.component';
import { CajaComponent } from './features/caja/caja/caja.component';
import { AperturaCajaComponent } from './features/apertura-caja/apertura-caja/apertura-caja.component';
import { CierreCajaComponent } from './features/cierre-caja/cierre-caja/cierre-caja.component';
import { MovimientosCajaComponent } from './features/movimientos-caja/movimientos-caja/movimientos-caja.component';
import { AlmacenesComponent } from './features/almacenes/almacenes/almacenes.component';
import { StockComponent } from './features/stock/stock/stock.component';
import { MovimientosInventarioComponent } from './features/movimientos-inventario/movimientos-inventario/movimientos-inventario.component';
import { ReportesComponent } from './features/reportes/reportes/reportes.component';
import { CategoriasComponent } from './features/categorias/categorias/categorias.component';
import { MarcasComponent } from './features/marcas/marcas/marcas.component';
import { EspeciesComponent } from './features/especies/especies/especies.component';
import { RazasComponent } from './features/razas/razas/razas.component';
import { AtencionesVeterinariasComponent } from './features/atenciones-veterinarias/atenciones-veterinarias/atenciones-veterinarias.component';
import { ServiciosVeterinariosComponent } from './features/servicios-veterinarios/servicios-veterinarios/servicios-veterinarios.component';
import { HistorialAtencionesComponent } from './features/historial-atenciones/historial-atenciones/historial-atenciones.component';
import { TraspasosComponent } from './features/traspasos/traspasos/traspasos.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'clientes',
        component: ClientesComponent
      },
      {
        path: 'mascotas',
        component: MascotasComponent
      },
      {
        path: 'especies',
        component: EspeciesComponent
      },
      {
        path: 'razas',
        component: RazasComponent
      },
      {
        path: 'productos',
        component: ProductosComponent
      },
      {
        path: 'categorias',
        component: CategoriasComponent
      },
      {
        path: 'marcas',
        component: MarcasComponent
      },
      {
        path: 'proveedores',
        component: ProveedoresComponent
      },
      {
        path: 'compras',
        component: ComprasComponent
      },
      {
        path: 'ventas',
        component: VentasComponent
      },
      {
        path: 'atenciones-veterinarias',
        component: AtencionesVeterinariasComponent
      },
      {
        path: 'servicios-veterinarios',
        component: ServiciosVeterinariosComponent
      },
      {
        path: 'historial-atenciones',
        component: HistorialAtencionesComponent
      },
      {
        path: 'pagos',
        component: PagosComponent
      },
      {
        path: 'metodos-pago',
        component: MetodosPagoComponent
      },
      {
        path: 'apertura-caja',
        component: AperturaCajaComponent
      },
      {
        path: 'cierre-caja',
        component: CierreCajaComponent
      },
      {
        path: 'movimientos-caja',
        component: MovimientosCajaComponent
      },
      {
        path: 'movimientos-inventario',
        component: MovimientosInventarioComponent
      },
      {
        path: 'caja',
        component: CajaComponent
      },
      {
        path: 'almacenes',
        component: AlmacenesComponent
      },
      {
        path: 'stock',
        component: StockComponent
      },
      {
        path: 'reportes',
        component: ReportesComponent
      },
      {
        path: 'roles',
        component: RolesComponent
      },
      {
        path: 'usuarios',
        component: UsuariosComponent
      },
      {
        path: 'empleados',
        component: EmpleadosComponent
      },
      {
        path: 'traspasos',
        component: TraspasosComponent
      },
      
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
