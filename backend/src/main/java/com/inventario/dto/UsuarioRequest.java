package com.inventario.dto;

import com.inventario.enums.Rol;
import lombok.Data;

@Data
public class UsuarioRequest {

    private String nombre;
    private String correo;
    private String password;  // obligatorio en create, opcional en update
    private Rol rol;
}
