package com.royallotushotel.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauDangNhapTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void hopLe() {
        YeuCauDangNhap dto = new YeuCauDangNhap();
        dto.setTenDangNhap("admin");
        dto.setMatKhau("secret");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void khongHopLe_khiRong() {
        assertThat(validator.validate(new YeuCauDangNhap())).isNotEmpty();
    }
}
