package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ChiTietDatPhongTest {

    @Test
    void builder() {
        ChiTietDatPhong e = ChiTietDatPhong.builder()
                .datPhong(new DatPhong())
                .phong(new Phong())
                .trangThai("DANG_GIU")
                .giaGocMoiDem(BigDecimal.valueOf(800000))
                .soDem(2)
                .gia(BigDecimal.valueOf(1600000))
                .build();
        assertThat(e.getSoDem()).isEqualTo(2);
        assertThat(e.getGia()).isEqualByComparingTo(BigDecimal.valueOf(1600000));
    }
}
