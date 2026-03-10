import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../models/movimiento.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/movimientos`;

  getAll(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  getById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  getByProductoId(productoId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  getByTipo(tipo: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  getByUsuarioId(usuarioId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getByFechaBetween(inicio: string, fin: string): Observable<Movimiento[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    return this.http.get<Movimiento[]>(`${this.apiUrl}/fecha`, { params });
  }

  create(movimiento: any): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
