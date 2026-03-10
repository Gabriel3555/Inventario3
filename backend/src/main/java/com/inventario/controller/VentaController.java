package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.dto.VentaRequest;
import com.inventario.entity.Venta;
import com.inventario.repository.UsuarioRepository;
import com.inventario.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Venta>> findAll() {
        return ResponseEntity.ok(ventaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Venta>> findByClienteId(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(ventaService.findByClienteId(clienteId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Venta>> findByUsuarioId(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ventaService.findByUsuarioId(usuarioId));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<Venta>> findByFechaBetween(
            @RequestParam java.time.LocalDateTime inicio,
            @RequestParam java.time.LocalDateTime fin) {
        return ResponseEntity.ok(ventaService.findByFechaBetween(inicio, fin));
    }

    @PostMapping
    public ResponseEntity<Venta> create(
            @Valid @RequestBody VentaRequest request,
            Authentication authentication) {
        String correo = authentication.getName();
        Integer usuarioId = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        
        return new ResponseEntity<>(ventaService.create(request, usuarioId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        ventaService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Venta eliminada correctamente"));
    }
}
