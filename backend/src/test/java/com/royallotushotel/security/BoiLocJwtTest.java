package com.royallotushotel.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class BoiLocJwtTest {

    @Mock
    private TienIchJwt tienIchJwt;
    @Mock
    private DichVuChiTietNguoiDung dichVuChiTietNguoiDung;

    @Test
    void khongBearer_vanGoiTiepChuoiLoc() throws Exception {
        BoiLocJwt filter = new BoiLocJwt(tienIchJwt, dichVuChiTietNguoiDung);
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        AtomicBoolean next = new AtomicBoolean(false);
        FilterChain chain = (r, re) -> next.set(true);

        filter.doFilterInternal(req, res, chain);

        assertThat(next.get()).isTrue();
        verify(tienIchJwt, never()).hopLe(any());
    }
}
