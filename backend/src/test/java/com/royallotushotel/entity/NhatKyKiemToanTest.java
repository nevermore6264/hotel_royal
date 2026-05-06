package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NhatKyKiemToanTest {

    @Test
    void builder() {
        NhatKyKiemToan e = NhatKyKiemToan.builder()
                .hanhDong("UPDATE")
                .tenThucThe("Phong")
                .idThucThe(5L)
                .build();
        assertThat(e.getTenThucThe()).isEqualTo("Phong");
        assertThat(e.getIdThucThe()).isEqualTo(5L);
    }
}
