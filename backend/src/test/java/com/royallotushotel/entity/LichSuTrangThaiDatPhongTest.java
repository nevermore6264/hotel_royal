package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LichSuTrangThaiDatPhongTest {

    @Test
    void builder() {
        LichSuTrangThaiDatPhong e = LichSuTrangThaiDatPhong.builder()
                .datPhong(new DatPhong())
                .trangThaiCu("CHO_DUYET")
                .trangThaiMoi("DA_XAC_NHAN")
                .build();
        assertThat(e.getTrangThaiMoi()).isEqualTo("DA_XAC_NHAN");
    }
}
