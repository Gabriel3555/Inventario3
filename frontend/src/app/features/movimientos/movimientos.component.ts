import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientoService } from '../../core/services/movimiento.service';
import { LoteService } from '../../core/services/lote.service';
import { Movimiento } from '../../core/models/movimiento.model';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.css'
})
export class MovimientosComponent implements OnInit {
  private movimientoService = inject(MovimientoService);
  private loteService = inject(LoteService);
  private cdr = inject(ChangeDetectorRef);
  
  filtroActivo: 'TODOS' | 'ENTRADA' | 'SALIDA' | 'MERMA' = 'TODOS';
  searchTerm: string = '';
  
  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  movimientosPaginados: Movimiento[] = [];
  
  loading: boolean = false;
  error: string = '';
  
  // Modal notificar merma
  mostrarModalMerma: boolean = false;
  guardandoMerma: boolean = false;
  buscandoLote: boolean = false;
  mermaForm: {
    numeroLote: string;
    productoNombre: string;
    productoId: number | null;
    stockDisponible: number;
    cantidad: number;
    nota: string;
  } = {
    numeroLote: '',
    productoNombre: '',
    productoId: null,
    stockDisponible: 0,
    cantidad: 0,
    nota: ''
  };
  errorMerma: string = '';
  
  // Paginación
  paginaActual: number = 1;
  movimientosPorPagina: number = 5;
  totalPaginas: number = 0;
  paginasArray: number[] = [];
  Math = Math;

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges(); // Forzar detección de cambios
    
    this.movimientoService.getAll().subscribe({
      next: (data) => {
        console.log('Movimientos recibidos:', data);
        try {
          this.movimientos = data || [];
          console.log('Movimientos asignados, aplicando filtros...');
          this.aplicarFiltros();
          console.log('Filtros aplicados exitosamente');
        } catch (error) {
          console.error('Error al procesar movimientos:', error);
          this.movimientos = [];
          this.movimientosFiltrados = [];
          this.movimientosPaginados = [];
        } finally {
          this.loading = false;
          console.log('Loading puesto en false');
          this.cdr.detectChanges(); // Forzar detección de cambios
        }
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.error = 'Error al cargar los movimientos. Por favor, intente nuevamente.';
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      }
    });
  }

  get totalEntradas(): number {
    return this.movimientos.filter(m => m.tipo === 'ENTRADA').length;
  }

  get totalSalidas(): number {
    return this.movimientos.filter(m => m.tipo === 'SALIDA').length;
  }

  get totalMermas(): number {
    return this.movimientos.filter(m => m.tipo === 'MERMA').length;
  }

  aplicarFiltros(): void {
    console.log('Aplicando filtros a', this.movimientos?.length || 0, 'movimientos');
    
    try {
      // Validar que movimientos sea un array
      if (!Array.isArray(this.movimientos)) {
        console.error('movimientos no es un array:', this.movimientos);
        this.movimientos = [];
      }
      
      // Aplicar filtro por tipo
      let resultado = [...this.movimientos];
      console.log('Filtro activo:', this.filtroActivo);
      
      if (this.filtroActivo !== 'TODOS') {
        resultado = resultado.filter(m => m?.tipo === this.filtroActivo);
      }
      console.log('Después de filtro por tipo:', resultado.length);
      
      // Aplicar búsqueda
      if (this.searchTerm && this.searchTerm.trim()) {
        const termino = this.searchTerm.toLowerCase().trim();
        resultado = resultado.filter(m => 
          m?.producto?.nombre?.toLowerCase().includes(termino) ||
          m?.id?.toString().toLowerCase().includes(termino) ||
          m?.motivo?.toLowerCase().includes(termino) ||
          m?.usuario?.nombre?.toLowerCase().includes(termino)
        );
        console.log('Después de búsqueda:', resultado.length);
      }
      
      this.movimientosFiltrados = resultado;
      console.log('Movimientos filtrados:', this.movimientosFiltrados.length);
      
      this.calcularPaginacion();
      this.paginaActual = 1;
      this.actualizarPaginados();
      
      console.log('Movimientos paginados:', this.movimientosPaginados.length);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      this.movimientosFiltrados = [];
      this.movimientosPaginados = [];
    }
  }

  onSearch(): void {
    this.aplicarFiltros();
  }

  cambiarFiltro(filtro: 'TODOS' | 'ENTRADA' | 'SALIDA' | 'MERMA'): void {
    this.filtroActivo = filtro;
    this.aplicarFiltros();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.movimientosFiltrados.length / this.movimientosPorPagina);
    this.paginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  actualizarPaginados(): void {
    const inicio = (this.paginaActual - 1) * this.movimientosPorPagina;
    const fin = inicio + this.movimientosPorPagina;
    this.movimientosPaginados = this.movimientosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginados();
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'badge-entrada';
      case 'SALIDA': return 'badge-salida';
      case 'MERMA': return 'badge-merma';
      default: return '';
    }
  }

  obtenerSignoCantidad(tipo: string): string {
    return tipo === 'ENTRADA' ? '+' : '-';
  }

  obtenerClaseCantidad(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'cantidad-positiva';
      case 'SALIDA': return 'cantidad-negativa';
      case 'MERMA': return 'cantidad-merma';
      default: return '';
    }
  }

  obtenerNombreUsuario(movimiento: Movimiento): string {
    return movimiento.usuario?.nombre || 'Sistema';
  }

  obtenerIdFormateado(id: number): string {
    return `M${id.toString().padStart(3, '0')}`;
  }

  // Modal Notificar Merma
  abrirModalMerma(): void {
    this.mostrarModalMerma = true;
    this.resetearFormMerma();
  }

  cerrarModalMerma(): void {
    this.mostrarModalMerma = false;
    this.resetearFormMerma();
  }

  resetearFormMerma(): void {
    this.mermaForm = {
      numeroLote: '',
      productoNombre: '',
      productoId: null,
      stockDisponible: 0,
      cantidad: 0,
      nota: ''
    };
    this.errorMerma = '';
  }

  onNumeroLoteChange(): void {
    // Limpiar datos previos
    this.mermaForm.productoNombre = '';
    this.mermaForm.productoId = null;
    this.mermaForm.stockDisponible = 0;
    this.errorMerma = '';

    // Verificar si se completaron 13 dígitos
    if (this.mermaForm.numeroLote.length === 13 && /^\d{13}$/.test(this.mermaForm.numeroLote)) {
      this.buscarLotePorNumero();
    }
  }

  buscarLotePorNumero(): void {
    this.buscandoLote = true;
    this.errorMerma = '';

    this.loteService.getAll().subscribe({
      next: (lotes) => {
        const lote = lotes.find(l => l.codigo === this.mermaForm.numeroLote);
        
        if (lote) {
          this.loteService.getLotesPaginados(1, 1000).subscribe({
            next: (response) => {
              const loteConEstado = response.lotes.find(l => l.codigo === this.mermaForm.numeroLote);
              if (loteConEstado) {
                this.mermaForm.productoNombre = loteConEstado.productoNombre || '';
                this.mermaForm.productoId = loteConEstado.productoId;
                this.mermaForm.stockDisponible = loteConEstado.stock || 0;
              } else {
                this.errorMerma = 'Lote no encontrado';
              }
              this.buscandoLote = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.errorMerma = 'Error al buscar el lote';
              this.buscandoLote = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMerma = 'Lote no encontrado';
          this.buscandoLote = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMerma = 'Error al buscar el lote';
        this.buscandoLote = false;
        this.cdr.detectChanges();
      }
    });
  }

  notificarMerma(): void {
    // Validaciones
    if (!this.mermaForm.productoId) {
      this.errorMerma = 'Por favor ingrese un número de lote válido';
      return;
    }
    if (this.mermaForm.cantidad <= 0) {
      this.errorMerma = 'La cantidad debe ser mayor a 0';
      return;
    }
    if (this.mermaForm.cantidad > this.mermaForm.stockDisponible) {
      this.errorMerma = `La cantidad no puede ser mayor al stock disponible (${this.mermaForm.stockDisponible})`;
      return;
    }
    if (!this.mermaForm.nota.trim()) {
      this.errorMerma = 'Por favor ingrese una nota';
      return;
    }

    this.guardandoMerma = true;
    this.errorMerma = '';

    const mermaData = {
      productoId: this.mermaForm.productoId,
      tipo: 'MERMA',
      cantidad: this.mermaForm.cantidad,
      motivo: `${this.mermaForm.nota} - Lote: ${this.mermaForm.numeroLote}`
    };

    this.movimientoService.create(mermaData).subscribe({
      next: () => {
        this.guardandoMerma = false;
        this.cerrarModalMerma();
        this.cargarMovimientos(); // Recargar la lista
      },
      error: (err) => {
        this.guardandoMerma = false;
        this.errorMerma = err.error?.message || 'Error al registrar la merma';
        this.cdr.detectChanges();
      }
    });
  }
}
