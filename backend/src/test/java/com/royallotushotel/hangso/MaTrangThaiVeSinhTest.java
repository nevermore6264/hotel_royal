package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiVeSinhTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiVeSinh.SACH).isEqualTo("SACH");
        assertThat(MaTrangThaiVeSinh.CAN_DON).isEqualTo("CAN_DON");
        assertThat(MaTrangThaiVeSinh.BAN).isEqualTo("BAN");
        assertThat(MaTrangThaiVeSinh.DANG_DON).isEqualTo("DANG_DON");
    }
}
