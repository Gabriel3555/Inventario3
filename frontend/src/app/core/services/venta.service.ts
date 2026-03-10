import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/venta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;

  getAll(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  create(venta: any): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }
}
