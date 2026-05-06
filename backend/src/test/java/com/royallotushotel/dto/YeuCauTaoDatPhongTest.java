package com.royallotushotel.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauTaoDatPhongTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void hopLe() {
        YeuCauTaoDatPhong dto = new YeuCauTaoDatPhong();
        dto.setIdKhachHang(1L);
        dto.setNgayNhanPhong(LocalDate.of(2026, 6, 1));
        dto.setNgayTraPhong(LocalDate.of(2026, 6, 3));
        dto.setIdPhong(List.of(10L, 11L));
        dto.setTenKhach("A");
        dto.setSdtKhach("0123");
        dto.setEmailKhach("a@b.com");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void khongHopLe_khiThieuTruongBatBuoc() {
        assertThat(validator.validate(new YeuCauTaoDatPhong())).isNotEmpty();
    }
}
