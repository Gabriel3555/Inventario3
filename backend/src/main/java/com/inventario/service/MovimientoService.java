package com.inventario.service;

import com.inventario.dto.MovimientoRequest;
import com.inventario.entity.Movimiento;
import com.inventario.entity.Producto;
import com.inventario.entity.Usuario;
import com.inventario.enums.TipoMovimiento;
import com.inventario.exception.BadRequestException;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Movimiento> findAll() {
        return movimientoRepository.findAllByOrderByFechaDesc();
    }

    public Movimiento findById(Integer id) {
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento", id));
    }

    public List<Movimiento> findByProductoId(Integer productoId) {
        return movimientoRepository.findByProductoId(productoId);
    }

    public List<Movimiento> findByTipo(TipoMovimiento tipo) {
        return movimientoRepository.findByTipo(tipo);
    }

    public List<Movimiento> findByUsuarioId(Integer usuarioId) {
        return movimientoRepository.findByUsuarioId(usuarioId);
    }

    public List<Movimiento> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin) {
        return movimientoRepository.findByFechaBetween(inicio, fin);
    }

    @Transactional
    public Movimiento create(MovimientoRequest request, Integer usuarioId) {
        // Get producto
        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", request.getProductoId()));

        // Get usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        // Validate stock for SALIDA and MERMA
        if ((request.getTipo() == TipoMovimiento.SALIDA || request.getTipo() == TipoMovimiento.MERMA) 
                && producto.getStock() < request.getCantidad()) {
            throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre());
        }

        // Create movimiento
        Movimiento movimiento = Movimiento.builder()
                .producto(producto)
                .usuario(usuario)
                .tipo(request.getTipo())
                .cantidad(request.getCantidad())
                .motivo(request.getMotivo())
                .build();

        movimiento = movimientoRepository.save(movimiento);

        // Update stock
        if (request.getTipo() == TipoMovimiento.ENTRADA) {
            producto.setStock(producto.getStock() + request.getCantidad());
        } else if (request.getTipo() == TipoMovimiento.SALIDA || request.getTipo() == TipoMovimiento.MERMA) {
            producto.setStock(producto.getStock() - request.getCantidad());
        }
        productoRepository.save(producto);

        return movimiento;
    }

    public void delete(Integer id) {
        Movimiento movimiento = findById(id);
        
        // Reverse stock change
        Producto producto = movimiento.getProducto();
        if (movimiento.getTipo() == TipoMovimiento.ENTRADA) {
            producto.setStock(producto.getStock() - movimiento.getCantidad());
        } else if (movimiento.getTipo() == TipoMovimiento.SALIDA || movimiento.getTipo() == TipoMovimiento.MERMA) {
            producto.setStock(producto.getStock() + movimiento.getCantidad());
        }
        productoRepository.save(producto);
        
        movimientoRepository.delete(movimiento);
    }
}
