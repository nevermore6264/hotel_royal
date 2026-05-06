package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class BangGiaPhongTest {

    @Test
    void builderVaMacDinh() {
        LoaiPhong loai = new LoaiPhong();
        BangGiaPhong e = BangGiaPhong.builder()
                .loaiPhong(loai)
                .tenChinhSach("Tet")
                .ngayBatDau(LocalDate.of(2026, 1, 1))
                .ngayKetThuc(LocalDate.of(2026, 1, 31))
                .giaApDung(BigDecimal.valueOf(500000))
                .build();
        assertThat(e.getKichHoat()).isTrue();
        assertThat(e.getGiaApDung()).isEqualByComparingTo(BigDecimal.valueOf(500000));
    }
}
