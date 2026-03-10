import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote, LotePaginado, EstadisticasLotes, LoteCrear } from '../models/lote.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lotes`;

  /**
   * Obtiene lotes con paginación y ordenados por fecha de vencimiento
   * @param pagina Número de página (1-indexed)
   * @param porPagina Cantidad de items por página
   */
  getLotesPaginados(pagina: number = 1, porPagina: number = 6): Observable<LotePaginado> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('porPagina', porPagina.toString());
    
    return this.http.get<LotePaginado>(`${this.apiUrl}/paginado`, { params });
  }

  /**
   * Obtiene estadísticas generales de lotes
   */
  getEstadisticas(): Observable<EstadisticasLotes> {
    return this.http.get<EstadisticasLotes>(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Obtiene todos los lotes
   */
  getAll(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.apiUrl);
  }

  /**
   * Obtiene un lote por ID
   */
  getById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene lotes por producto
   */
  getByProducto(productoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  /**
   * Crea un nuevo lote
   */
  create(lote: LoteCrear): Observable<Lote> {
    return this.http.post<Lote>(this.apiUrl, lote);
  }

  /**
   * Actualiza un lote existente
   */
  update(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.apiUrl}/${id}`, lote);
  }

  /**
   * Elimina un lote
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Retira un lote por vencimiento (registra movimiento de salida)
   */
  retirarPorVencimiento(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/retirar`, {});
  }
}
