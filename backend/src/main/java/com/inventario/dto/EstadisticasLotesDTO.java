package com.inventario.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EstadisticasLotesDTO {
    private Long conLote;
    private Long porVencer;
    private Long vencidos;
}
