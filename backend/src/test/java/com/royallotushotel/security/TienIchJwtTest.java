package com.royallotushotel.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class TienIchJwtTest {

    @Test
    void taoVaGiaiMaTenDangNhap() {
        TienIchJwt jwt = new TienIchJwt();
        ReflectionTestUtils.setField(jwt, "biMatJwt", "test-secret-key-test-secret-key-test-secret-key");
        ReflectionTestUtils.setField(jwt, "thoiGianHetHanMs", 86_400_000L);
        ReflectionTestUtils.setField(jwt, "thoiGianHetHanLamMoiMs", 604_800_000L);

        String token = jwt.taoTokenTuTenDangNhap("demo_user");
        assertThat(jwt.layTenDangNhapTuToken(token)).isEqualTo("demo_user");
        assertThat(jwt.hopLe(token)).isTrue();
    }
}
