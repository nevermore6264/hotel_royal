package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ChinhSachHuyPhongDtoTest {

    @Test
    void gettersVaSetters() {
        ChinhSachHuyPhongDto dto = new ChinhSachHuyPhongDto();
        dto.setId(1L);
        dto.setSoGioTruocNhanPhong(24);
        dto.setTyLeHoanTien(BigDecimal.valueOf(80));
        dto.setMoTa("Chinh sach");
        dto.setConHieuLuc(true);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getSoGioTruocNhanPhong()).isEqualTo(24);
        assertThat(dto.getTyLeHoanTien()).isEqualByComparingTo("80");
        assertThat(dto.getMoTa()).isEqualTo("Chinh sach");
        assertThat(dto.getConHieuLuc()).isTrue();
    }
}
