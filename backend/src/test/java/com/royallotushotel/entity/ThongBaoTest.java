package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ThongBaoTest {

    @Test
    void builderVaMacDinh() {
        ThongBao e = ThongBao.builder()
                .nguoiDung(new NguoiDung())
                .noiDung("Co dat phong moi")
                .build();
        assertThat(e.getDaDoc()).isFalse();
        assertThat(e.getNoiDung()).isEqualTo("Co dat phong moi");
    }
}
