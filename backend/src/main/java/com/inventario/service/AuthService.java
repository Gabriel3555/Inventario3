package com.inventario.service;

import com.inventario.dto.JwtResponse;
import com.inventario.dto.LoginRequest;
import com.inventario.dto.RegisterRequest;
import com.inventario.entity.Usuario;
import com.inventario.exception.BadRequestException;
import com.inventario.repository.UsuarioRepository;
import com.inventario.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));

        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol().name());

        return new JwtResponse(token, usuario.getId(), usuario.getNombre(),
                usuario.getCorreo(), usuario.getRol().name());
    }

    public JwtResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new BadRequestException("El correo ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .correo(request.getCorreo())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .build();

        usuario = usuarioRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol().name());

        return new JwtResponse(token, usuario.getId(), usuario.getNombre(),
                usuario.getCorreo(), usuario.getRol().name());
    }
}
