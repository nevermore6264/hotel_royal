package com.royallotushotel.controller;

import com.royallotushotel.service.DatPhongExcelService;
import com.royallotushotel.service.DatPhongService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DatPhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class DatPhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private DatPhongService datPhongService;

    @MockBean
    private DatPhongExcelService datPhongExcelService;

    @Test
    void danhSachPhanTrang() throws Exception {
        when(datPhongService.timTatCa(any(Pageable.class), isNull(), isNull(), isNull(), isNull()))
                .thenReturn(new PageImpl<>(List.of()));
        mockMvc.perform(get("/dat-phong").param("page", "0").param("size", "10")).andExpect(status().isOk());
    }
}
