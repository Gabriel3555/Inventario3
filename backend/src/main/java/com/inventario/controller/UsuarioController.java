package com.inventario.controller;

import com.inventario.dto.ApiResponse;
import com.inventario.dto.UsuarioRequest;
import com.inventario.entity.Usuario;
import com.inventario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Usuario>> findAll() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Usuario> create(@RequestBody UsuarioRequest req) {
        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre());
        usuario.setCorreo(req.getCorreo());
        usuario.setPassword(req.getPassword());
        usuario.setRol(req.getRol());
        return new ResponseEntity<>(usuarioService.create(usuario), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Integer id, @RequestBody UsuarioRequest req) {
        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre());
        usuario.setCorreo(req.getCorreo());
        usuario.setRol(req.getRol());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            usuario.setPassword(req.getPassword());
        }
        return ResponseEntity.ok(usuarioService.update(id, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        usuarioService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario eliminado correctamente"));
    }
}
