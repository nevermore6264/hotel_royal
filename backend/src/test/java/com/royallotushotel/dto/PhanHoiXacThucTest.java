package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PhanHoiXacThucTest {

    @Test
    void builderVaMacDinhLoaiToken() {
        PhanHoiXacThuc dto = PhanHoiXacThuc.builder()
                .tokenTruyCap("jwt-access")
                .tokenLamMoi("jwt-refresh")
                .idNguoiDung(1L)
                .tenDangNhap("u1")
                .email("u@test.com")
                .vaiTro(List.of("ROLE_USER"))
                .build();

        assertThat(dto.getTokenTruyCap()).isEqualTo("jwt-access");
        assertThat(dto.getVaiTro()).hasSize(1);
    }

    @Test
    void allArgsConstructor() {
        PhanHoiXacThuc dto = new PhanHoiXacThuc(
                "a", "b", "Bearer", 1L, "u", "e", List.of("R"));
        assertThat(dto.getIdNguoiDung()).isEqualTo(1L);
    }
}
