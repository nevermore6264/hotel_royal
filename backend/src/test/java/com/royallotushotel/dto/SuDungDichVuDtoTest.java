package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class SuDungDichVuDtoTest {

    @Test
    void gettersVaSetters() {
        SuDungDichVuDto dto = new SuDungDichVuDto();
        dto.setId(1L);
        dto.setIdDichVu(5L);
        dto.setTenDichVu("Giat");
        dto.setSoLuong(2);
        dto.setDonGia(BigDecimal.valueOf(30000));
        dto.setThanhTien(BigDecimal.valueOf(60000));

        assertThat(dto.getSoLuong()).isEqualTo(2);
        assertThat(dto.getThanhTien()).isEqualByComparingTo("60000");
    }
}
