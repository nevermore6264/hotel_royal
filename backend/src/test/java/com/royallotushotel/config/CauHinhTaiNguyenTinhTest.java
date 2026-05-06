package com.royallotushotel.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class CauHinhTaiNguyenTinhTest {

    @Test
    void taoCauHinh() {
        CauHinhTaiNguyenTinh cfg = new CauHinhTaiNguyenTinh();
        ReflectionTestUtils.setField(cfg, "thuMucGoc", "uploads");
        assertThat(cfg).isNotNull();
    }
}
