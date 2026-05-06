package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiDatPhong;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class DatPhongTest {

    @Test
    void builder() {
        DatPhong e = DatPhong.builder()
                .khachHang(new KhachHang())
                .ngayNhanPhong(LocalDate.of(2026, 6, 1))
                .ngayTraPhong(LocalDate.of(2026, 6, 3))
                .trangThai(MaTrangThaiDatPhong.CHO_DUYET)
                .build();
        assertThat(e.getNgayNhanPhong()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(e.getTrangThai()).isEqualTo(MaTrangThaiDatPhong.CHO_DUYET);
    }
}
