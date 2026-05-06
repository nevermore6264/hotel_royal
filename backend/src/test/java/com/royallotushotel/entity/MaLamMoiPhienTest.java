package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class MaLamMoiPhienTest {

    @Test
    void builder() {
        LocalDateTime hetHan = LocalDateTime.of(2026, 12, 31, 23, 59);
        MaLamMoiPhien e = MaLamMoiPhien.builder()
                .nguoiDung(new NguoiDung())
                .maToken("token-x")
                .thoiDiemHetHan(hetHan)
                .build();
        assertThat(e.getMaToken()).isEqualTo("token-x");
        assertThat(e.getThoiDiemHetHan()).isEqualTo(hetHan);
    }
}
