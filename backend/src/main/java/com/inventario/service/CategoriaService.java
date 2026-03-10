package com.inventario.service;

import com.inventario.entity.Categoria;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<Categoria> findAll() {
        return categoriaRepository.findAllByOrderByIdDesc();
    }

    public Categoria findById(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    public Categoria create(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria update(Integer id, Categoria categoriaData) {
        Categoria categoria = findById(id);
        categoria.setNombre(categoriaData.getNombre());
        categoria.setDescripcion(categoriaData.getDescripcion());
        return categoriaRepository.save(categoria);
    }

    public void delete(Integer id) {
        Categoria categoria = findById(id);
        categoriaRepository.delete(categoria);
    }
}
