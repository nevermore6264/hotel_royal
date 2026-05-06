package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DichVuDtoTest {

    @Test
    void gettersVaSetters() {
        DichVuDto dto = new DichVuDto();
        dto.setId(1L);
        dto.setTen("An sang");
        dto.setGia(BigDecimal.valueOf(50000));
        dto.setMoTa("Buffet");

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getTen()).isEqualTo("An sang");
        assertThat(dto.getGia()).isEqualByComparingTo("50000");
        assertThat(dto.getMoTa()).isEqualTo("Buffet");
    }
}
