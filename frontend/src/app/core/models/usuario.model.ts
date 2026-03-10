export type Rol = 'ADMIN' | 'VENDEDOR';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: Rol;
  fechaCreacion?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
