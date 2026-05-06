package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauDoiMatKhauTest {

    @Test
    void gettersVaSetters() {
        YeuCauDoiMatKhau dto = new YeuCauDoiMatKhau();
        dto.setMatKhauCu("oldPass");
        dto.setMatKhauMoi("newPass");

        assertThat(dto.getMatKhauCu()).isEqualTo("oldPass");
        assertThat(dto.getMatKhauMoi()).isEqualTo("newPass");
    }
}
