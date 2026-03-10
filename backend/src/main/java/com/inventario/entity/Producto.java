package com.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "codigo_barras", length = 100)
    private String codigoBarras;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    @JsonIgnoreProperties({"productos"})
    private Categoria categoria;

    @Column(name = "precio_compra", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCompra;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer stock = 0;

    @Column(name = "stock_minimo", columnDefinition = "INT DEFAULT 0")
    private Integer stockMinimo = 0;

    @Column(length = 100)
    private String ubicacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "impuesto_id")
    @JsonIgnoreProperties({"productos"})
    private Impuesto impuesto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id")
    @JsonIgnoreProperties({"productos"})
    private Proveedor proveedor;
}
