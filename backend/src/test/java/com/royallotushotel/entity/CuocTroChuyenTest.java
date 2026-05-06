package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CuocTroChuyenTest {

    @Test
    void builder() {
        LocalDateTime now = LocalDateTime.of(2026, 5, 1, 10, 0);
        CuocTroChuyen e = CuocTroChuyen.builder()
                .nguoiDungKhach(new NguoiDung())
                .thoiDiemCapNhat(now)
                .build();
        assertThat(e.getThoiDiemCapNhat()).isEqualTo(now);
    }
}
