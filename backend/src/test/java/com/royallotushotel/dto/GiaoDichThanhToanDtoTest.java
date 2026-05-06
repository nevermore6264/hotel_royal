package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class GiaoDichThanhToanDtoTest {

    @Test
    void gettersVaSetters() {
        LocalDateTime ts = LocalDateTime.of(2026, 5, 6, 14, 30);
        GiaoDichThanhToanDto dto = new GiaoDichThanhToanDto();
        dto.setId(1L);
        dto.setMaGiaoDich("GD001");
        dto.setLoaiGiaoDich("THU");
        dto.setSoTien(BigDecimal.valueOf(500000));
        dto.setTrangThai("THANH_CONG");
        dto.setPhuongThuc("PAYOS");
        dto.setCongThanhToan("payos");
        dto.setThamChieuCong("ref-1");
        dto.setThoiDiemGiaoDich(ts);
        dto.setGhiChu("OK");

        assertThat(dto.getMaGiaoDich()).isEqualTo("GD001");
        assertThat(dto.getSoTien()).isEqualByComparingTo("500000");
        assertThat(dto.getThoiDiemGiaoDich()).isEqualTo(ts);
    }
}
