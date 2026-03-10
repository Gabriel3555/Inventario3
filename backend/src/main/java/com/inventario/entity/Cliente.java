package com.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "clientes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 50)
    private String documento;

    @Column(length = 50)
    private String telefono;

    @Column(length = 100)
    private String correo;

    @Column(length = 200)
    private String direccion;

    @Column(name = "limite_credito", precision = 10, scale = 2)
    private BigDecimal limiteCredito = BigDecimal.ZERO;
}
