package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class NhatKyHeThongDtoTest {

    @Test
    void builderVaGetters() {
        LocalDateTime ts = LocalDateTime.of(2026, 5, 6, 9, 0);
        NhatKyHeThongDto dto = NhatKyHeThongDto.builder()
                .id(1L)
                .thoiDiem(ts)
                .hanhDong("DANG_NHAP")
                .chiTiet("OK")
                .tenDangNhapNguoiThucHien("admin")
                .build();

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getThoiDiem()).isEqualTo(ts);
        assertThat(dto.getHanhDong()).isEqualTo("DANG_NHAP");
        assertThat(dto.getTenDangNhapNguoiThucHien()).isEqualTo("admin");
    }
}
