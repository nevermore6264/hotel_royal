package com.royallotushotel.config;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.EnableAsync;

import static org.assertj.core.api.Assertions.assertThat;

class AsyncConfigTest {

    @Test
    void batAsync() {
        assertThat(AsyncConfig.class.getAnnotation(EnableAsync.class)).isNotNull();
    }
}
