import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];

  paginaActual = 1;
  proveedoresPorPagina = 3;

  showModal = false;
  modoEdicion = false;
  proveedorActual: Proveedor = this.getProveedorVacio();
  guardando = false;

  get proveedoresPaginados(): Proveedor[] {
    const inicio = (this.paginaActual - 1) * this.proveedoresPorPagina;
    return this.proveedoresFiltrados.slice(inicio, inicio + this.proveedoresPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.proveedoresFiltrados.length / this.proveedoresPorPagina) || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get rangoInicio(): number {
    if (this.proveedoresFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.proveedoresPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.proveedoresPorPagina, this.proveedoresFiltrados.length);
  }

  private getProveedorVacio(): Proveedor {
    return {
      nombre: '',
      nit: '',
      telefono: '',
      correo: '',
      direccion: '',
      nombreContacto: '',
      tiempoEntrega: ''
    };
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.error = '';
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = [...data];
        this.paginaActual = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al cargar los proveedores';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.proveedorActual = { ...this.getProveedorVacio() };
    this.showModal = true;
  }

  abrirModalEditar(p: Proveedor): void {
    this.modoEdicion = true;
    this.proveedorActual = {
      id: p.id,
      nombre: p.nombre ?? '',
      nit: p.nit ?? '',
      telefono: p.telefono ?? '',
      correo: p.correo ?? '',
      direccion: p.direccion ?? '',
      nombreContacto: p.nombreContacto ?? '',
      tiempoEntrega: p.tiempoEntrega ?? ''
    };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.proveedorActual = this.getProveedorVacio();
  }

  guardarProveedor(): void {
    if (!this.proveedorActual.nombre?.trim()) {
      this.error = 'El nombre es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    this.guardando = true;
    this.error = '';
    const body: Proveedor = {
      nombre: this.proveedorActual.nombre.trim(),
      nit: this.proveedorActual.nit?.trim() || undefined,
      telefono: this.proveedorActual.telefono?.trim() || undefined,
      correo: this.proveedorActual.correo?.trim() || undefined,
      direccion: this.proveedorActual.direccion?.trim() || undefined,
      nombreContacto: this.proveedorActual.nombreContacto?.trim() || undefined,
      tiempoEntrega: this.proveedorActual.tiempoEntrega?.trim() || undefined
    };
    const request = this.modoEdicion && this.proveedorActual.id
      ? this.proveedorService.update(this.proveedorActual.id, body)
      : this.proveedorService.create(body);
    request.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarProveedores();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al guardar el proveedor';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarProveedor(p: Proveedor): void {
    if (!p.id) return;
    if (!confirm('¿Eliminar este proveedor?')) return;
    this.error = '';
    this.proveedorService.delete(p.id).subscribe({
      next: () => {
        this.proveedores = this.proveedores.filter(x => x.id !== p.id);
        this.proveedoresFiltrados = this.proveedoresFiltrados.filter(x => x.id !== p.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al eliminar el proveedor';
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
