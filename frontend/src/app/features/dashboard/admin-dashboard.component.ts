import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, Estadisticas } from '../../core/services/estadisticas.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private estadisticasService = inject(EstadisticasService);
  private cdr = inject(ChangeDetectorRef);
  
  loading = false;
  error = '';
  estadisticas: Estadisticas | null = null;

  // Datos calculados para la vista
  stats = {
    productos: { total: 0, unidades: 0 },
    ventasMes: { monto: 0, cambio: 0 },
    alertas: { count: 0, mensaje: 'Sin alertas' },
    valorInventario: { monto: 0, ventas: 0 }
  };

  ventasSemanales: any[] = [];
  stockCategorias: any[] = [];
  ultimosMovimientos: any[] = [];

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.error = '';
    
    this.estadisticasService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.procesarEstadisticas(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar las estadísticas';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  procesarEstadisticas(data: Estadisticas): void {
    // Actualizar stats
    this.stats = {
      productos: { 
        total: data.totalProductos, 
        unidades: data.totalUnidades 
      },
      ventasMes: { 
        monto: data.ventasMes, 
        cambio: 0 // Calcular cambio si hay datos del mes anterior
      },
      alertas: { 
        count: data.productosStockBajo, 
        mensaje: data.productosStockBajo > 0 ? 'Productos bajo mínimo' : 'Sin alertas'
      },
      valorInventario: { 
        monto: data.valorInventario, 
        ventas: data.ventasPendientes 
      }
    };

    // Ventas semanales
    this.ventasSemanales = data.ventasSemanales.map(vs => ({
      semana: vs.semana,
      ventas: vs.ventas
    }));

    // Stock por categoría - agregar colores
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    this.stockCategorias = data.stockCategorias.map((sc, index) => ({
      nombre: sc.nombre,
      porcentaje: sc.porcentaje,
      color: colores[index % colores.length]
    }));

    // Últimos movimientos - agregar iconos
    this.ultimosMovimientos = data.ultimosMovimientos.map(mov => ({
      producto: mov.producto,
      descripcion: mov.descripcion,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      icon: this.getTipoIcon(mov.tipo)
    }));
  }

  getTipoIcon(tipo: string): string {
    switch(tipo.toLowerCase()) {
      case 'entrada': return '🟢';
      case 'salida': return '🔵';
      case 'ajuste': return '📦';
      default: return '📦';
    }
  }

  getMaxVentas(): number {
    if (this.ventasSemanales.length === 0) return 1;
    return Math.max(...this.ventasSemanales.map(v => v.ventas), 1);
  }

  getBarHeight(ventas: number): number {
    const max = this.getMaxVentas();
    return max > 0 ? (ventas / max) * 100 : 0;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }
}
