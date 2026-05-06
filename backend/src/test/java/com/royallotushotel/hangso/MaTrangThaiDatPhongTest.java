package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiDatPhongTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiDatPhong.CHO_DUYET).isEqualTo("CHO_DUYET");
        assertThat(MaTrangThaiDatPhong.DA_XAC_NHAN).isEqualTo("DA_XAC_NHAN");
        assertThat(MaTrangThaiDatPhong.DA_NHAN_PHONG).isEqualTo("DA_NHAN_PHONG");
        assertThat(MaTrangThaiDatPhong.DA_TRA_PHONG).isEqualTo("DA_TRA_PHONG");
        assertThat(MaTrangThaiDatPhong.DA_HUY).isEqualTo("DA_HUY");
    }
}
