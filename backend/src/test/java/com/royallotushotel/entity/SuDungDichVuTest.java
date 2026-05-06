package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SuDungDichVuTest {

    @Test
    void builder() {
        SuDungDichVu e = SuDungDichVu.builder()
                .datPhong(new DatPhong())
                .dichVu(new DichVu())
                .soLuong(2)
                .build();
        assertThat(e.getSoLuong()).isEqualTo(2);
    }
}
