package com.inventario.repository;

import com.inventario.entity.Lote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Integer> {
    List<Lote> findByProductoId(Integer productoId);
    
    Optional<Lote> findByNumeroLote(String numeroLote);

    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento <= :fecha")
    List<Lote> findLotesVencidos(@Param("fecha") LocalDate fecha);

    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento BETWEEN :hoy AND :limite")
    List<Lote> findLotesProximosAVencer(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);
    
    @Query("SELECT l FROM Lote l ORDER BY l.fechaVencimiento ASC")
    Page<Lote> findAllOrderByFechaVencimiento(Pageable pageable);
    
    @Query("SELECT COUNT(l) FROM Lote l WHERE l.fechaVencimiento IS NOT NULL")
    Long countLotesConFechaVencimiento();
    
    @Query("SELECT COUNT(l) FROM Lote l WHERE l.fechaVencimiento BETWEEN :hoy AND :limite")
    Long countLotesProximosAVencer(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);
    
    @Query("SELECT COUNT(l) FROM Lote l WHERE l.fechaVencimiento < :fecha")
    Long countLotesVencidos(@Param("fecha") LocalDate fecha);
}
