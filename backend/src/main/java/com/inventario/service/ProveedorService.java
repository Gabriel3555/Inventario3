package com.inventario.service;

import com.inventario.entity.Proveedor;
import com.inventario.exception.BadRequestException;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.ProductoRepository;
import com.inventario.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;

    public List<Proveedor> findAll() {
        return proveedorRepository.findAllByOrderByIdDesc();
    }

    public Proveedor findById(Integer id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
    }

    public Proveedor create(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public Proveedor update(Integer id, Proveedor proveedorData) {
        Proveedor proveedor = findById(id);
        proveedor.setNombre(proveedorData.getNombre());
        proveedor.setNit(proveedorData.getNit());
        proveedor.setTelefono(proveedorData.getTelefono());
        proveedor.setCorreo(proveedorData.getCorreo());
        proveedor.setDireccion(proveedorData.getDireccion());
        proveedor.setNombreContacto(proveedorData.getNombreContacto());
        proveedor.setTiempoEntrega(proveedorData.getTiempoEntrega());
        return proveedorRepository.save(proveedor);
    }

    public void delete(Integer id) {
        Proveedor proveedor = findById(id);
        if (!productoRepository.findByProveedorId(id).isEmpty()) {
            throw new BadRequestException("No se puede eliminar el proveedor porque tiene productos asociados");
        }
        proveedorRepository.delete(proveedor);
    }
}
