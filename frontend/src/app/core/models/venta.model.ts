export interface DetalleVenta {
  id: number;
  producto: {
    id: number;
    nombre: string;
    sku?: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    documento?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
  } | null;
  usuario?: {
    id: number;
    nombre?: string;
    correo?: string;
  };
  fecha: string;
  subtotal: number;
  impuesto: number;
  total: number;
  detalles: DetalleVenta[];
}
