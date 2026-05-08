package com.royallotushotel.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    @Test
    void runtimeTraVe400() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.xuLyLoiThoiGianChay(new RuntimeException("Lỗi nghiệp vụ"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsEntry("loi", "Lỗi nghiệp vụ");
    }

    @Test
    void accessDeniedTraVe403() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.xuLyTuChoiTruyCap();
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
