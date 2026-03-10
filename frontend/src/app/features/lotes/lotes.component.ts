import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoteService } from '../../core/services/lote.service';
import { ProductoService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { LoteConEstado, EstadisticasLotes, LoteCrear } from '../../core/models/lote.model';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.css'
})
export class LotesComponent implements OnInit {
  private loteService = inject(LoteService);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  /** Solo el admin puede crear lotes y retirarlos. */
  get isAdmin(): boolean {
    return this.auth.rol() === 'ADMIN';
  }

  // Datos
  lotes: LoteConEstado[] = [];
  productos: Producto[] = [];
  estadisticas: EstadisticasLotes = {
    conLote: 0,
    porVencer: 0,
    vencidos: 0
  };

  // Paginación
  paginaActual: number = 1;
  lotesPorPagina: number = 6;
  totalPaginas: number = 1;
  totalLotes: number = 0;

  // Estado
  loading: boolean = false;
  error: string = '';
  
  // Modal crear lote
  mostrarModalCrear: boolean = false;
  guardandoLote: boolean = false;
  nuevoLote: {
    productoId: number | null;
    numeroLote: string;
    fechaVencimiento: string;
    cantidad: number;
  } = {
    productoId: null,
    numeroLote: '',
    fechaVencimiento: '',
    cantidad: 0
  };
  
  // Modal buscar lote
  mostrarModalBuscar: boolean = false;
  buscandoLote: boolean = false;
  numeroLoteBuscar: string = '';
  loteEncontrado: LoteConEstado | null = null;
  errorBusqueda: string = '';

  // Helper para templates
  Math = Math;
  
  get productoSeleccionado(): Producto | undefined {
    if (!this.nuevoLote.productoId) return undefined;
    return this.productos.find(p => p.id === this.nuevoLote.productoId);
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarProductos();
  }

  cargarDatos() {
    this.loading = true;
    this.error = '';
    
    this.loteService.getLotesPaginados(this.paginaActual, this.lotesPorPagina).subscribe({
      next: (response) => {
        console.log('Lotes recibidos:', response);
        this.lotes = response.lotes;
        this.totalLotes = response.total;
        this.totalPaginas = Math.ceil(response.total / this.lotesPorPagina);
        this.estadisticas = {
          conLote: response.conLote,
          porVencer: response.porVencer,
          vencidos: response.vencidos
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar lotes';
        console.error('Error al cargar lotes:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarProductos() {
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  // Modal crear lote
  abrirModalCrear() {
    this.mostrarModalCrear = true;
    this.resetearFormulario();
    this.cdr.detectChanges();
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.resetearFormulario();
    this.cdr.detectChanges();
  }

  resetearFormulario() {
    this.nuevoLote = {
      productoId: null,
      numeroLote: '',
      fechaVencimiento: '',
      cantidad: 0
    };
    this.error = '';
  }

  guardarLote() {
    // Validaciones
    if (!this.nuevoLote.productoId) {
      this.error = 'Por favor seleccione un producto';
      return;
    }
    if (!this.nuevoLote.numeroLote.trim()) {
      this.error = 'Por favor ingrese el número de lote';
      return;
    }
    // Validar que el número de lote tenga exactamente 13 dígitos
    if (!/^\d{13}$/.test(this.nuevoLote.numeroLote)) {
      this.error = 'El número de lote debe contener exactamente 13 dígitos';
      return;
    }
    if (!this.nuevoLote.fechaVencimiento) {
      this.error = 'Por favor ingrese la fecha de vencimiento';
      return;
    }
    if (this.nuevoLote.cantidad <= 0) {
      this.error = 'La cantidad debe ser mayor a 0';
      return;
    }

    const producto = this.productos.find(p => p.id === this.nuevoLote.productoId);
    const confirmacion = confirm(
      `¿Confirma la creación del siguiente lote?\n\n` +
      `Producto: ${producto?.nombre ?? ''} (${producto?.sku ?? ''})\n` +
      `Número de lote: ${this.nuevoLote.numeroLote}\n` +
      `Fecha de vencimiento: ${this.nuevoLote.fechaVencimiento}\n` +
      `Cantidad: ${this.nuevoLote.cantidad} unidades`
    );
    if (!confirmacion) return;

    this.guardandoLote = true;
    this.error = '';
    this.cdr.detectChanges();

    const loteData: LoteCrear = {
      producto: {
        id: this.nuevoLote.productoId
      },
      numeroLote: this.nuevoLote.numeroLote,
      fechaVencimiento: this.nuevoLote.fechaVencimiento,
      cantidad: this.nuevoLote.cantidad
    };

    this.loteService.create(loteData).subscribe({
      next: (lote) => {
        this.guardandoLote = false;
        this.cerrarModalCrear();
        this.cargarDatos(); // Recargar la lista
      },
      error: (err) => {
        this.guardandoLote = false;
        this.error = err.error?.mensaje || 'Error al crear el lote';
        console.error('Error al crear lote:', err);
      }
    });
  }

  generarNumeroLoteAleatorio() {
    // Generar 13 dígitos aleatorios
    let numeroLote = '';
    for (let i = 0; i < 13; i++) {
      numeroLote += Math.floor(Math.random() * 10);
    }
    this.nuevoLote.numeroLote = numeroLote;
  }

  // Modal buscar lote
  abrirModalBuscar() {
    this.mostrarModalBuscar = true;
    this.numeroLoteBuscar = '';
    this.loteEncontrado = null;
    this.errorBusqueda = '';
    this.cdr.detectChanges();
  }

  cerrarModalBuscar() {
    this.mostrarModalBuscar = false;
    this.numeroLoteBuscar = '';
    this.loteEncontrado = null;
    this.errorBusqueda = '';
    this.cdr.detectChanges();
  }

  onNumeroLoteBuscarChange() {
    this.errorBusqueda = '';
    this.loteEncontrado = null;

    if (this.numeroLoteBuscar.length === 13 && /^\d{13}$/.test(this.numeroLoteBuscar)) {
      this.buscarLotePorNumero();
    }
  }

  buscarLotePorNumero() {
    this.buscandoLote = true;
    this.errorBusqueda = '';
    this.loteEncontrado = null;
    this.cdr.detectChanges();

    // Buscar directamente en el endpoint paginado que devuelve LoteConEstadoDTO con campo "codigo"
    this.loteService.getLotesPaginados(1, 1000).subscribe({
      next: (response) => {
        const loteConEstado = response.lotes.find(l => l.codigo === this.numeroLoteBuscar);
        if (loteConEstado) {
          this.loteEncontrado = loteConEstado;
        } else {
          this.errorBusqueda = 'Lote no encontrado';
        }
        this.buscandoLote = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorBusqueda = 'Error al buscar el lote';
        console.error('Error al buscar lote:', err);
        this.buscandoLote = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Paginación
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarDatos();
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Utilidades para el template
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Vencido':
        return 'estado-vencido';
      case 'Por Vencer':
        return 'estado-por-vencer';
      case 'Vigente':
        return 'estado-vigente';
      default:
        return '';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Vencido':
        return 'badge-vencido';
      case 'Por Vencer':
        return 'badge-por-vencer';
      case 'Vigente':
        return 'badge-vigente';
      case 'Vendido':
        return 'badge-vendido';
      default:
        return '';
    }
  }

  getStockClass(stock: number | undefined): string {
    if (!stock || stock === 0) return 'stock-empty';
    if (stock < 10) return 'stock-low';
    if (stock < 50) return 'stock-medium';
    return 'stock-good';
  }

  getDiasRestantesClass(diasRestantes: number): string {
    if (diasRestantes < 0) return 'dias-vencido';
    if (diasRestantes < 30) return 'dias-critico';
    if (diasRestantes < 90) return 'dias-advertencia';
    return 'dias-ok';
  }

  retirarLote(lote: LoteConEstado): void {
    // Validar que haya productos restantes
    if (!lote.stock || lote.stock === 0) {
      alert('No hay productos restantes para retirar en este lote.');
      return;
    }

    const mensaje = `¿Está seguro de retirar el lote "${lote.codigo}"?\n\n` +
      `Producto: ${lote.productoNombre}\n` +
      `Cantidad a retirar: ${lote.stock} unidades\n\n` +
      `Esta acción:\n` +
      `- Retirará SOLO las ${lote.stock} unidades restantes del stock\n` +
      `- Registrará un movimiento de MERMA con motivo "Vencimiento"\n` +
      `- El lote quedará marcado como "Vendido" (0 unidades)`;
    
    if (!confirm(mensaje)) return;
    
    if (!lote.id) {
      this.error = 'Error: ID de lote no válido';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.loteService.retirarPorVencimiento(lote.id).subscribe({
      next: () => {
        this.loading = false;
        this.cargarDatos(); // Recargar la lista
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al retirar el lote';
        console.error('Error al retirar lote:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
