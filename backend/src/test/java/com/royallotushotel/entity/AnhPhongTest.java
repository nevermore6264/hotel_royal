package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AnhPhongTest {

    @Test
    void builder() {
        Phong phong = Phong.builder().soPhong("101").trangThai("PHONG_TRONG").loaiPhong(new LoaiPhong()).build();
        AnhPhong e = AnhPhong.builder().phong(phong).duongDanAnh("/uploads/x.jpg").build();
        assertThat(e.getDuongDanAnh()).isEqualTo("/uploads/x.jpg");
        assertThat(e.getPhong()).isSameAs(phong);
    }
}
