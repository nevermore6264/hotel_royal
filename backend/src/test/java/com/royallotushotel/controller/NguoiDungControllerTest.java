package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.NguoiDungDto;
import com.royallotushotel.service.NguoiDungService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NguoiDungController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class NguoiDungControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private NguoiDungService nguoiDungService;

    @BeforeEach
    void resetMock() {
        reset(nguoiDungService);
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void danhSachKhongPhanTrang() throws Exception {
        when(nguoiDungService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/nguoi-dung")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void danhSachCoPhanTrang() throws Exception {
        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(1L);
        when(nguoiDungService.timPhanTrang(any(), eq("admin"), eq("HOAT_DONG"), eq("LE_TAN")))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 12), 1));
        mockMvc.perform(get("/nguoi-dung")
                        .param("page", "0")
                        .param("q", "admin")
                        .param("trangThai", "HOAT_DONG")
                        .param("vaiTro", "LE_TAN"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void layTheoId() throws Exception {
        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(5L);
        when(nguoiDungService.layTheoId(5L)).thenReturn(dto);
        mockMvc.perform(get("/nguoi-dung/5")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        NguoiDungDto body = new NguoiDungDto();
        body.setTenDangNhap("u1");
        body.setEmail("u1@x.com");
        NguoiDungDto tra = new NguoiDungDto();
        tra.setId(100L);
        when(nguoiDungService.tao(any(NguoiDungDto.class))).thenReturn(tra);
        mockMvc.perform(post("/nguoi-dung")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        NguoiDungDto body = new NguoiDungDto();
        body.setHoTen("New name");
        when(nguoiDungService.capNhat(eq(2L), any(NguoiDungDto.class))).thenReturn(body);
        mockMvc.perform(put("/nguoi-dung/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/nguoi-dung/6")).andExpect(status().isOk());
        verify(nguoiDungService).xoa(6L);
    }
}
