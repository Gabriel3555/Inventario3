import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto, Categoria } from '../../core/models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  /** Solo el admin puede crear, editar y eliminar productos. */
  get isAdmin(): boolean {
    return this.auth.rol() === 'ADMIN';
  }

  // Lista de productos
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];
  
  // Lista de categorías
  categorias: Categoria[] = [];

  // Búsqueda
  searchTerm: string = '';

  // Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 10;
  totalPaginas: number = 1;

  // Modal
  showModal: boolean = false;
  modoEdicion: boolean = false;
  productoActual: Producto = this.getProductoVacio();
  ivaSeleccionado: number = 0;

  // Loading
  loading: boolean = false;
  error: string = '';

  // Helper para templates
  Math = Math;

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  cargarProductos() {
    this.loading = true;
    this.error = '';
    this.productoService.getAll().subscribe({
      next: (productos) => {
        console.log('Productos recibidos:', productos);
        this.productos = productos;
        this.aplicarFiltrosYOrdenamiento();
        this.loading = false;
        console.log('Productos paginados:', this.productosPaginados);
        console.log('Loading status:', this.loading);
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        console.error('Error al cargar productos:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltrosYOrdenamiento() {
    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      this.productosFiltrados = this.productos.filter(p =>
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.categoria?.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.productosFiltrados = [...this.productos];
    }

    // Ordenar por precio de venta (más caros primero)
    this.productosFiltrados.sort((a, b) => {
      const precioA = Number(a.precioVenta) || 0;
      const precioB = Number(b.precioVenta) || 0;
      return precioB - precioA;
    });

    // Calcular paginación
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }

    // Paginar
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
    
    console.log('Total productos filtrados:', this.productosFiltrados.length);
    console.log('Productos en página actual:', this.productosPaginados.length);
  }

  onSearch() {
    this.paginaActual = 1;
    this.aplicarFiltrosYOrdenamiento();
  }

  calcularMargen(producto: Producto): number {
    const precioCompra = Number(producto.precioCompra);
    const precioVenta = Number(producto.precioVenta);
    
    if (!precioCompra || precioCompra === 0) return 0;
    return ((precioVenta - precioCompra) / precioCompra) * 100;
  }

  formatearMoneda(valor: number | string): string {
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    if (isNaN(valorNumerico)) {
      return '$0';
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valorNumerico);
  }

  // Paginación
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarFiltrosYOrdenamiento();
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // CRUD
  abrirModalCrear() {
    this.modoEdicion = false;
    this.productoActual = this.getProductoVacio();
    this.ivaSeleccionado = 0;
    this.showModal = true;
  }

  abrirModalEditar(producto: Producto) {
    this.modoEdicion = true;
    this.productoActual = { ...producto };
    this.ivaSeleccionado = producto.impuesto?.porcentaje || 0;
    // Asegurar que la categoría se mantenga si existe
    if (producto.categoria) {
      this.productoActual.categoria = { ...producto.categoria };
    }
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.productoActual = this.getProductoVacio();
    this.ivaSeleccionado = 0;
  }

  guardarProducto() {
    if (!this.validarProducto()) {
      return;
    }

    // Asignar el impuesto basado en el porcentaje seleccionado
    this.productoActual.impuesto = {
      porcentaje: this.ivaSeleccionado
    };

    this.loading = true;
    this.error = '';
    
    if (this.modoEdicion && this.productoActual.id) {
      console.log('Actualizando producto:', this.productoActual);
      this.productoService.update(this.productoActual.id, this.productoActual).subscribe({
        next: (response) => {
          console.log('Producto actualizado exitosamente:', response);
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar producto';
          console.error('Error al actualizar:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('Creando producto:', this.productoActual);
      this.productoService.create(this.productoActual).subscribe({
        next: (response) => {
          console.log('Producto creado exitosamente:', response);
          this.cargarProductos();
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear producto';
          console.error('Error al crear:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  eliminarProducto(id: number | undefined) {
    if (!id) return;
    
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.loading = true;
      this.error = '';
      this.productoService.delete(id).subscribe({
        next: () => {
          this.loading = false;
          this.cargarProductos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          // Mostrar mensaje de error específico del servidor
          const errorMessage = err.error?.message || 'Error al eliminar producto. Es posible que tenga ventas o movimientos asociados.';
          alert('❌ Error al eliminar producto\n\n' + errorMessage);
          this.error = errorMessage;
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  validarProducto(): boolean {
    if (!this.productoActual.nombre || !this.productoActual.sku) {
      this.error = 'Nombre y SKU son obligatorios';
      return false;
    }
    const precioCompra = Number(this.productoActual.precioCompra);
    const precioVenta = Number(this.productoActual.precioVenta);
    
    if (precioCompra < 0 || precioVenta < 0) {
      this.error = 'Los precios deben ser mayores a 0';
      return false;
    }
    return true;
  }

  getProductoVacio(): Producto {
    return {
      nombre: '',
      sku: '',
      descripcion: '',
      codigoBarras: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: 0,
      ubicacion: ''
    };
  }

  // Función para comparar categorías en el select
  compararCategorias(c1: Categoria | undefined, c2: Categoria | undefined): boolean {
    return c1?.id === c2?.id;
  }
}
