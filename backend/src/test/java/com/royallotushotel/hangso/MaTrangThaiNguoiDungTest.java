package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiNguoiDungTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiNguoiDung.HOAT_DONG).isEqualTo("HOAT_DONG");
        assertThat(MaTrangThaiNguoiDung.VO_HIEU).isEqualTo("VO_HIEU");
        assertThat(MaTrangThaiNguoiDung.KHOA).isEqualTo("KHOA");
    }
}
