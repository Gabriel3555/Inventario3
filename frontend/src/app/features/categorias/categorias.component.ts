import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/producto.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';

  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  paginaActual = 1;
  categoriasPorPagina = 6;

  showModal = false;
  modoEdicion = false;
  categoriaActual: Categoria = this.getCategoriaVacia();
  guardando = false;

  get categoriasPaginadas(): Categoria[] {
    const inicio = (this.paginaActual - 1) * this.categoriasPorPagina;
    return this.categoriasFiltradas.slice(inicio, inicio + this.categoriasPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.categoriasPorPagina) || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get rangoInicio(): number {
    if (this.categoriasFiltradas.length === 0) return 0;
    return (this.paginaActual - 1) * this.categoriasPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.categoriasPorPagina, this.categoriasFiltradas.length);
  }

  private getCategoriaVacia(): Categoria {
    return {
      nombre: '',
      descripcion: ''
    };
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.error = '';
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categoriasFiltradas = [...data];
        this.paginaActual = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al cargar las categorías';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.categoriaActual = { ...this.getCategoriaVacia() };
    this.showModal = true;
  }

  abrirModalEditar(c: Categoria): void {
    this.modoEdicion = true;
    this.categoriaActual = {
      id: c.id,
      nombre: c.nombre ?? '',
      descripcion: c.descripcion ?? ''
    };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.categoriaActual = this.getCategoriaVacia();
    this.error = '';
  }

  guardarCategoria(): void {
    if (!this.categoriaActual.nombre?.trim()) {
      this.error = 'El nombre es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    this.guardando = true;
    this.error = '';
    const body: Categoria = {
      nombre: this.categoriaActual.nombre.trim(),
      descripcion: this.categoriaActual.descripcion?.trim() || undefined
    };
    const request = this.modoEdicion && this.categoriaActual.id
      ? this.categoriaService.update(this.categoriaActual.id, body)
      : this.categoriaService.create(body);
    request.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarCategorias();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al guardar la categoría';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCategoria(c: Categoria): void {
    if (!c.id) return;
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    this.error = '';
    this.categoriaService.delete(c.id).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(x => x.id !== c.id);
        this.categoriasFiltradas = this.categoriasFiltradas.filter(x => x.id !== c.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al eliminar la categoría';
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }
}
