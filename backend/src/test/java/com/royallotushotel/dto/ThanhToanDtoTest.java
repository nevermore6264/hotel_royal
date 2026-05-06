package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ThanhToanDtoTest {

    @Test
    void gettersVaSetters() {
        GiaoDichThanhToanDto gd = new GiaoDichThanhToanDto();
        gd.setId(1L);
        gd.setMaGiaoDich("X1");

        ThanhToanDto dto = new ThanhToanDto();
        dto.setId(10L);
        dto.setTongPhaiThu(BigDecimal.valueOf(1000000));
        dto.setTongDaThu(BigDecimal.valueOf(500000));
        dto.setTongHoan(BigDecimal.ZERO);
        dto.setConPhaiThu(BigDecimal.valueOf(500000));
        dto.setPhuongThuc("PAYOS");
        dto.setTrangThai("CHO_THANH_TOAN");
        dto.setThoiDiemThanhToan(LocalDateTime.of(2026, 5, 6, 11, 0));
        dto.setLanCapNhatCuoi(LocalDateTime.of(2026, 5, 6, 11, 5));
        dto.setGiaoDich(List.of(gd));

        assertThat(dto.getTongPhaiThu()).isEqualByComparingTo("1000000");
        assertThat(dto.getGiaoDich()).hasSize(1);
        assertThat(dto.getGiaoDich().get(0).getMaGiaoDich()).isEqualTo("X1");
    }
}
