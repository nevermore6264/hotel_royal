package com.royallotushotel.testsupport;

import com.royallotushotel.config.NhatKyHanhDongInterceptor;
import com.royallotushotel.security.BoiLocJwt;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

/**
 * Beans that {@code @WebMvcTest} pulls into the slice but whose dependencies are not
 * scanned: audit interceptor; JWT filter ({@link BoiLocJwt} is a {@link jakarta.servlet.Filter}).
 * <p>Ghi đè {@code application-test.yml} context-path: MockMvc dùng path servlet giống mapping
 * controller (không tiền tố {@code /api}).
 */
@TestPropertySource(properties = "server.servlet.context-path=/")
public abstract class WebMvcAuditMockSupport {

    @MockBean
    @SuppressWarnings("unused")
    private NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @MockBean
    @SuppressWarnings("unused")
    private BoiLocJwt boiLocJwt;
}
