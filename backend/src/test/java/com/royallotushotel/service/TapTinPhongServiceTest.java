package com.royallotushotel.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TapTinPhongServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void luuAnhPhong_shouldStoreImage() throws IOException {
        TapTinPhongService service = new TapTinPhongService();
        ReflectionTestUtils.setField(service, "thuMucGoc", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("f", "a.jpg", "image/jpeg", "abc".getBytes());

        String url = service.luuAnhPhong(file);

        assertThat(url).startsWith("/api/uploads/phong/");
    }

    @Test
    void luuAnhChat_shouldStoreImage() throws IOException {
        TapTinPhongService service = new TapTinPhongService();
        ReflectionTestUtils.setField(service, "thuMucGoc", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("f", "a.png", "image/png", "abc".getBytes());

        String url = service.luuAnhChat(file);

        assertThat(url).startsWith("/api/uploads/chat/");
    }

    @Test
    void luuAnhPhong_shouldRejectNonImage() {
        TapTinPhongService service = new TapTinPhongService();
        ReflectionTestUtils.setField(service, "thuMucGoc", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("f", "a.txt", "text/plain", "abc".getBytes());

        assertThatThrownBy(() -> service.luuAnhPhong(file))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
