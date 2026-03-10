package com.inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proveedores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 50)
    private String nit;

    @Column(length = 50)
    private String telefono;

    @Column(length = 100)
    private String correo;

    @Column(length = 200)
    private String direccion;

    @Column(name = "nombre_contacto", length = 150)
    private String nombreContacto;

    @Column(name = "tiempo_entrega", length = 20)
    private String tiempoEntrega;
}
