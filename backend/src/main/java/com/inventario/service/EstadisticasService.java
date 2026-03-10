package com.inventario.service;

import com.inventario.dto.EstadisticasDTO;
import com.inventario.entity.Lote;
import com.inventario.entity.Movimiento;
import com.inventario.entity.Producto;
import com.inventario.entity.Venta;
import com.inventario.repository.LoteRepository;
import com.inventario.repository.MovimientoRepository;
import com.inventario.repository.ProductoRepository;
import com.inventario.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;
    private final MovimientoRepository movimientoRepository;
    private final LoteRepository loteRepository;

    public EstadisticasDTO getEstadisticasGenerales() {
        // Obtener todos los productos
        List<Producto> productos = productoRepository.findAll();
        
        // Total de productos
        Integer totalProductos = productos.size();
        
        // Total de unidades (suma de cantidades en lotes)
        List<Lote> todosLosLotes = loteRepository.findAll();
        Integer totalUnidades = todosLosLotes.stream()
                .mapToInt(Lote::getCantidad)
                .sum();
        
        // Productos con stock bajo
        Integer productosStockBajo = (int) productos.stream()
                .filter(p -> p.getStock() <= p.getStockMinimo())
                .count();
        
        // Valor del inventario (basado en stock actual)
        BigDecimal valorInventario = productos.stream()
                .map(p -> p.getPrecioVenta().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Ventas del mes actual
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finMes = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        List<Venta> ventasDelMes = ventaRepository.findByFechaBetween(inicioMes, finMes);
        BigDecimal ventasMes = ventasDelMes.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Ventas semanales (últimas 7 semanas)
        List<EstadisticasDTO.VentaSemanal> ventasSemanales = calcularVentasSemanales();
        
        // Stock por categoría (basado en lotes)
        List<EstadisticasDTO.StockCategoria> stockCategorias = calcularStockPorCategoriaDesdelotes(todosLosLotes, totalUnidades);
        
        // Últimos movimientos
        List<EstadisticasDTO.MovimientoDTO> ultimosMovimientos = obtenerUltimosMovimientos();
        
        return EstadisticasDTO.builder()
                .totalProductos(totalProductos)
                .totalUnidades(totalUnidades)
                .ventasMes(ventasMes)
                .productosStockBajo(productosStockBajo)
                .valorInventario(valorInventario)
                .ventasPendientes(0)
                .ventasSemanales(ventasSemanales)
                .stockCategorias(stockCategorias)
                .ultimosMovimientos(ultimosMovimientos)
                .build();
    }
    
    private List<EstadisticasDTO.VentaSemanal> calcularVentasSemanales() {
        List<EstadisticasDTO.VentaSemanal> resultado = new ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime finSemana = LocalDateTime.now().minusWeeks(i);
            LocalDateTime inicioSemana = finSemana.minusDays(6)
                    .withHour(0).withMinute(0).withSecond(0);
            finSemana = finSemana.withHour(23).withMinute(59).withSecond(59);
            
            List<Venta> ventasSemana = ventaRepository.findByFechaBetween(inicioSemana, finSemana);
            BigDecimal totalSemana = ventasSemana.stream()
                    .map(Venta::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            String etiquetaSemana = i == 0 ? "Esta semana" : "S-" + i;
            
            resultado.add(EstadisticasDTO.VentaSemanal.builder()
                    .semana(etiquetaSemana)
                    .ventas(totalSemana)
                    .build());
        }
        
        return resultado;
    }
    
    private List<EstadisticasDTO.StockCategoria> calcularStockPorCategoria(List<Producto> productos, Integer totalUnidades) {
        Map<String, Integer> stockPorCategoria = new HashMap<>();
        
        for (Producto p : productos) {
            String categoria = p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría";
            stockPorCategoria.put(categoria, stockPorCategoria.getOrDefault(categoria, 0) + p.getStock());
        }
        
        return stockPorCategoria.entrySet().stream()
                .map(entry -> EstadisticasDTO.StockCategoria.builder()
                        .nombre(entry.getKey())
                        .cantidad(entry.getValue())
                        .porcentaje(totalUnidades > 0 ? 
                                BigDecimal.valueOf(entry.getValue())
                                        .multiply(BigDecimal.valueOf(100))
                                        .divide(BigDecimal.valueOf(totalUnidades), 2, RoundingMode.HALF_UP)
                                        .doubleValue() : 0.0)
                        .build())
                .sorted((a, b) -> b.getCantidad().compareTo(a.getCantidad()))
                .limit(6)
                .collect(Collectors.toList());
    }
    
    private List<EstadisticasDTO.StockCategoria> calcularStockPorCategoriaDesdelotes(List<Lote> lotes, Integer totalUnidades) {
        Map<String, Integer> stockPorCategoria = new HashMap<>();
        
        for (Lote lote : lotes) {
            Producto p = lote.getProducto();
            String categoria = p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría";
            stockPorCategoria.put(categoria, stockPorCategoria.getOrDefault(categoria, 0) + lote.getCantidad());
        }
        
        return stockPorCategoria.entrySet().stream()
                .map(entry -> EstadisticasDTO.StockCategoria.builder()
                        .nombre(entry.getKey())
                        .cantidad(entry.getValue())
                        .porcentaje(totalUnidades > 0 ? 
                                BigDecimal.valueOf(entry.getValue())
                                        .multiply(BigDecimal.valueOf(100))
                                        .divide(BigDecimal.valueOf(totalUnidades), 2, RoundingMode.HALF_UP)
                                        .doubleValue() : 0.0)
                        .build())
                .sorted((a, b) -> b.getCantidad().compareTo(a.getCantidad()))
                .limit(6)
                .collect(Collectors.toList());
    }
    
    private List<EstadisticasDTO.MovimientoDTO> obtenerUltimosMovimientos() {
        List<Movimiento> movimientos = movimientoRepository.findTop10ByOrderByFechaDesc();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        return movimientos.stream()
                .map(m -> EstadisticasDTO.MovimientoDTO.builder()
                        .producto(m.getProducto().getNombre())
                        .descripcion(m.getMotivo())
                        .tipo(m.getTipo().toString().toLowerCase())
                        .cantidad(m.getTipo().toString().equals("ENTRADA") ? m.getCantidad() : -m.getCantidad())
                        .fecha(m.getFecha().format(formatter))
                        .build())
                .collect(Collectors.toList());
    }
}
