package com.inventario.service;

import com.inventario.entity.Impuesto;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.ImpuestoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImpuestoService {

    private final ImpuestoRepository impuestoRepository;

    public List<Impuesto> findAll() {
        return impuestoRepository.findAll();
    }

    public Impuesto findById(Integer id) {
        return impuestoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impuesto", id));
    }

    public Impuesto create(Impuesto impuesto) {
        return impuestoRepository.save(impuesto);
    }

    public Impuesto update(Integer id, Impuesto impuestoData) {
        Impuesto impuesto = findById(id);
        impuesto.setNombre(impuestoData.getNombre());
        impuesto.setPorcentaje(impuestoData.getPorcentaje());
        return impuestoRepository.save(impuesto);
    }

    public void delete(Integer id) {
        Impuesto impuesto = findById(id);
        impuestoRepository.delete(impuesto);
    }
}
