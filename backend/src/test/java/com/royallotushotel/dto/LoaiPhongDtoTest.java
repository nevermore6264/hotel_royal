package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class LoaiPhongDtoTest {

    @Test
    void gettersVaSetters() {
        LoaiPhongDto dto = new LoaiPhongDto();
        dto.setId(1L);
        dto.setTen("Suite");
        dto.setGia(BigDecimal.valueOf(2000000));
        dto.setMoTa("Rong rai");
        dto.setSucChuaToiDa(4);

        assertThat(dto.getTen()).isEqualTo("Suite");
        assertThat(dto.getGia()).isEqualByComparingTo("2000000");
        assertThat(dto.getSucChuaToiDa()).isEqualTo(4);
    }
}
