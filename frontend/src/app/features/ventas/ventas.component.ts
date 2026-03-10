import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../core/services/venta.service';
import { LoteService } from '../../core/services/lote.service';
import { ClienteService } from '../../core/services/cliente.service';
import { Venta } from '../../core/models/venta.model';
import { Cliente } from '../../core/models/cliente.model';
import { LoteConEstado } from '../../core/models/lote.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private loteService = inject(LoteService);
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm: string = '';
  loading = false;
  error = '';

  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;
  
  // Modal realizar venta
  mostrarModalVenta: boolean = false;
  guardandoVenta: boolean = false;
  clientes: Cliente[] = [];
  /** Líneas (lotes) añadidos a la venta actual; cada una puede ser distinto producto/cantidad */
  detallesEnVenta: Array<{ loteInfo: LoteConEstado; numeroLote: string; cantidad: number }> = [];
  ventaForm: {
    clienteId: number | null;
    numeroLote: string;
    loteInfo: LoteConEstado | null;
    cantidad: number;
    buscandoLote: boolean;
    errorLote: string;
  } = {
    clienteId: null,
    numeroLote: '',
    loteInfo: null,
    cantidad: 0,
    buscandoLote: false,
    errorLote: ''
  };
  errorVenta: string = '';

  paginaActual = 1;
  ventasPorPagina = 10;

  get stats() {
    const totalCompletadas = this.ventas.reduce((sum, v) => sum + (v.total ?? 0), 0);
    return {
      completadas: totalCompletadas,
      pendientes: 0,
      totalVentas: this.ventas.length
    };
  }

  get ventasPaginadas(): Venta[] {
    const inicio = (this.paginaActual - 1) * this.ventasPorPagina;
    const fin = inicio + this.ventasPorPagina;
    return this.ventasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.ventasFiltradas.length / this.ventasPorPagina) || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get rangoInicio(): number {
    if (this.ventasFiltradas.length === 0) return 0;
    return (this.paginaActual - 1) * this.ventasPorPagina + 1;
  }

  get rangoFin(): number {
    return Math.min(this.paginaActual * this.ventasPorPagina, this.ventasFiltradas.length);
  }

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  cargarVentas(): void {
    this.loading = true;
    this.error = '';
    this.ventaService.getAll().subscribe({
      next: (data) => {
        this.ventas = data;
        this.ventasFiltradas = [...data];
        this.paginaActual = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Error al cargar las ventas';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarVentas(): void {
    if (!this.searchTerm.trim()) {
      this.ventasFiltradas = [...this.ventas];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.ventasFiltradas = this.ventas.filter(v =>
        this.formatearIdVenta(v.id).toLowerCase().includes(term) ||
        (v.cliente?.nombre ?? '').toLowerCase().includes(term)
      );
    }
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.ventaSeleccionada = null;
  }

  formatearIdVenta(id: number): string {
    return 'V' + String(id).padStart(3, '0');
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /** El backend no tiene estado; todas las ventas guardadas se muestran como Completada */
  getEstadoDisplay(): string {
    return 'Completada';
  }

  getEstadoClase(_estado?: string): string {
    return 'estado-completada';
  }

  // Modal Realizar Venta
  abrirModalVenta(): void {
    this.mostrarModalVenta = true;
    this.resetearFormVenta();
  }

  cerrarModalVenta(): void {
    this.mostrarModalVenta = false;
    this.resetearFormVenta();
  }

  resetearFormVenta(): void {
    this.detallesEnVenta = [];
    this.ventaForm = {
      clienteId: null,
      numeroLote: '',
      loteInfo: null,
      cantidad: 0,
      buscandoLote: false,
      errorLote: ''
    };
    this.errorVenta = '';
  }

  onNumeroLoteVentaChange(): void {
    // Limpiar datos previos
    this.ventaForm.loteInfo = null;
    this.ventaForm.errorLote = '';
    this.ventaForm.cantidad = 0;

    // Verificar si se completaron 13 dígitos
    if (this.ventaForm.numeroLote.length === 13 && /^\d{13}$/.test(this.ventaForm.numeroLote)) {
      this.buscarLoteParaVenta();
    }
  }

  buscarLoteParaVenta(): void {
    this.ventaForm.buscandoLote = true;
    this.ventaForm.errorLote = '';

    this.loteService.getLotesPaginados(1, 1000).subscribe({
      next: (response) => {
        const lote = response.lotes.find(l => l.codigo === this.ventaForm.numeroLote);
        
        if (lote) {
          // Verificar si el lote está vendido (cantidad 0)
          if (lote.stock === 0 || lote.estado === 'Vendido') {
            this.ventaForm.errorLote = 'Este lote ya está vendido (sin stock disponible)';
            this.ventaForm.loteInfo = null;
          } else {
            this.ventaForm.loteInfo = lote;
            // Auto-seleccionar la cantidad máxima disponible
            this.ventaForm.cantidad = lote.stock || 0;
          }
        } else {
          this.ventaForm.errorLote = 'Lote no encontrado';
        }
        this.ventaForm.buscandoLote = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ventaForm.errorLote = 'Error al buscar el lote';
        this.ventaForm.buscandoLote = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Añade el lote actual (con cantidad) a la lista de detalles de la venta. Permite seguir añadiendo más lotes. */
  agregarLoteALaVenta(): void {
    if (!this.ventaForm.loteInfo) {
      this.errorVenta = 'Por favor ingrese un número de lote válido';
      return;
    }
    if (this.ventaForm.cantidad <= 0) {
      this.errorVenta = 'La cantidad debe ser mayor a 0';
      return;
    }
    if (this.ventaForm.cantidad > (this.ventaForm.loteInfo.stock || 0)) {
      this.errorVenta = `La cantidad no puede ser mayor al stock disponible (${this.ventaForm.loteInfo.stock})`;
      return;
    }
    this.errorVenta = '';
    this.detallesEnVenta.push({
      loteInfo: this.ventaForm.loteInfo,
      numeroLote: this.ventaForm.numeroLote,
      cantidad: this.ventaForm.cantidad
    });
    // Limpiar el formulario de lote para permitir escanear otro
    this.ventaForm.numeroLote = '';
    this.ventaForm.loteInfo = null;
    this.ventaForm.cantidad = 0;
    this.ventaForm.errorLote = '';
    this.cdr.detectChanges();
  }

  quitarDetalleDeVenta(index: number): void {
    this.detallesEnVenta.splice(index, 1);
    this.cdr.detectChanges();
  }

  realizarVenta(): void {
    // Validaciones
    if (!this.ventaForm.clienteId) {
      this.errorVenta = 'Por favor seleccione un cliente';
      return;
    }
    if (this.detallesEnVenta.length === 0) {
      this.errorVenta = 'Añada al menos un lote a la venta (escanea el lote, indica cantidad y pulse "Añadir lote a la venta")';
      return;
    }

    this.guardandoVenta = true;
    this.errorVenta = '';

    const ventaData = {
      clienteId: this.ventaForm.clienteId,
      detalles: this.detallesEnVenta.map(d => ({
        productoId: d.loteInfo.productoId,
        cantidad: d.cantidad,
        precioUnitario: 0,
        numeroLote: d.numeroLote
      }))
    };

    this.ventaService.create(ventaData).subscribe({
      next: () => {
        this.guardandoVenta = false;
        this.cerrarModalVenta();
        this.cargarVentas();
      },
      error: (err) => {
        this.guardandoVenta = false;
        this.errorVenta = err.error?.message || 'Error al realizar la venta';
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Vencido':
        return 'badge-vencido';
      case 'Por Vencer':
        return 'badge-por-vencer';
      case 'Vigente':
        return 'badge-vigente';
      case 'Vendido':
        return 'badge-vendido';
      default:
        return '';
    }
  }

  descargarRecibo(venta: Venta): void {
    const id = this.formatearIdVenta(venta.id);
    const fecha = this.formatearFecha(venta.fecha);
    const cliente = venta.cliente?.nombre ?? 'Consumidor final';
    const documento = venta.cliente?.documento ? `Doc: ${venta.cliente.documento}` : '';
    const telefono = venta.cliente?.telefono ? `Tel: ${venta.cliente.telefono}` : '';
    const vendedor = venta.usuario?.nombre ?? '';

    const filasDetalles = (venta.detalles ?? []).map(d => `
      <tr>
        <td>${d.producto.nombre}${d.producto.sku ? ` <small>(${d.producto.sku})</small>` : ''}</td>
        <td class="center">${d.cantidad}</td>
        <td class="right">${this.formatearMoneda(d.precioUnitario)}</td>
        <td class="right">${this.formatearMoneda(d.subtotal)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Recibo ${id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; padding: 32px; }
    .recibo { max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; }
    .empresa-nombre { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .empresa-sub { font-size: 11px; opacity: .8; margin-top: 2px; }
    .recibo-meta { text-align: right; }
    .recibo-meta .num { font-size: 18px; font-weight: 700; }
    .recibo-meta .fecha { font-size: 11px; opacity: .8; margin-top: 2px; }
    .body { padding: 24px 28px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-box { background: #f8fafc; border-radius: 8px; padding: 12px 14px; }
    .info-box .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: .5px; margin-bottom: 4px; }
    .info-box .value { font-size: 13px; font-weight: 600; color: #1e293b; }
    .info-box .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead tr { background: #6366f1; color: #fff; }
    thead th { padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .center { text-align: center; }
    .right { text-align: right; }
    .totales { background: #f8fafc; border-radius: 8px; padding: 16px 18px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #475569; }
    .total-final { border-top: 2px solid #6366f1; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 700; color: #1e293b; }
    .footer { text-align: center; padding: 16px 28px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 24px; }
    @media print {
      body { padding: 0; }
      .recibo { border: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <div>
        <div class="empresa-nombre">StockPro</div>
        <div class="empresa-sub">Sistema de Inventario</div>
      </div>
      <div class="recibo-meta">
        <div class="num">RECIBO ${id}</div>
        <div class="fecha">${fecha}</div>
      </div>
    </div>

    <div class="body">
      <div class="info-grid">
        <div class="info-box">
          <div class="label">Cliente</div>
          <div class="value">${cliente}</div>
          ${documento ? `<div class="sub">${documento}</div>` : ''}
          ${telefono ? `<div class="sub">${telefono}</div>` : ''}
        </div>
        <div class="info-box">
          <div class="label">Vendedor</div>
          <div class="value">${vendedor || '—'}</div>
          <div class="sub">Estado: Completada</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="center">Cant.</th>
            <th class="right">Precio Unit.</th>
            <th class="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${filasDetalles}
        </tbody>
      </table>

      <div class="totales">
        <div class="total-row"><span>Subtotal</span><span>${this.formatearMoneda(venta.subtotal)}</span></div>
        <div class="total-row"><span>Impuestos</span><span>${this.formatearMoneda(venta.impuesto)}</span></div>
        <div class="total-row total-final"><span>TOTAL</span><span>${this.formatearMoneda(venta.total)}</span></div>
      </div>
    </div>

    <div class="footer">
      Gracias por su compra &bull; StockPro &bull; Recibo generado el ${new Date().toLocaleString('es-CO')}
    </div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const ventana = window.open('', '_blank', 'width=700,height=900');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

  imprimirReciboTexto(venta: Venta): void {
    const ancho = 43;
    const lineas: string[] = [];
    const sep = '===========================================';
    const sep2 = '-------------------------------------------';
    const centrar = (texto: string) => {
      const t = texto.trim();
      if (t.length >= ancho) return t.substring(0, ancho);
      return ' '.repeat(Math.floor((ancho - t.length) / 2)) + t;
    };
    const izq = (texto: string, w: number) => (String(texto).trim() + ' '.repeat(w)).substring(0, w);
    const der = (texto: string, w: number) => (' '.repeat(w) + String(texto).trim()).slice(-w);

    const id = this.formatearIdVenta(venta.id);
    const fecha = this.formatearFecha(venta.fecha);
    const cliente = venta.cliente?.nombre ?? 'Consumidor final';
    const doc = venta.cliente?.documento ?? '';
    const tel = venta.cliente?.telefono ?? '';
    const vendedor = venta.usuario?.nombre ?? '';

    const wProducto = 16;
    const wCant = 5;
    const wPUnit = 10;
    const wTotal = 12;
    const wResumenEtq = 20;
    const wResumenVal = 12;

    lineas.push(sep, centrar('STOCKPRO'), centrar('Sistema de Inventario'), sep);
    lineas.push('Recibo: ' + id, 'Fecha:  ' + fecha, sep2);
    lineas.push('Cliente: ' + cliente.substring(0, ancho - 8));
    if (doc) lineas.push('Doc:    ' + doc);
    if (tel) lineas.push('Tel:    ' + tel);
    lineas.push('Vendedor: ' + (vendedor || '-').substring(0, ancho - 10), sep2);
    lineas.push(izq('Producto', wProducto) + der('Cant', wCant) + der('P.Unit', wPUnit) + der('Total', wTotal), sep2);

    for (const d of venta.detalles ?? []) {
      const nombre = (d.producto?.nombre ?? '').substring(0, wProducto);
      const pUnit = this.formatearMoneda(d.precioUnitario);
      const totalLinea = this.formatearMoneda(d.subtotal);
      lineas.push(izq(nombre, wProducto) + der(String(d.cantidad), wCant) + der(pUnit, wPUnit) + der(totalLinea, wTotal));
    }

    lineas.push(sep2);
    lineas.push(izq('Subtotal:', wResumenEtq) + der(this.formatearMoneda(venta.subtotal), wResumenVal));
    lineas.push(izq('Impuestos:', wResumenEtq) + der(this.formatearMoneda(venta.impuesto), wResumenVal));
    lineas.push(sep2);
    lineas.push(izq('TOTAL:', wResumenEtq) + der(this.formatearMoneda(venta.total), wResumenVal));
    lineas.push(sep);
    lineas.push(centrar('Gracias por su compra'), sep);

    const texto = lineas.join('\n');
    const escaped = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Recibo ' + id + '</title>' +
      '<style>*{margin:0;padding:0}body{font-family:\'Courier New\',Courier,monospace;font-size:12px;line-height:1.35;color:#000;background:#fff;padding:8px}' +
      '.r{width:320px;margin:0 auto;white-space:pre}@media print{body{padding:0}.r{width:80mm}}</style></head><body>' +
      '<pre class="r">' + escaped + '</pre><script>window.onload=function(){window.print()}<\\/script></body></html>';

    const w = window.open('', '_blank', 'width=320,height=520');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }
}
