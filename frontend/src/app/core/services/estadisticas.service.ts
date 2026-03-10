import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Estadisticas {
  totalProductos: number;
  totalUnidades: number;
  ventasMes: number;
  productosStockBajo: number;
  valorInventario: number;
  ventasPendientes: number;
  ventasSemanales: VentaSemanal[];
  stockCategorias: StockCategoria[];
  ultimosMovimientos: Movimiento[];
}

export interface VentaSemanal {
  semana: string;
  ventas: number;
}

export interface StockCategoria {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface Movimiento {
  producto: string;
  descripcion: string;
  tipo: string;
  cantidad: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/estadisticas`;

  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(this.apiUrl);
  }
}
