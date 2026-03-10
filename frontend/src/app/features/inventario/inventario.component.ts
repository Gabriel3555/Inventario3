import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';

export interface ItemInventario {
  id: number;
  producto: string;
  sku: string;
  ubicacion: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'normal' | 'critico';
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  searchTerm: string = '';
  
  // Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 5;
  
  // Loading state
  loading: boolean = true;
  error: string = '';
  
  stats = {
    totalProductos: 0,
    stockBajo: 0,
    stockCritico: 0
  };

  inventario: ItemInventario[] = [];
  inventarioFiltrado: ItemInventario[] = [];

  constructor(
    public auth: AuthService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.loading = true;
    this.error = '';
    
    console.log('Cargando inventario...');
    console.log('Token:', this.auth.getToken());
    
    this.productoService.getAll().subscribe({
      next: (productos: Producto[]) => {
        console.log('Productos recibidos:', productos);
        console.log('Cantidad de productos:', productos.length);
        
        this.inventario = productos.map(p => ({
          id: p.id || 0,
          producto: p.nombre,
          sku: p.sku,
          ubicacion: p.ubicacion || 'Sin ubicación',
          stockActual: p.stock,
          stockMinimo: p.stockMinimo,
          estado: p.stock <= p.stockMinimo ? 'critico' : 'normal'
        }));
        
        this.inventarioFiltrado = [...this.inventario];
        this.calcularEstadisticas();
        
        console.log('Loading se pone en false');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error:', err.error);
        
        if (err.status === 0) {
          this.error = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:8080';
        } else if (err.status === 401) {
          this.error = 'No autorizado. Por favor, inicia sesión nuevamente.';
          this.auth.logout();
        } else if (err.status === 403) {
          this.error = 'No tienes permisos para acceder a este recurso.';
        } else {
          this.error = `Error al cargar los productos: ${err.message || 'Error desconocido'}`;
        }
        
        console.log('Loading se pone en false por error');
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Observable completado');
      }
    });
  }

  calcularEstadisticas() {
    this.stats.totalProductos = this.inventario.length;
    this.stats.stockCritico = this.inventario.filter(item => {
      const porcentaje = this.getNivelPorcentaje(item);
      return porcentaje <= 100;
    }).length;
    this.stats.stockBajo = this.inventario.filter(item => {
      const porcentaje = this.getNivelPorcentaje(item);
      return porcentaje > 100 && porcentaje <= 200;
    }).length;
  }

  filtrarInventario() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.inventarioFiltrado = [...this.inventario];
    } else {
      this.inventarioFiltrado = this.inventario.filter(item =>
        item.producto.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.ubicacion.toLowerCase().includes(term)
      );
    }
    
    // Resetear a la primera página al filtrar
    this.paginaActual = 1;
  }

  // Métodos de paginación
  get inventarioPaginado(): ItemInventario[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.inventarioFiltrado.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.inventarioFiltrado.length / this.productosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  get rangoInicio(): number {
    return (this.paginaActual - 1) * this.productosPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.productosPorPagina, this.inventarioFiltrado.length);
  }

  getNivelPorcentaje(item: ItemInventario): number {
    return (item.stockActual / item.stockMinimo) * 100;
  }

  getEstadoClase(item: ItemInventario): string {
    const porcentaje = this.getNivelPorcentaje(item);
    if (porcentaje <= 100) return 'critico';
    if (porcentaje <= 200) return 'bajo';
    return 'normal';
  }

  getEstadoTexto(item: ItemInventario): string {
    if (item.estado === 'critico') return 'Crítico';
    const porcentaje = this.getNivelPorcentaje(item);
    if (porcentaje <= 200) return 'Bajo';
    return 'Normal';
  }

  getBarWidth(item: ItemInventario): number {
    const porcentaje = this.getNivelPorcentaje(item);
    return Math.min(porcentaje, 100);
  }

  getBarColor(item: ItemInventario): string {
    const estado = this.getEstadoClase(item);
    if (estado === 'critico') return '#ef4444';
    if (estado === 'bajo') return '#f59e0b';
    return '#10b981';
  }
}
