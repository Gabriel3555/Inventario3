import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  /** Solo el admin puede crear y eliminar clientes. */
  get isAdmin(): boolean {
    return this.auth.rol() === 'ADMIN';
  }

  loading = false;
  error = '';

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  searchTerm = '';

  paginaActual = 1;
  clientesPorPagina = 6;

  showModal = false;
  modoEdicion = false;
  clienteActual: Cliente = this.getClienteVacio();
  guardando = false;

  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.clientesPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina) || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get rangoInicio(): number {
    if (this.clientesFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.clientesPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.clientesPorPagina, this.clientesFiltrados.length);
  }

  private getClienteVacio(): Cliente {
    return {
      nombre: '',
      documento: '',
      telefono: '',
      correo: '',
      direccion: '',
      limiteCredito: 0
    };
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  aplicarFiltro(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c => {
        const nombre = (c.nombre ?? '').toLowerCase();
        const documento = (c.documento ?? '').toLowerCase();
        const correo = (c.correo ?? '').toLowerCase();
        const telefono = (c.telefono ?? '').toLowerCase();
        const direccion = (c.direccion ?? '').toLowerCase();
        return nombre.includes(term) || documento.includes(term) ||
          correo.includes(term) || telefono.includes(term) || direccion.includes(term);
      });
    }
    this.paginaActual = 1;
  }

  cargarClientes(): void {
    this.loading = true;
    this.error = '';
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.aplicarFiltro();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al cargar los clientes';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.clienteActual = { ...this.getClienteVacio() };
    this.showModal = true;
  }

  abrirModalEditar(c: Cliente): void {
    this.modoEdicion = true;
    this.clienteActual = {
      id: c.id,
      nombre: c.nombre ?? '',
      documento: c.documento ?? '',
      telefono: c.telefono ?? '',
      correo: c.correo ?? '',
      direccion: c.direccion ?? '',
      limiteCredito: c.limiteCredito ?? 0
    };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.clienteActual = this.getClienteVacio();
  }

  guardarCliente(): void {
    if (!this.clienteActual.nombre?.trim()) {
      this.error = 'El nombre es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    this.guardando = true;
    this.error = '';
    const body: Cliente = {
      nombre: this.clienteActual.nombre.trim(),
      documento: this.clienteActual.documento?.trim() || undefined,
      telefono: this.clienteActual.telefono?.trim() || undefined,
      correo: this.clienteActual.correo?.trim() || undefined,
      direccion: this.clienteActual.direccion?.trim() || undefined,
      limiteCredito: this.clienteActual.limiteCredito ?? 0
    };
    const request = this.modoEdicion && this.clienteActual.id
      ? this.clienteService.update(this.clienteActual.id, body)
      : this.clienteService.create(body);
    request.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarClientes();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al guardar el cliente';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCliente(c: Cliente): void {
    if (!c.id) return;
    if (!confirm('¿Eliminar este cliente?')) return;
    this.error = '';
    this.clienteService.delete(c.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(x => x.id !== c.id);
        this.clientesFiltrados = this.clientesFiltrados.filter(x => x.id !== c.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al eliminar el cliente';
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
