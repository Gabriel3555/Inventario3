package com.inventario.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoteConEstadoDTO {
    private Integer id;
    private String codigo;
    private Integer productoId;
    private String productoNombre;
    private String productoSku;
    private Integer categoriaId;
    private String categoriaNombre;
    private LocalDate fechaVencimiento;
    private Integer stock;
    private LocalDate fechaIngreso;
    private Integer diasRestantes;
    private String estado; // "Vencido", "Por Vencer", "Vigente"
}
