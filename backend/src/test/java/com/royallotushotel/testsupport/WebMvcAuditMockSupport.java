package com.royallotushotel.testsupport;

import com.royallotushotel.config.NhatKyHanhDongInterceptor;
import com.royallotushotel.security.BoiLocJwt;
import org.springframework.boot.test.mock.mockito.MockBean;

/**
 * Mock cho interceptor nhật ký và bộ lọc JWT trong {@code @WebMvcTest}.
 * <p>Không gắn {@code contextPath=/api} trên MockMvc: từ Spring 6.1, {@code requestURI} phải bắt đầu
 * bằng {@code contextPath}; test dùng đường dẫn kiểu {@code /bang-gia-phong} nên sẽ lỗi nếu gắn mặc định.
 * Slice test vẫn khớp controller; {@code server.servlet.context-path} chỉ khi chạy server thật.
 */
public abstract class WebMvcAuditMockSupport {

    @MockBean
    @SuppressWarnings("unused")
    private NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @MockBean
    @SuppressWarnings("unused")
    private BoiLocJwt boiLocJwt;
}
