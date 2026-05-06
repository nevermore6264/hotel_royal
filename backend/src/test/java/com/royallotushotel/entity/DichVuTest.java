package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DichVuTest {

    @Test
    void builder() {
        DichVu e = DichVu.builder()
                .ten("Giat ui")
                .gia(BigDecimal.valueOf(50000))
                .moTa("24h")
                .build();
        assertThat(e.getTen()).isEqualTo("Giat ui");
        assertThat(e.getGia()).isEqualByComparingTo(BigDecimal.valueOf(50000));
    }
}
