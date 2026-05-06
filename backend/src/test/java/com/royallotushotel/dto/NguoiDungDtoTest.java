package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NguoiDungDtoTest {

    @Test
    void gettersVaSetters() {
        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(1L);
        dto.setTenDangNhap("user1");
        dto.setMatKhau("secret");
        dto.setEmail("u@test.com");
        dto.setHoTen("Le C");
        dto.setSoDienThoai("0912345678");
        dto.setTrangThai("HOAT_DONG");
        dto.setVaiTro(List.of("ROLE_KHACH_HANG"));

        assertThat(dto.getTenDangNhap()).isEqualTo("user1");
        assertThat(dto.getVaiTro()).containsExactly("ROLE_KHACH_HANG");
    }
}
