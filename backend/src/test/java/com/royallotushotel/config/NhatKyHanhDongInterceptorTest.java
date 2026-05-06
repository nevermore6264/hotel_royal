package com.royallotushotel.config;

import com.royallotushotel.service.NhatKyHeThongService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NhatKyHanhDongInterceptorTest {

    @Mock
    private NhatKyHeThongService nhatKyHeThongService;
    @InjectMocks
    private NhatKyHanhDongInterceptor interceptor;

    @Test
    void afterCompletion_ghiLogChoPost() {
        HttpServletRequest req = org.mockito.Mockito.mock(HttpServletRequest.class);
        when(req.getMethod()).thenReturn("POST");
        when(req.getRequestURI()).thenReturn("/api/phong");
        HttpServletResponse res = org.mockito.Mockito.mock(HttpServletResponse.class);
        when(res.getStatus()).thenReturn(200);

        interceptor.afterCompletion(req, res, null, null);

        verify(nhatKyHeThongService).ghi(anyString(), anyString(), isNull());
    }
}
