package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NguoiDungTest {

    @Test
    void builder() {
        NguoiDung e = NguoiDung.builder()
                .tenDangNhap("user1")
                .matKhau("secret")
                .email("u@u.com")
                .build();
        assertThat(e.getTenDangNhap()).isEqualTo("user1");
        assertThat(e.getEmail()).isEqualTo("u@u.com");
        assertThat(e.getVaiTro()).isEmpty();
    }
}
