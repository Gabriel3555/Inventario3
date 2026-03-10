package com.inventario.repository;

import com.inventario.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    List<Proveedor> findByNombreContainingIgnoreCase(String nombre);
    
    // Obtener todos los proveedores ordenados por ID descendente (más recientes primero)
    List<Proveedor> findAllByOrderByIdDesc();
}
