package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.entity.Producto;
import com.inventario.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> findAll() {
        return ResponseEntity.ok(productoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.findById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<Producto> findBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productoService.findBySku(sku));
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Producto>> findByCategoriaId(@PathVariable Integer categoriaId) {
        return ResponseEntity.ok(productoService.findByCategoriaId(categoriaId));
    }

    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<List<Producto>> findByProveedorId(@PathVariable Integer proveedorId) {
        return ResponseEntity.ok(productoService.findByProveedorId(proveedorId));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Producto>> findProductosConStockBajo() {
        return ResponseEntity.ok(productoService.findProductosConStockBajo());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> findByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.findByNombreContaining(nombre));
    }

    @PostMapping
    public ResponseEntity<Producto> create(@RequestBody Producto producto) {
        System.out.println("Creando producto: " + producto.getNombre());
        System.out.println("SKU: " + producto.getSku());
        System.out.println("Precio Compra: " + producto.getPrecioCompra());
        System.out.println("Precio Venta: " + producto.getPrecioVenta());
        return new ResponseEntity<>(productoService.create(producto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@PathVariable Integer id, @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.update(id, producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        productoService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto eliminado correctamente"));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse> actualizarStock(@PathVariable Integer id, @RequestParam Integer cantidad) {
        productoService.actualizarStock(id, cantidad);
        return ResponseEntity.ok(ApiResponse.ok("Stock actualizado correctamente"));
    }
}
