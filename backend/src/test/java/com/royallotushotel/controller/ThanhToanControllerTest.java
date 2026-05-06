package com.royallotushotel.controller;

import com.royallotushotel.service.ThanhToanService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ThanhToanController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ThanhToanControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ThanhToanService thanhToanService;

    @Test
    void goiLai() throws Exception {
        mockMvc.perform(get("/api/thanh-toan/goi-lai")).andExpect(status().isOk());
    }
}
