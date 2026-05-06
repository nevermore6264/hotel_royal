package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiThanhToan;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ThanhToanTest {

    @Test
    void builderVaMacDinh() {
        ThanhToan e = ThanhToan.builder()
                .datPhong(new DatPhong())
                .tongPhaiThu(BigDecimal.valueOf(1000000))
                .tongDaThu(BigDecimal.ZERO)
                .tongHoan(BigDecimal.ZERO)
                .conPhaiThu(BigDecimal.valueOf(1000000))
                .trangThai(MaTrangThaiThanhToan.CHUA_THANH_TOAN)
                .build();
        assertThat(e.getGiaoDich()).isEmpty();
        assertThat(e.getConPhaiThu()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
    }
}
