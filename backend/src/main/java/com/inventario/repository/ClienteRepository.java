package com.inventario.repository;

import com.inventario.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
    
    // Obtener todos los clientes ordenados por ID descendente (más recientes primero)
    List<Cliente> findAllByOrderByIdDesc();
}
