package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LichSuTrangThaiPhongTest {

    @Test
    void builder() {
        LichSuTrangThaiPhong e = LichSuTrangThaiPhong.builder()
                .phong(new Phong())
                .trangThaiCu("PHONG_TRONG")
                .trangThaiMoi("DANG_SU_DUNG")
                .build();
        assertThat(e.getTrangThaiMoi()).isEqualTo("DANG_SU_DUNG");
    }
}
