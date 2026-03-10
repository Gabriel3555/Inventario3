package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.dto.MovimientoRequest;
import com.inventario.entity.Movimiento;
import com.inventario.enums.TipoMovimiento;
import com.inventario.repository.UsuarioRepository;
import com.inventario.service.MovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Movimiento>> findAll() {
        return ResponseEntity.ok(movimientoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movimiento> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(movimientoService.findById(id));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Movimiento>> findByProductoId(@PathVariable Integer productoId) {
        return ResponseEntity.ok(movimientoService.findByProductoId(productoId));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Movimiento>> findByTipo(@PathVariable TipoMovimiento tipo) {
        return ResponseEntity.ok(movimientoService.findByTipo(tipo));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Movimiento>> findByUsuarioId(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(movimientoService.findByUsuarioId(usuarioId));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<Movimiento>> findByFechaBetween(
            @RequestParam LocalDateTime inicio,
            @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(movimientoService.findByFechaBetween(inicio, fin));
    }

    @PostMapping
    public ResponseEntity<Movimiento> create(
            @RequestBody MovimientoRequest request,
            Authentication authentication) {
        String correo = authentication.getName();
        Integer usuarioId = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        
        return new ResponseEntity<>(movimientoService.create(request, usuarioId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        movimientoService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Movimiento eliminado correctamente"));
    }
}
