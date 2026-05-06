package com.royallotushotel.controller;

import com.royallotushotel.service.DanhGiaService;
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

@WebMvcTest(DanhGiaController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class DanhGiaControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private DanhGiaService danhGiaService;

    @Test
    void theoLoaiPhong() throws Exception {
        when(danhGiaService.listTheoLoaiPhong(1L)).thenReturn(List.of());
        mockMvc.perform(get("/api/danh-gia").param("idLoaiPhong", "1")).andExpect(status().isOk());
    }
}
