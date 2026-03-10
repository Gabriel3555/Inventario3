export interface Proveedor {
  id?: number;
  nombre: string;
  nit?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  nombreContacto?: string;
  tiempoEntrega?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
