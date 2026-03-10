package com.inventario.repository;

import com.inventario.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    Optional<Producto> findBySku(String sku);
    Optional<Producto> findByCodigoBarras(String codigoBarras);
    List<Producto> findByCategoriaId(Integer categoriaId);
    List<Producto> findByProveedorId(Integer proveedorId);
    boolean existsBySku(String sku);

    @Query("SELECT p FROM Producto p WHERE p.stock <= p.stockMinimo")
    List<Producto> findProductosConStockBajo();

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
