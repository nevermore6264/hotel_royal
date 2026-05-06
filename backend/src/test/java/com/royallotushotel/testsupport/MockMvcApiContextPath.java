package com.royallotushotel.testsupport;

import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@TestConfiguration
public class MockMvcApiContextPath {

    @Bean
    MockMvcBuilderCustomizer macDinhContextPathApi() {
        return builder -> builder.defaultRequest(
                MockMvcRequestBuilders.get("/").contextPath("/api"));
    }
}
