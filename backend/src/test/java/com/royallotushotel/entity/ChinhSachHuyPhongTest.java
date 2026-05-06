package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ChinhSachHuyPhongTest {

    @Test
    void builderVaMacDinh() {
        ChinhSachHuyPhong e = ChinhSachHuyPhong.builder()
                .soGioTruocNhanPhong(24)
                .tyLeHoanTien(BigDecimal.valueOf(0.5))
                .build();
        assertThat(e.getConHieuLuc()).isTrue();
        assertThat(e.getTyLeHoanTien()).isEqualByComparingTo(BigDecimal.valueOf(0.5));
    }
}
