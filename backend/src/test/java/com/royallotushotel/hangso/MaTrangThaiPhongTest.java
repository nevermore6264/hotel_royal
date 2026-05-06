package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiPhongTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiPhong.PHONG_TRONG).isEqualTo("PHONG_TRONG");
        assertThat(MaTrangThaiPhong.DANG_SU_DUNG).isEqualTo("DANG_SU_DUNG");
        assertThat(MaTrangThaiPhong.BAO_TRI).isEqualTo("BAO_TRI");
        assertThat(MaTrangThaiPhong.DA_GIU).isEqualTo("DA_GIU");
    }
}
