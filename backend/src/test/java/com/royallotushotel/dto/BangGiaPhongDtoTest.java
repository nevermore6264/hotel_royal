package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class BangGiaPhongDtoTest {

    @Test
    void gettersVaSetters() {
        BangGiaPhongDto dto = new BangGiaPhongDto();
        dto.setId(1L);
        dto.setIdLoaiPhong(2L);
        dto.setTenLoaiPhong("Deluxe");
        dto.setTenChinhSach("Le");
        dto.setNgayBatDau(LocalDate.of(2026, 5, 1));
        dto.setNgayKetThuc(LocalDate.of(2026, 5, 31));
        dto.setGiaApDung(BigDecimal.valueOf(900000));
        dto.setKichHoat(true);
        dto.setMoTa("Ghi chu");

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getIdLoaiPhong()).isEqualTo(2L);
        assertThat(dto.getTenLoaiPhong()).isEqualTo("Deluxe");
        assertThat(dto.getTenChinhSach()).isEqualTo("Le");
        assertThat(dto.getNgayBatDau()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(dto.getNgayKetThuc()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(dto.getGiaApDung()).isEqualByComparingTo("900000");
        assertThat(dto.getKichHoat()).isTrue();
        assertThat(dto.getMoTa()).isEqualTo("Ghi chu");
    }
}
