package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DanhGiaTest {

    @Test
    void builder() {
        LocalDateTime t = LocalDateTime.of(2026, 5, 1, 12, 0);
        DanhGia e = DanhGia.builder()
                .loaiPhong(new LoaiPhong())
                .nguoiDung(new NguoiDung())
                .diem(5)
                .noiDung("Tot")
                .thoiDiem(t)
                .build();
        assertThat(e.getDiem()).isEqualTo(5);
        assertThat(e.getThoiDiem()).isEqualTo(t);
    }
}
