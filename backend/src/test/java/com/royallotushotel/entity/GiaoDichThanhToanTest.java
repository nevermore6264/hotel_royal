package com.royallotushotel.entity;

import com.royallotushotel.hangso.LoaiGiaoDichThanhToan;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class GiaoDichThanhToanTest {

    @Test
    void builder() {
        GiaoDichThanhToan e = GiaoDichThanhToan.builder()
                .thanhToan(ThanhToan.builder().datPhong(new DatPhong()).tongPhaiThu(BigDecimal.ONE).tongDaThu(BigDecimal.ZERO).tongHoan(BigDecimal.ZERO).conPhaiThu(BigDecimal.ONE).build())
                .loaiGiaoDich(LoaiGiaoDichThanhToan.THANH_TOAN)
                .soTien(BigDecimal.valueOf(100000))
                .build();
        assertThat(e.getLoaiGiaoDich()).isEqualTo(LoaiGiaoDichThanhToan.THANH_TOAN);
        assertThat(e.getSoTien()).isEqualByComparingTo(BigDecimal.valueOf(100000));
    }
}
