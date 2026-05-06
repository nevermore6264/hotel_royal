package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ChiTietDatPhongDtoTest {

    @Test
    void gettersVaSetters() {
        ChiTietDatPhongDto dto = new ChiTietDatPhongDto();
        dto.setId(1L);
        dto.setIdPhong(10L);
        dto.setSoPhong("101");
        dto.setTrangThai("CHO_NHAN");
        dto.setGiaGocMoiDem(BigDecimal.valueOf(500000));
        dto.setSoDem(2);
        dto.setGia(BigDecimal.valueOf(1000000));
        dto.setSoTienHoan(BigDecimal.ZERO);
        dto.setThoiDiemHuy(LocalDateTime.of(2026, 5, 6, 10, 0));
        dto.setLyDoHuy("Test");
        dto.setSoGioHuyApDung(24);
        dto.setTyLeHoanTienApDung(BigDecimal.valueOf(50));

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getIdPhong()).isEqualTo(10L);
        assertThat(dto.getSoPhong()).isEqualTo("101");
        assertThat(dto.getTrangThai()).isEqualTo("CHO_NHAN");
        assertThat(dto.getGiaGocMoiDem()).isEqualByComparingTo("500000");
        assertThat(dto.getSoDem()).isEqualTo(2);
        assertThat(dto.getGia()).isEqualByComparingTo("1000000");
        assertThat(dto.getLyDoHuy()).isEqualTo("Test");
    }
}
