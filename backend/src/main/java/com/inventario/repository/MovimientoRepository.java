package com.inventario.repository;

import com.inventario.entity.Movimiento;
import com.inventario.enums.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Integer> {
    List<Movimiento> findByProductoId(Integer productoId);
    List<Movimiento> findByTipo(TipoMovimiento tipo);
    List<Movimiento> findByUsuarioId(Integer usuarioId);
    List<Movimiento> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
    
    // Obtener todos los movimientos ordenados por fecha descendente (más recientes primero)
    List<Movimiento> findAllByOrderByFechaDesc();
    
    // Obtener los últimos N movimientos
    List<Movimiento> findTop10ByOrderByFechaDesc();
}
