export interface Cliente {
  id?: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  limiteCredito?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
