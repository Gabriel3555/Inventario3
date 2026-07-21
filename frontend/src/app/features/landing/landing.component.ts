import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatchBallComponent } from '../../shared/catch-ball/catch-ball.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CatchBallComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    { icon: '📦', title: 'Control de Inventario', desc: 'Gestiona productos, stock y categorías en tiempo real desde un solo panel.' },
    { icon: '📊', title: 'Estadísticas y Reportes', desc: 'Visualiza ventas, movimientos y tendencias con métricas claras.' },
    { icon: '🏷️', title: 'Lotes y Vencimientos', desc: 'Rastrea lotes y recibe alertas antes de que tus productos venzan.' },
    { icon: '🤝', title: 'Clientes y Proveedores', desc: 'Administra tus relaciones comerciales en un mismo lugar.' },
    { icon: '💰', title: 'Punto de Venta', desc: 'Registra ventas de forma rápida con actualización automática de stock.' },
    { icon: '🔐', title: 'Roles y Seguridad', desc: 'Acceso por roles: administradores y vendedores con permisos definidos.' }
  ];
}
