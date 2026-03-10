package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.entity.Impuesto;
import com.inventario.service.ImpuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/impuestos")
@RequiredArgsConstructor
public class ImpuestoController {

    private final ImpuestoService impuestoService;

    @GetMapping
    public ResponseEntity<List<Impuesto>> findAll() {
        return ResponseEntity.ok(impuestoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Impuesto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(impuestoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Impuesto> create(@RequestBody Impuesto impuesto) {
        return new ResponseEntity<>(impuestoService.create(impuesto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Impuesto> update(@PathVariable Integer id, @RequestBody Impuesto impuesto) {
        return ResponseEntity.ok(impuestoService.update(id, impuesto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        impuestoService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Impuesto eliminado correctamente"));
    }
}
