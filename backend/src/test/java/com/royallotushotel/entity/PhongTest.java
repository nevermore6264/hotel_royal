package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PhongTest {

    @Test
    void builderVaMacDinh() {
        Phong e = Phong.builder()
                .soPhong("201")
                .trangThai("PHONG_TRONG")
                .loaiPhong(new LoaiPhong())
                .build();
        assertThat(e.getAnh()).isEmpty();
        assertThat(e.getSoPhong()).isEqualTo("201");
    }
}
