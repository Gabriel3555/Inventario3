package com.inventario.repository;

import com.inventario.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {
    List<DetalleVenta> findByVentaId(Integer ventaId);
    List<DetalleVenta> findByProductoId(Integer productoId);
}
