export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  codigoBarras?: string;
  categoria?: Categoria;
  precioCompra: number | string;
  precioVenta: number | string;
  stock: number;
  stockMinimo: number;
  ubicacion?: string;
  impuesto?: Impuesto;
  proveedor?: Proveedor;
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Impuesto {
  id?: number;
  nombre?: string;
  porcentaje: number;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface ProductoPaginado {
  productos: Producto[];
  total: number;
  pagina: number;
  porPagina: number;
}
