package com.royallotushotel.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class CauHinhNhatKyHanhDongTest {

    @Mock
    private NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @Test
    void taoCauHinh() {
        assertThat(new CauHinhNhatKyHanhDong(nhatKyHanhDongInterceptor)).isNotNull();
    }
}
