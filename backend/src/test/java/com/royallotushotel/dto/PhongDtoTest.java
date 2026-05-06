package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PhongDtoTest {

    @Test
    void gettersVaSetters() {
        PhongDto dto = new PhongDto();
        dto.setId(1L);
        dto.setSoPhong("201");
        dto.setTrangThai("PHONG_TRONG");
        dto.setTrangThaiVeSinh("SACH");
        dto.setIdDatPhong(10L);
        dto.setIdLoaiPhong(2L);
        dto.setTenLoaiPhong("Deluxe");
        dto.setGiaLoaiPhong(BigDecimal.valueOf(1000000));
        dto.setGiaChoKyLuuTru(BigDecimal.valueOf(2000000));
        dto.setDuongDanAnh(List.of("/a.jpg", "/b.jpg"));
        dto.setGhiChuVeSinh("Da don");

        assertThat(dto.getSoPhong()).isEqualTo("201");
        assertThat(dto.getDuongDanAnh()).containsExactly("/a.jpg", "/b.jpg");
        assertThat(dto.getGiaChoKyLuuTru()).isEqualByComparingTo("2000000");
    }
}
