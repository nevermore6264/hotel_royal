package com.royallotushotel.controller;

import com.royallotushotel.service.BangDieuKhienService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BangDieuKhienController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class BangDieuKhienControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private BangDieuKhienService bangDieuKhienService;

    @Test
    void phongTheoTrangThai() throws Exception {
        when(bangDieuKhienService.layPhongTheoTrangThai()).thenReturn(List.of());
        mockMvc.perform(get("/bang-dieu-khien/phong-theo-trang-thai")).andExpect(status().isOk());
    }
}
