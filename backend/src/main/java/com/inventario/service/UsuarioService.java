package com.inventario.service;

import com.inventario.entity.Usuario;
import com.inventario.exception.BadRequestException;
import com.inventario.exception.ResourceNotFoundException;
import com.inventario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAllByOrderByIdDesc();
    }

    public Usuario findById(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    public Usuario create(Usuario usuario) {
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new BadRequestException("El correo ya está registrado");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Integer id, Usuario usuarioData) {
        Usuario usuario = findById(id);
        usuario.setNombre(usuarioData.getNombre());
        if (!usuario.getCorreo().equalsIgnoreCase(usuarioData.getCorreo())
                && usuarioRepository.existsByCorreo(usuarioData.getCorreo())) {
            throw new BadRequestException("El correo ya está registrado");
        }
        usuario.setCorreo(usuarioData.getCorreo());
        usuario.setRol(usuarioData.getRol());
        if (usuarioData.getPassword() != null && !usuarioData.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(usuarioData.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    public void delete(Integer id) {
        Usuario usuario = findById(id);
        usuarioRepository.delete(usuario);
    }
}
