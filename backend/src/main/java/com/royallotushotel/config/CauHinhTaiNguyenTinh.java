package com.royallotushotel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class CauHinhTaiNguyenTinh implements WebMvcConfigurer {

    @Value("${app.upload.root:uploads}")
    private String thuMucGoc;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path goc = Paths.get(thuMucGoc).toAbsolutePath().normalize();
        String uri = goc.toUri().toString();
        registry.addResourceHandler("/uploads/**").addResourceLocations(uri.endsWith("/") ? uri : uri + "/");
    }
}
