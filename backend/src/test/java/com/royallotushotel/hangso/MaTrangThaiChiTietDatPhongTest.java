package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiChiTietDatPhongTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiChiTietDatPhong.DANG_GIU).isEqualTo("DANG_GIU");
        assertThat(MaTrangThaiChiTietDatPhong.DA_XAC_NHAN).isEqualTo("DA_XAC_NHAN");
        assertThat(MaTrangThaiChiTietDatPhong.DA_HUY).isEqualTo("DA_HUY");
        assertThat(MaTrangThaiChiTietDatPhong.DA_NHAN_PHONG).isEqualTo("DA_NHAN_PHONG");
        assertThat(MaTrangThaiChiTietDatPhong.DA_TRA_PHONG).isEqualTo("DA_TRA_PHONG");
    }
}
