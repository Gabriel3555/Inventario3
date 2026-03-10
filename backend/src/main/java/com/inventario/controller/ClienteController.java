package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.entity.Cliente;
import com.inventario.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<Cliente>> findAll() {
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.findById(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Cliente>> findByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(clienteService.findByNombreContaining(nombre));
    }

    @PostMapping
    public ResponseEntity<Cliente> create(@RequestBody Cliente cliente) {
        return new ResponseEntity<>(clienteService.create(cliente), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> update(@PathVariable Integer id, @RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.update(id, cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        clienteService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Cliente eliminado correctamente"));
    }
}
