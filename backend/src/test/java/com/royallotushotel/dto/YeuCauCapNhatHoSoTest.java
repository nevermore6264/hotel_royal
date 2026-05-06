package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauCapNhatHoSoTest {

    @Test
    void gettersVaSetters() {
        YeuCauCapNhatHoSo dto = new YeuCauCapNhatHoSo();
        dto.setHoTen("Ten moi");
        dto.setSoDienThoai("0909");
        dto.setEmail("new@mail.com");

        assertThat(dto.getHoTen()).isEqualTo("Ten moi");
        assertThat(dto.getEmail()).isEqualTo("new@mail.com");
    }
}
