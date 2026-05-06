package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class LoaiPhongTest {

    @Test
    void builder() {
        LoaiPhong e = LoaiPhong.builder()
                .ten("Deluxe")
                .gia(BigDecimal.valueOf(900000))
                .sucChuaToiDa(2)
                .build();
        assertThat(e.getTen()).isEqualTo("Deluxe");
        assertThat(e.getGia()).isEqualByComparingTo(BigDecimal.valueOf(900000));
    }
}
