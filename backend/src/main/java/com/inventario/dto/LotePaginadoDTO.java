package com.inventario.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LotePaginadoDTO {
    private List<LoteConEstadoDTO> lotes;
    private Long total;
    private Integer pagina;
    private Integer porPagina;
    private Long conLote;
    private Long porVencer;
    private Long vencidos;
}
