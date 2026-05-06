package com.royallotushotel.testsupport;

import com.royallotushotel.config.NhatKyHanhDongInterceptor;
import com.royallotushotel.security.BoiLocJwt;
import org.springframework.boot.test.mock.mockito.MockBean;
/**
 * Beans that {@code @WebMvcTest} pulls into the slice but whose dependencies are not
 * scanned: audit interceptor; JWT filter ({@link BoiLocJwt} is a {@link jakarta.servlet.Filter}).
 * <p>Không gắn {@code contextPath=/api} trên default MockMvc request: từ Spring Framework 6.1,
 * {@code requestURI} phải bắt đầu bằng {@code contextPath} nếu có; test dùng đường dẫn tương
 * đối servlet (vd. {@code /tap-tin/...}) nên gắn context path sẽ gây lỗi. Slice test vẫn khớp
 * controller; {@code server.servlet.context-path} chỉ áp dụng khi chạy server thật.
 */
public abstract class WebMvcAuditMockSupport {

    @MockBean
    @SuppressWarnings("unused")
    private NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @MockBean
    @SuppressWarnings("unused")
    private BoiLocJwt boiLocJwt;
}
