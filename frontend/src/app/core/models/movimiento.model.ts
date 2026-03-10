export interface Movimiento {
  id: number;
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
  tipo: 'ENTRADA' | 'SALIDA' | 'MERMA';
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface MovimientoRequest {
  productoId: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'MERMA';
  cantidad: number;
  motivo: string;
}
