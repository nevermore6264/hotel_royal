package com.royallotushotel.controller;

import com.royallotushotel.service.NguoiDungService;
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

@WebMvcTest(NguoiDungController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class NguoiDungControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private NguoiDungService nguoiDungService;

    @Test
    void danhSachKhongPhanTrang() throws Exception {
        when(nguoiDungService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/api/nguoi-dung")).andExpect(status().isOk());
    }
}
