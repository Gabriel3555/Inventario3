package com.inventario.service;

import com.inventario.entity.Cliente;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findAllByOrderByIdDesc();
    }

    public Cliente findById(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
    }

    public List<Cliente> findByNombreContaining(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Cliente create(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente update(Integer id, Cliente clienteData) {
        Cliente cliente = findById(id);
        cliente.setNombre(clienteData.getNombre());
        cliente.setDocumento(clienteData.getDocumento());
        cliente.setTelefono(clienteData.getTelefono());
        cliente.setCorreo(clienteData.getCorreo());
        cliente.setDireccion(clienteData.getDireccion());
        cliente.setLimiteCredito(clienteData.getLimiteCredito());
        return clienteRepository.save(cliente);
    }

    public void delete(Integer id) {
        Cliente cliente = findById(id);
        clienteRepository.delete(cliente);
    }
}
