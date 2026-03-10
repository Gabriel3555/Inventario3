package com.inventario.controller;

import com.inventario.dto.EstadisticasDTO;
import com.inventario.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estadisticas")
@RequiredArgsConstructor
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    @GetMapping
    public ResponseEntity<EstadisticasDTO> getEstadisticas() {
        return ResponseEntity.ok(estadisticasService.getEstadisticasGenerales());
    }
}
