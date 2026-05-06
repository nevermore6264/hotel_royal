package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaPhuongThucThanhToanTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaPhuongThucThanhToan.TIEN_MAT).isEqualTo("TIEN_MAT");
        assertThat(MaPhuongThucThanhToan.CONG_PAYOS).isEqualTo("CONG_PAYOS");
        assertThat(MaPhuongThucThanhToan.CHUYEN_KHOAN).isEqualTo("CHUYEN_KHOAN");
        assertThat(MaPhuongThucThanhToan.CONG_VNPAY).isEqualTo(MaPhuongThucThanhToan.CONG_PAYOS);
        assertThat(MaPhuongThucThanhToan.CONG_STRIPE).isEqualTo(MaPhuongThucThanhToan.CONG_PAYOS);
    }
}
