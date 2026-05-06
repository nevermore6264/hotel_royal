package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class KhachHangTest {

    @Test
    void builder() {
        KhachHang e = KhachHang.builder()
                .hoTen("Nguyen A")
                .email("a@b.com")
                .soDienThoai("0909")
                .build();
        assertThat(e.getHoTen()).isEqualTo("Nguyen A");
        assertThat(e.getEmail()).isEqualTo("a@b.com");
    }
}
