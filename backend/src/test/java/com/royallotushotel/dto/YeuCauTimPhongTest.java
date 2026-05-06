package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauTimPhongTest {

    @Test
    void gettersVaSetters() {
        YeuCauTimPhong dto = new YeuCauTimPhong();
        dto.setNgayNhanPhong(LocalDate.of(2026, 6, 1));
        dto.setNgayTraPhong(LocalDate.of(2026, 6, 5));
        dto.setIdLoaiPhong(3L);

        assertThat(dto.getNgayNhanPhong()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(dto.getNgayTraPhong()).isEqualTo(LocalDate.of(2026, 6, 5));
        assertThat(dto.getIdLoaiPhong()).isEqualTo(3L);
    }
}
