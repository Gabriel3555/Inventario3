export interface Lote {
  id?: number;
  codigo: string;
  productoId: number;
  productoNombre?: string;
  productoSku?: string;
  categoriaId?: number;
  categoriaNombre?: string;
  fechaVencimiento: string; // ISO date string
  stock?: number;
  fechaIngreso?: string;
}

export interface LoteCrear {
  producto: {
    id: number;
  };
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
}

export interface LoteConEstado extends Lote {
  diasRestantes: number;
  estado: 'Vencido' | 'Por Vencer' | 'Vigente' | 'Vendido';
}

export interface LotePaginado {
  lotes: LoteConEstado[];
  total: number;
  pagina: number;
  porPagina: number;
  conLote: number;
  porVencer: number;
  vencidos: number;
}

export interface EstadisticasLotes {
  conLote: number;
  porVencer: number;
  vencidos: number;
}
