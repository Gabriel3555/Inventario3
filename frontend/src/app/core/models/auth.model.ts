export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
  rol: 'ADMIN' | 'VENDEDOR';
}

export interface JwtResponse {
  token: string;
  tipo: string;
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export type Rol = 'ADMIN' | 'VENDEDOR';
