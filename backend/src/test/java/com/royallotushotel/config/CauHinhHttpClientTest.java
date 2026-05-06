package com.royallotushotel.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CauHinhHttpClientTest {

    @Test
    void restTemplateBean() {
        assertThat(new CauHinhHttpClient().restTemplate()).isNotNull();
    }
}
