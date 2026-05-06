package com.royallotushotel.testsupport;

import com.royallotushotel.config.NhatKyHanhDongInterceptor;
import com.royallotushotel.security.BoiLocJwt;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

/**
 * Beans that {@code @WebMvcTest} pulls into the slice but whose dependencies are not
 * scanned: audit interceptor; JWT filter ({@link BoiLocJwt} is a {@link jakarta.servlet.Filter}).
 * <p>Context-path servlet phải là {@code /} trong slice {@code @WebMvcTest} để URI kiểu
 * {@code /loai-phong/1} khớp mapping (tránh lệch so với {@code /api} trong {@code application.yml}).
 * Mỗi lớp test khai báo {@code @WebMvcTest(..., properties = "server.servlet.context-path=/")}
 * để chắc chắn thuộc tính được nạp; {@code @TestPropertySource} ở đây chỉ bổ sung.
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
