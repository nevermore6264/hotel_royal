package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DanhGiaDtoTest {

    @Test
    void builderVaGetters() {
        LocalDateTime ts = LocalDateTime.of(2026, 5, 6, 8, 0);
        DanhGiaDto dto = DanhGiaDto.builder()
                .id(1L)
                .idLoaiPhong(10L)
                .diem(5)
                .noiDung("Tot")
                .thoiDiem(ts)
                .tenHienThi("User")
                .build();

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getIdLoaiPhong()).isEqualTo(10L);
        assertThat(dto.getDiem()).isEqualTo(5);
        assertThat(dto.getNoiDung()).isEqualTo("Tot");
        assertThat(dto.getThoiDiem()).isEqualTo(ts);
        assertThat(dto.getTenHienThi()).isEqualTo("User");
    }
}
