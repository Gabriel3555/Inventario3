package com.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasDTO {
    
    // Estadísticas generales
    private Integer totalProductos;
    private Integer totalUnidades;
    private BigDecimal ventasMes;
    private Integer productosStockBajo;
    private BigDecimal valorInventario;
    private Integer ventasPendientes;
    
    // Ventas semanales (últimas 7 semanas)
    private List<VentaSemanal> ventasSemanales;
    
    // Stock por categoría
    private List<StockCategoria> stockCategorias;
    
    // Últimos movimientos
    private List<MovimientoDTO> ultimosMovimientos;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VentaSemanal {
        private String semana;
        private BigDecimal ventas;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockCategoria {
        private String nombre;
        private Integer cantidad;
        private Double porcentaje;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovimientoDTO {
        private String producto;
        private String descripcion;
        private String tipo;
        private Integer cantidad;
        private String fecha;
    }
}
