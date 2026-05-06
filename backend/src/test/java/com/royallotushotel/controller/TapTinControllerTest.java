package com.royallotushotel.controller;

import com.royallotushotel.service.TapTinPhongService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TapTinController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class TapTinControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private TapTinPhongService tapTinPhongService;

    @BeforeEach
    void resetMock() {
        reset(tapTinPhongService);
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void taiLenPhongAnh() throws Exception {
        when(tapTinPhongService.luuAnhPhong(any())).thenReturn("/uploads/phong/test.jpg");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "a.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                new byte[] { 1, 2, 3 }
        );
        mockMvc.perform(multipart("/api/tap-tin/phong-anh").file(file)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void taiLenNhieu_ok() throws Exception {
        when(tapTinPhongService.luuAnhPhong(any())).thenReturn("/api/uploads/phong/x.png");
        MockMultipartFile f1 = new MockMultipartFile("files", "a.png", "image/png", new byte[] { 9 });
        MockMultipartFile f2 = new MockMultipartFile("files", "b.png", "image/png", new byte[] { 8 });
        mockMvc.perform(multipart("/api/tap-tin/phong-anh-nhieu").file(f1).file(f2)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void taiLenNhieu_khongCoTep_400() throws Exception {
        mockMvc.perform(multipart("/api/tap-tin/phong-anh-nhieu")).andExpect(status().isBadRequest());
    }
}
