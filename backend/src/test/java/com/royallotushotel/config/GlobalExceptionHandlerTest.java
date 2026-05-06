package com.royallotushotel.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    @Test
    void runtimeTraVe400() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.handleRuntime(new RuntimeException("Loi nghiep vu"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsEntry("error", "Loi nghiep vu");
    }

    @Test
    void accessDeniedTraVe403() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.handleAccessDenied();
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
