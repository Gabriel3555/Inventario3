import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), data: { title: 'Dashboard' } },
      { path: 'productos', loadComponent: () => import('./features/productos/productos.component').then(m => m.ProductosComponent), data: { title: 'Productos' } },
      { path: 'inventario', loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent), data: { title: 'Inventario' } },
      { path: 'movimientos', loadComponent: () => import('./features/movimientos/movimientos.component').then(m => m.MovimientosComponent), data: { title: 'Movimientos' } },
      { path: 'ventas', loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent), data: { title: 'Ventas' } },
      { path: 'proveedores', loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent), data: { title: 'Proveedores' } },
      { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent), data: { title: 'Clientes' } },
      { path: 'categorias', loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent), data: { title: 'Categorías' } },
      { path: 'lotes', loadComponent: () => import('./features/lotes/lotes.component').then(m => m.LotesComponent), data: { title: 'Lotes y Vencimientos' } },
      { path: 'usuarios', loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent), data: { title: 'Usuarios' } }
    ]
  },
  {
    path: 'vendedor',
    loadComponent: () => import('./core/layout/vendedor-layout.component').then(m => m.VendedorLayoutComponent),
    canActivate: [authGuard, roleGuard(['VENDEDOR'])],
    children: [
      { path: '', redirectTo: 'ventas', pathMatch: 'full' },
      { path: 'ventas', loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent), data: { title: 'Mis Ventas' } },
      { path: 'productos', loadComponent: () => import('./features/productos/productos.component').then(m => m.ProductosComponent), data: { title: 'Productos' } },
      { path: 'lotes', loadComponent: () => import('./features/lotes/lotes.component').then(m => m.LotesComponent), data: { title: 'Lotes' } },
      { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent), data: { title: 'Clientes' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
