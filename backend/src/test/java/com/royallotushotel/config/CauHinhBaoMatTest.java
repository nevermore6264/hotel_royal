package com.royallotushotel.config;

import com.royallotushotel.security.BoiLocJwt;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CauHinhBaoMatTest {

    @Test
    void taoInstance() {
        assertThat(new CauHinhBaoMat(mock(BoiLocJwt.class), mock(UserDetailsService.class))).isNotNull();
    }
}
