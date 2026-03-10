package com.inventario.repository;

import com.inventario.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    List<Venta> findByClienteId(Integer clienteId);
    List<Venta> findByUsuarioId(Integer usuarioId);
    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
    
    // Obtener todas las ventas ordenadas por fecha descendente y luego por ID descendente (más recientes primero)
    List<Venta> findAllByOrderByFechaDescIdDesc();
}
