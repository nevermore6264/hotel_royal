package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiThanhToanTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiThanhToan.CHUA_THANH_TOAN).isEqualTo("CHUA_THANH_TOAN");
        assertThat(MaTrangThaiThanhToan.DAT_COC).isEqualTo("DAT_COC");
        assertThat(MaTrangThaiThanhToan.THANH_TOAN_MOT_PHAN).isEqualTo("THANH_TOAN_MOT_PHAN");
        assertThat(MaTrangThaiThanhToan.DA_THANH_TOAN).isEqualTo("DA_THANH_TOAN");
        assertThat(MaTrangThaiThanhToan.THAT_BAI).isEqualTo("THAT_BAI");
        assertThat(MaTrangThaiThanhToan.DA_HOAN_TIEN).isEqualTo("DA_HOAN_TIEN");
        assertThat(MaTrangThaiThanhToan.HOAN_TIEN_MOT_PHAN).isEqualTo("HOAN_TIEN_MOT_PHAN");
    }
}
