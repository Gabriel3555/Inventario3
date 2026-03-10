package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.dto.EstadisticasLotesDTO;
import com.inventario.dto.LotePaginadoDTO;
import com.inventario.entity.Lote;
import com.inventario.repository.UsuarioRepository;
import com.inventario.service.LoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LoteController {

    private final LoteService loteService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Lote>> findAll() {
        return ResponseEntity.ok(loteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lote> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(loteService.findById(id));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Lote>> findByProductoId(@PathVariable Integer productoId) {
        return ResponseEntity.ok(loteService.findByProductoId(productoId));
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<Lote>> findLotesVencidos() {
        return ResponseEntity.ok(loteService.findLotesVencidos());
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<List<Lote>> findLotesProximosAVencer(@RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(loteService.findLotesProximosAVencer(dias));
    }
    
    @GetMapping("/paginado")
    public ResponseEntity<LotePaginadoDTO> getLotesPaginados(
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "6") int porPagina) {
        return ResponseEntity.ok(loteService.getLotesPaginados(pagina, porPagina));
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasLotesDTO> getEstadisticas() {
        return ResponseEntity.ok(loteService.getEstadisticas());
    }

    @PostMapping
    public ResponseEntity<Lote> create(
            @RequestBody Lote lote,
            Authentication authentication) {
        String correo = authentication.getName();
        Integer usuarioId = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        
        return new ResponseEntity<>(loteService.create(lote, usuarioId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lote> update(@PathVariable Integer id, @RequestBody Lote lote) {
        return ResponseEntity.ok(loteService.update(id, lote));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        loteService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Lote eliminado correctamente"));
    }
    
    @PostMapping("/{id}/retirar")
    public ResponseEntity<ApiResponse> retirarPorVencimiento(
            @PathVariable Integer id,
            Authentication authentication) {
        String correo = authentication.getName();
        Integer usuarioId = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        
        loteService.retirarPorVencimiento(id, usuarioId);
        return ResponseEntity.ok(ApiResponse.ok("Lote retirado por vencimiento y registrado en movimientos"));
    }
}
