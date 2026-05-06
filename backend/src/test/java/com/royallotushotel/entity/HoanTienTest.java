package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class HoanTienTest {

    @Test
    void builder() {
        HoanTien e = HoanTien.builder()
                .datPhong(new DatPhong())
                .soTienHoan(BigDecimal.valueOf(200000))
                .lyDo("Huy som")
                .build();
        assertThat(e.getSoTienHoan()).isEqualByComparingTo(BigDecimal.valueOf(200000));
        assertThat(e.getLyDo()).isEqualTo("Huy som");
    }
}
