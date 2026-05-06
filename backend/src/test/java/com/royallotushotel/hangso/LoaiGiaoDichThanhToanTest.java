package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoaiGiaoDichThanhToanTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(LoaiGiaoDichThanhToan.DAT_COC).isEqualTo("DAT_COC");
        assertThat(LoaiGiaoDichThanhToan.THANH_TOAN).isEqualTo("THANH_TOAN");
        assertThat(LoaiGiaoDichThanhToan.HOAN_TIEN).isEqualTo("HOAN_TIEN");
        assertThat(LoaiGiaoDichThanhToan.DIEU_CHINH).isEqualTo("DIEU_CHINH");
    }
}
