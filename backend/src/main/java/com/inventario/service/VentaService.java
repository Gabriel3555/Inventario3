package com.inventario.service;

import com.inventario.dto.DetalleVentaRequest;
import com.inventario.dto.VentaRequest;
import com.inventario.entity.*;
import com.inventario.exception.BadRequestException;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoRepository movimientoRepository;
    private final LoteRepository loteRepository;

    public List<Venta> findAll() {
        return ventaRepository.findAllByOrderByFechaDescIdDesc();
    }

    public Venta findById(Integer id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));
    }

    public List<Venta> findByClienteId(Integer clienteId) {
        return ventaRepository.findByClienteId(clienteId);
    }

    public List<Venta> findByUsuarioId(Integer usuarioId) {
        return ventaRepository.findByUsuarioId(usuarioId);
    }

    public List<Venta> findByFechaBetween(java.time.LocalDateTime inicio, java.time.LocalDateTime fin) {
        return ventaRepository.findByFechaBetween(inicio, fin);
    }

    @Transactional
    public Venta create(VentaRequest request, Integer usuarioId) {
        // Get cliente (optional)
        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente", request.getClienteId()));
        }

        // Get usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        // Create venta
        Venta venta = Venta.builder()
                .cliente(cliente)
                .usuario(usuario)
                .detalles(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal impuesto = BigDecimal.ZERO;

        // Process each detail
        for (DetalleVentaRequest detalleRequest : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleRequest.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", detalleRequest.getProductoId()));

            // Si se especificó un lote, validar y reducir del lote
            if (detalleRequest.getNumeroLote() != null && !detalleRequest.getNumeroLote().isEmpty()) {
                Lote lote = loteRepository.findByNumeroLote(detalleRequest.getNumeroLote())
                        .orElseThrow(() -> new BadRequestException("Lote no encontrado: " + detalleRequest.getNumeroLote()));
                
                // Verificar que el lote sea del producto correcto
                if (!lote.getProducto().getId().equals(producto.getId())) {
                    throw new BadRequestException("El lote " + detalleRequest.getNumeroLote() + " no corresponde al producto seleccionado");
                }
                
                // Verificar que el lote no esté vendido (cantidad 0)
                if (lote.getCantidad() == 0) {
                    throw new BadRequestException("El lote " + detalleRequest.getNumeroLote() + " ya está vendido (sin stock disponible)");
                }
                
                // Check stock del lote
                if (lote.getCantidad() < detalleRequest.getCantidad()) {
                    throw new BadRequestException("Stock insuficiente en el lote " + detalleRequest.getNumeroLote() + ". Disponible: " + lote.getCantidad());
                }
                
                // Reducir cantidad del lote
                lote.setCantidad(lote.getCantidad() - detalleRequest.getCantidad());
                loteRepository.save(lote);
                // No eliminamos el lote, lo dejamos en 0 para marcarlo como "Vendido"
            } else {
                // Check stock general del producto
                if (producto.getStock() < detalleRequest.getCantidad()) {
                    throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre());
                }
            }

            // Calculate subtotal
            BigDecimal precioUnitario = producto.getPrecioVenta();
            BigDecimal subtotalDetalle = precioUnitario.multiply(BigDecimal.valueOf(detalleRequest.getCantidad()));
            
            // Calculate tax if applies
            BigDecimal impuestoDetalle = BigDecimal.ZERO;
            if (producto.getImpuesto() != null) {
                impuestoDetalle = subtotalDetalle.multiply(producto.getImpuesto().getPorcentaje())
                        .divide(BigDecimal.valueOf(100));
            }

            // Create detalle
            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(detalleRequest.getCantidad())
                    .precioUnitario(precioUnitario)
                    .subtotal(subtotalDetalle.add(impuestoDetalle))
                    .build();

            venta.getDetalles().add(detalle);

            // Update stock del producto
            producto.setStock(producto.getStock() - detalleRequest.getCantidad());
            productoRepository.save(producto);

            subtotal = subtotal.add(subtotalDetalle);
            impuesto = impuesto.add(impuestoDetalle);
        }

        // Set totals
        venta.setSubtotal(subtotal);
        venta.setImpuesto(impuesto);
        venta.setTotal(subtotal.add(impuesto));

        // Guardar la venta primero para obtener el ID
        Venta ventaGuardada = ventaRepository.save(venta);
        
        // Ahora crear los movimientos con el ID de la venta
        for (DetalleVentaRequest detalleRequest : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleRequest.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", detalleRequest.getProductoId()));
            
            // Create movement
            String motivoMovimiento = "Venta #" + ventaGuardada.getId();
            if (detalleRequest.getNumeroLote() != null && !detalleRequest.getNumeroLote().isEmpty()) {
                motivoMovimiento = "Venta #" + ventaGuardada.getId() + " - Lote: " + detalleRequest.getNumeroLote();
            }
            
            Movimiento movimiento = Movimiento.builder()
                    .producto(producto)
                    .usuario(usuario)
                    .tipo(com.inventario.enums.TipoMovimiento.SALIDA)
                    .cantidad(detalleRequest.getCantidad())
                    .motivo(motivoMovimiento)
                    .build();
            movimientoRepository.save(movimiento);
        }

        return ventaGuardada;
    }

    @Transactional
    public void delete(Integer id) {
        Venta venta = findById(id);
        
        // Restore stock for each detail
        for (DetalleVenta detalle : venta.getDetalles()) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }
        
        ventaRepository.delete(venta);
    }
}
