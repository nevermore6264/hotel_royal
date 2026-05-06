package com.royallotushotel.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauGuiTinKhachTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void hopLe() {
        YeuCauGuiTinKhach dto = new YeuCauGuiTinKhach();
        dto.setIdNguoiHoTro(5L);
        dto.setNoiDung("Hi");
        dto.setKieuTin("VAN_BAN");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void khongHopLe_khiThieuIdNguoiHoTro() {
        YeuCauGuiTinKhach dto = new YeuCauGuiTinKhach();
        dto.setNoiDung("Hi");

        assertThat(validator.validate(dto)).isNotEmpty();
    }
}
