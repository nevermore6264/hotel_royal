package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauTaoDanhGiaTest {

    @Test
    void gettersVaSetters() {
        YeuCauTaoDanhGia dto = new YeuCauTaoDanhGia();
        dto.setIdLoaiPhong(10L);
        dto.setDiem(5);
        dto.setNoiDung("Rat tot");

        assertThat(dto.getIdLoaiPhong()).isEqualTo(10L);
        assertThat(dto.getDiem()).isEqualTo(5);
        assertThat(dto.getNoiDung()).isEqualTo("Rat tot");
    }
}
