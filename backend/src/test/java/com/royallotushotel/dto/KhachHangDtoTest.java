package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class KhachHangDtoTest {

    @Test
    void gettersVaSetters() {
        KhachHangDto dto = new KhachHangDto();
        dto.setId(1L);
        dto.setHoTen("Tran B");
        dto.setSoDienThoai("0987654321");
        dto.setEmail("b@test.com");
        dto.setSoCanCuoc("00112233");
        dto.setIdNguoiDung(99L);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getHoTen()).isEqualTo("Tran B");
        assertThat(dto.getIdNguoiDung()).isEqualTo(99L);
    }
}
