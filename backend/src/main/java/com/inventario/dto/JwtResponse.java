package com.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String tipo = "Bearer";
    private Integer id;
    private String nombre;
    private String correo;
    private String rol;

    public JwtResponse(String token, Integer id, String nombre, String correo, String rol) {
        this.token = token;
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }
}
