package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CuocTroChuyenTomTatDtoTest {

    @Test
    void builderVaGetters() {
        LocalDateTime ts = LocalDateTime.of(2026, 5, 6, 12, 0);
        CuocTroChuyenTomTatDto dto = CuocTroChuyenTomTatDto.builder()
                .id(1L)
                .idNguoiDungKhach(2L)
                .tenDangNhapKhach("khach1")
                .hoTenKhach("Nguyen A")
                .idNguoiHoTro(3L)
                .tenNguoiHoTro("Le tan")
                .thoiDiemCapNhat(ts)
                .build();

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getIdNguoiDungKhach()).isEqualTo(2L);
        assertThat(dto.getTenDangNhapKhach()).isEqualTo("khach1");
        assertThat(dto.getHoTenKhach()).isEqualTo("Nguyen A");
        assertThat(dto.getIdNguoiHoTro()).isEqualTo(3L);
        assertThat(dto.getTenNguoiHoTro()).isEqualTo("Le tan");
        assertThat(dto.getThoiDiemCapNhat()).isEqualTo(ts);
    }
}
