package com.royallotushotel.controller;

import com.royallotushotel.service.XacThucService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(XacThucController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class XacThucControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private XacThucService xacThucService;

    @Test
    void toiKhongDangNhap() throws Exception {
        when(xacThucService.layThongTinToi(isNull())).thenReturn(Collections.emptyMap());
        mockMvc.perform(get("/api/xac-thuc/toi")).andExpect(status().isOk());
    }
}
