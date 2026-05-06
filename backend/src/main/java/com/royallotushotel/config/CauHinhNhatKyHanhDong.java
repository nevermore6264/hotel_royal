package com.royallotushotel.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class CauHinhNhatKyHanhDong implements WebMvcConfigurer {

    private final NhatKyHanhDongInterceptor nhatKyHanhDongInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(nhatKyHanhDongInterceptor);
    }
}
