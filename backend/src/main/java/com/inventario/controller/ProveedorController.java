package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.entity.Proveedor;
import com.inventario.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    public ResponseEntity<List<Proveedor>> findAll() {
        return ResponseEntity.ok(proveedorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(proveedorService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Proveedor> create(@RequestBody Proveedor proveedor) {
        return new ResponseEntity<>(proveedorService.create(proveedor), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> update(@PathVariable Integer id, @RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(proveedorService.update(id, proveedor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        proveedorService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Proveedor eliminado correctamente"));
    }
}
