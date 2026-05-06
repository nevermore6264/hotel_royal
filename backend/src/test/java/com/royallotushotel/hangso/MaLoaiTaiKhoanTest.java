package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaLoaiTaiKhoanTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaLoaiTaiKhoan.VANG_LAI).isEqualTo("VANG_LAI");
    }
}
