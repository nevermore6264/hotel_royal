package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NguoiDungHoTroChatDtoTest {

    @Test
    void builderVaGetters() {
        NguoiDungHoTroChatDto dto = NguoiDungHoTroChatDto.builder()
                .id(1L)
                .hoTen("Nhan vien")
                .tenDangNhap("nv1")
                .loaiVaiTro("ROLE_LE_TAN")
                .build();

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getHoTen()).isEqualTo("Nhan vien");
        assertThat(dto.getTenDangNhap()).isEqualTo("nv1");
        assertThat(dto.getLoaiVaiTro()).isEqualTo("ROLE_LE_TAN");
    }
}
