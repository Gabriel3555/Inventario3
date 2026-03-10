package com.inventario.repository;

import com.inventario.entity.Impuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ImpuestoRepository extends JpaRepository<Impuesto, Integer> {
    Optional<Impuesto> findByPorcentaje(BigDecimal porcentaje);
}
