package com.royallotushotel.testsupport;

import com.royallotushotel.config.NhatKyHanhDongInterceptor;
import com.royallotushotel.security.BoiLocJwt;
import org.springframework.boot.test.mock.mockito.MockBean;

public abstract class WebMvcAuditMockSupport {

    @MockBean
    @SuppressWarnings("unused")
    private NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @MockBean
    @SuppressWarnings("unused")
    private BoiLocJwt boiLocJwt;
}
