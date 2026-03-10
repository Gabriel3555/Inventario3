package com.inventario.service;

import com.inventario.entity.Impuesto;
import com.inventario.entity.Producto;
import com.inventario.exception.BadRequestException;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.ProductoRepository;
import com.inventario.repository.DetalleVentaRepository;
import com.inventario.repository.MovimientoRepository;
import com.inventario.repository.LoteRepository;
import com.inventario.repository.ImpuestoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final MovimientoRepository movimientoRepository;
    private final LoteRepository loteRepository;
    private final ImpuestoRepository impuestoRepository;

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Producto findById(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    public Producto findBySku(String sku) {
        return productoRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto con SKU: " + sku, 0));
    }

    public List<Producto> findByCategoriaId(Integer categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId);
    }

    public List<Producto> findByProveedorId(Integer proveedorId) {
        return productoRepository.findByProveedorId(proveedorId);
    }

    public List<Producto> findProductosConStockBajo() {
        return productoRepository.findProductosConStockBajo();
    }

    public List<Producto> findByNombreContaining(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Transactional
    public Producto create(Producto producto) {
        if (productoRepository.existsBySku(producto.getSku())) {
            throw new BadRequestException("Ya existe un producto con el SKU: " + producto.getSku());
        }
        
        // Si tiene impuesto, buscar o crear el impuesto
        if (producto.getImpuesto() != null && producto.getImpuesto().getPorcentaje() != null) {
            BigDecimal porcentaje = producto.getImpuesto().getPorcentaje();
            Impuesto impuesto = impuestoRepository.findByPorcentaje(porcentaje)
                .orElseGet(() -> {
                    Impuesto nuevoImpuesto = new Impuesto();
                    nuevoImpuesto.setNombre("IVA " + porcentaje + "%");
                    nuevoImpuesto.setPorcentaje(porcentaje);
                    return impuestoRepository.save(nuevoImpuesto);
                });
            producto.setImpuesto(impuesto);
        }
        
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto update(Integer id, Producto productoData) {
        Producto producto = findById(id);
        producto.setNombre(productoData.getNombre());
        producto.setDescripcion(productoData.getDescripcion());
        producto.setSku(productoData.getSku());
        producto.setCodigoBarras(productoData.getCodigoBarras());
        producto.setCategoria(productoData.getCategoria());
        producto.setPrecioCompra(productoData.getPrecioCompra());
        producto.setPrecioVenta(productoData.getPrecioVenta());
        producto.setStockMinimo(productoData.getStockMinimo());
        producto.setUbicacion(productoData.getUbicacion());
        
        // Si tiene impuesto, buscar o crear el impuesto
        if (productoData.getImpuesto() != null && productoData.getImpuesto().getPorcentaje() != null) {
            BigDecimal porcentaje = productoData.getImpuesto().getPorcentaje();
            Impuesto impuesto = impuestoRepository.findByPorcentaje(porcentaje)
                .orElseGet(() -> {
                    Impuesto nuevoImpuesto = new Impuesto();
                    nuevoImpuesto.setNombre("IVA " + porcentaje + "%");
                    nuevoImpuesto.setPorcentaje(porcentaje);
                    return impuestoRepository.save(nuevoImpuesto);
                });
            producto.setImpuesto(impuesto);
        } else {
            producto.setImpuesto(null);
        }
        
        producto.setProveedor(productoData.getProveedor());
        return productoRepository.save(producto);
    }

    @Transactional
    public void delete(Integer id) {
        Producto producto = findById(id);
        
        // Verificar si el producto tiene referencias en otras tablas
        if (!detalleVentaRepository.findByProductoId(id).isEmpty()) {
            throw new BadRequestException("No se puede eliminar el producto porque tiene ventas asociadas");
        }
        
        if (!movimientoRepository.findByProductoId(id).isEmpty()) {
            throw new BadRequestException("No se puede eliminar el producto porque tiene movimientos registrados");
        }
        
        if (!loteRepository.findByProductoId(id).isEmpty()) {
            throw new BadRequestException("No se puede eliminar el producto porque tiene lotes asociados");
        }
        
        productoRepository.delete(producto);
    }

    @Transactional
    public void actualizarStock(Integer productoId, Integer cantidad) {
        Producto producto = findById(productoId);
        int nuevoStock = producto.getStock() + cantidad;
        if (nuevoStock < 0) {
            throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre());
        }
        producto.setStock(nuevoStock);
        productoRepository.save(producto);
    }
}
