package com.royallotushotel.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauDangKyTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void hopLe() {
        YeuCauDangKy dto = new YeuCauDangKy();
        dto.setTenDangNhap("user1");
        dto.setMatKhau("123456");
        dto.setEmail("a@b.com");
        dto.setHoTen("Nguyen Van A");
        dto.setSoDienThoai("0123456789");
        dto.setLoaiTaiKhoan("KHACH_HANG");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void khongHopLe_khiThieuBatBuoc() {
        assertThat(validator.validate(new YeuCauDangKy())).isNotEmpty();
    }

    @Test
    void khongHopLe_emailSaiDinhDang() {
        YeuCauDangKy dto = new YeuCauDangKy();
        dto.setTenDangNhap("user1");
        dto.setMatKhau("123456");
        dto.setEmail("khong-phai-email");
        dto.setHoTen("A");

        assertThat(validator.validate(dto)).isNotEmpty();
    }
}
