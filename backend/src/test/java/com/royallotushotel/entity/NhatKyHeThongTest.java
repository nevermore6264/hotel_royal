package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class NhatKyHeThongTest {

    @Test
    void builder() {
        LocalDateTime t = LocalDateTime.of(2026, 5, 7, 8, 0);
        NhatKyHeThong e = NhatKyHeThong.builder()
                .thoiDiem(t)
                .hanhDong("POST /api/phong")
                .chiTiet("tao phong")
                .build();
        assertThat(e.getHanhDong()).isEqualTo("POST /api/phong");
        assertThat(e.getThoiDiem()).isEqualTo(t);
    }
}
