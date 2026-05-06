package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaVaiTroTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaVaiTro.QUAN_TRI).isEqualTo("ROLE_QUAN_TRI");
        assertThat(MaVaiTro.LE_TAN).isEqualTo("ROLE_LE_TAN");
        assertThat(MaVaiTro.KHACH_HANG).isEqualTo("ROLE_KHACH_HANG");
        assertThat(MaVaiTro.VANG_LAI).isEqualTo("ROLE_VANG_LAI");
        assertThat(MaVaiTro.BUONG_PHONG).isEqualTo("ROLE_BUONG_PHONG");
    }
}
