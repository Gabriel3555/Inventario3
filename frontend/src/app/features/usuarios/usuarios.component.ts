import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario, Rol } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  paginaActual = 1;
  usuariosPorPagina = 6;

  showModal = false;
  modoEdicion = false;
  usuarioActual: Usuario & { passwordConfirm?: string } = this.getUsuarioVacio();
  guardando = false;

  readonly roles: Rol[] = ['ADMIN', 'VENDEDOR'];

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.usuariosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.usuariosPorPagina) || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get rangoInicio(): number {
    if (this.usuariosFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.usuariosPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.usuariosPorPagina, this.usuariosFiltrados.length);
  }

  private getUsuarioVacio(): Usuario & { passwordConfirm?: string } {
    return {
      nombre: '',
      correo: '',
      password: '',
      rol: 'VENDEDOR',
      passwordConfirm: ''
    };
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...data];
        this.paginaActual = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al cargar los usuarios';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.usuarioActual = { ...this.getUsuarioVacio() };
    this.showModal = true;
  }

  abrirModalEditar(u: Usuario): void {
    this.modoEdicion = true;
    this.usuarioActual = {
      id: u.id,
      nombre: u.nombre ?? '',
      correo: u.correo ?? '',
      password: '',
      rol: u.rol ?? 'VENDEDOR',
      passwordConfirm: ''
    };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.usuarioActual = this.getUsuarioVacio();
  }

  guardarUsuario(): void {
    if (!this.usuarioActual.nombre?.trim()) {
      this.error = 'El nombre es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    if (!this.usuarioActual.correo?.trim()) {
      this.error = 'El correo es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    if (!this.modoEdicion && !this.usuarioActual.password?.trim()) {
      this.error = 'La contraseña es obligatoria al crear';
      this.cdr.detectChanges();
      return;
    }
    if (this.usuarioActual.password?.trim() && this.usuarioActual.password !== this.usuarioActual.passwordConfirm) {
      this.error = 'Las contraseñas no coinciden';
      this.cdr.detectChanges();
      return;
    }
    this.guardando = true;
    this.error = '';
    const body: Usuario = {
      nombre: this.usuarioActual.nombre.trim(),
      correo: this.usuarioActual.correo.trim(),
      rol: this.usuarioActual.rol,
      ...(this.usuarioActual.password?.trim() ? { password: this.usuarioActual.password.trim() } : {})
    };
    const request = this.modoEdicion && this.usuarioActual.id
      ? this.usuarioService.update(this.usuarioActual.id, body)
      : this.usuarioService.create({ ...body, password: this.usuarioActual.password!.trim() });
    request.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarUsuarios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al guardar el usuario';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(u: Usuario): void {
    if (!u.id) return;
    if (!confirm('¿Eliminar este usuario?')) return;
    this.error = '';
    this.usuarioService.delete(u.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(x => x.id !== u.id);
        this.usuariosFiltrados = this.usuariosFiltrados.filter(x => x.id !== u.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al eliminar el usuario';
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

  etiquetaRol(rol: Rol): string {
    return rol === 'ADMIN' ? 'Administrador' : 'Vendedor';
  }
}
