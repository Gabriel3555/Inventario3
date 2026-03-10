package com.inventario.service;

import com.inventario.dto.EstadisticasLotesDTO;
import com.inventario.dto.LoteConEstadoDTO;
import com.inventario.dto.LotePaginadoDTO;
import com.inventario.entity.Lote;
import com.inventario.entity.Producto;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.LoteRepository;
import com.inventario.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository loteRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoService movimientoService;

    public List<Lote> findAll() {
        return loteRepository.findAll();
    }

    public Lote findById(Integer id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", id));
    }

    public List<Lote> findByProductoId(Integer productoId) {
        return loteRepository.findByProductoId(productoId);
    }

    public List<Lote> findLotesVencidos() {
        return loteRepository.findLotesVencidos(LocalDate.now());
    }

    public List<Lote> findLotesProximosAVencer(int dias) {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(dias);
        return loteRepository.findLotesProximosAVencer(hoy, limite);
    }
    
    /**
     * Obtiene lotes paginados ordenados por fecha de vencimiento (más próximos primero)
     */
    public LotePaginadoDTO getLotesPaginados(int pagina, int porPagina) {
        Pageable pageable = PageRequest.of(pagina - 1, porPagina);
        Page<Lote> lotesPage = loteRepository.findAllOrderByFechaVencimiento(pageable);
        
        LocalDate hoy = LocalDate.now();
        
        List<LoteConEstadoDTO> lotesConEstado = lotesPage.getContent().stream()
                .map(lote -> convertirALoteConEstadoDTO(lote, hoy))
                .collect(Collectors.toList());
        
        EstadisticasLotesDTO estadisticas = getEstadisticas();
        
        return LotePaginadoDTO.builder()
                .lotes(lotesConEstado)
                .total(lotesPage.getTotalElements())
                .pagina(pagina)
                .porPagina(porPagina)
                .conLote(estadisticas.getConLote())
                .porVencer(estadisticas.getPorVencer())
                .vencidos(estadisticas.getVencidos())
                .build();
    }
    
    /**
     * Obtiene estadísticas generales de lotes
     */
    public EstadisticasLotesDTO getEstadisticas() {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(90);
        
        Long conLote = loteRepository.countLotesConFechaVencimiento();
        Long porVencer = loteRepository.countLotesProximosAVencer(hoy, limite);
        Long vencidos = loteRepository.countLotesVencidos(hoy);
        
        return EstadisticasLotesDTO.builder()
                .conLote(conLote)
                .porVencer(porVencer)
                .vencidos(vencidos)
                .build();
    }
    
    /**
     * Convierte una entidad Lote a DTO con estado calculado
     */
    private LoteConEstadoDTO convertirALoteConEstadoDTO(Lote lote, LocalDate hoy) {
        Producto producto = lote.getProducto();
        
        long diasRestantes = 0;
        String estado = "Vigente";
        
        // Si la cantidad es 0, el lote está vendido
        if (lote.getCantidad() == 0) {
            estado = "Vendido";
            if (lote.getFechaVencimiento() != null) {
                diasRestantes = ChronoUnit.DAYS.between(hoy, lote.getFechaVencimiento());
            }
        } else if (lote.getFechaVencimiento() != null) {
            diasRestantes = ChronoUnit.DAYS.between(hoy, lote.getFechaVencimiento());
            
            if (diasRestantes < 0) {
                estado = "Vencido";
            } else if (diasRestantes < 90) {
                estado = "Por Vencer";
            } else {
                estado = "Vigente";
            }
        }
        
        return LoteConEstadoDTO.builder()
                .id(lote.getId())
                .codigo(lote.getNumeroLote())
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoSku(producto.getSku())
                .categoriaId(producto.getCategoria() != null ? producto.getCategoria().getId() : null)
                .categoriaNombre(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null)
                .fechaVencimiento(lote.getFechaVencimiento())
                .stock(lote.getCantidad())
                .diasRestantes((int) diasRestantes)
                .estado(estado)
                .build();
    }

    @Transactional
    public Lote create(Lote lote, Integer usuarioId) {
        // Verify producto exists
        Producto producto = productoRepository.findById(lote.getProducto().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", lote.getProducto().getId()));
        
        lote.setProducto(producto);
        
        // Actualizar código de barras del producto con el nombre del lote
        producto.setCodigoBarras(lote.getNumeroLote());
        productoRepository.save(producto);
        
        // Save lote first to get the ID
        Lote loteGuardado = loteRepository.save(lote);
        
        // Crear movimiento de entrada con motivo "Compra"
        com.inventario.dto.MovimientoRequest movimientoRequest = new com.inventario.dto.MovimientoRequest();
        movimientoRequest.setProductoId(producto.getId());
        movimientoRequest.setTipo(com.inventario.enums.TipoMovimiento.ENTRADA);
        movimientoRequest.setCantidad(lote.getCantidad());
        movimientoRequest.setMotivo("Compra - Lote: " + lote.getNumeroLote());
        
        // Registrar el movimiento (esto ya aumenta el stock)
        movimientoService.create(movimientoRequest, usuarioId);
        
        return loteGuardado;
    }

    @Transactional
    public Lote update(Integer id, Lote loteData) {
        Lote lote = findById(id);
        lote.setNumeroLote(loteData.getNumeroLote());
        lote.setFechaVencimiento(loteData.getFechaVencimiento());
        return loteRepository.save(lote);
    }

    @Transactional
    public void delete(Integer id) {
        Lote lote = findById(id);
        
        // Restore stock to producto
        Producto producto = lote.getProducto();
        producto.setStock(producto.getStock() - lote.getCantidad());
        productoRepository.save(producto);
        
        loteRepository.delete(lote);
    }
    
    /**
     * Retira un lote por vencimiento, registrando un movimiento de merma
     * Solo retira los productos que quedan en el lote (cantidad actual)
     */
    @Transactional
    public void retirarPorVencimiento(Integer id, Integer usuarioId) {
        Lote lote = findById(id);
        Producto producto = lote.getProducto();
        
        // Verificar que haya productos para retirar
        if (lote.getCantidad() == 0) {
            throw new com.inventario.exception.BadRequestException("No hay productos para retirar en este lote (cantidad: 0)");
        }
        
        // Crear movimiento de MERMA con la cantidad actual del lote
        com.inventario.dto.MovimientoRequest movimientoRequest = new com.inventario.dto.MovimientoRequest();
        movimientoRequest.setProductoId(producto.getId());
        movimientoRequest.setTipo(com.inventario.enums.TipoMovimiento.MERMA);
        movimientoRequest.setCantidad(lote.getCantidad());
        movimientoRequest.setMotivo("Vencimiento - Lote: " + lote.getNumeroLote());
        
        // Registrar el movimiento (esto ya reduce el stock del producto)
        movimientoService.create(movimientoRequest, usuarioId);
        
        // Actualizar la cantidad del lote a 0 (no eliminarlo)
        lote.setCantidad(0);
        loteRepository.save(lote);
    }
}
