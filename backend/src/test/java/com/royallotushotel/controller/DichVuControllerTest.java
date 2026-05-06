package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.DichVuDto;
import com.royallotushotel.service.QuanLyDichVuService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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

@WebMvcTest(DichVuController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class DichVuControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private QuanLyDichVuService quanLyDichVuService;

    @BeforeEach
    void resetMock() {
        reset(quanLyDichVuService);
    }

    @Test
    @WithMockUser(roles = "BUONG_PHONG")
    void danhSachKhongPhanTrang() throws Exception {
        when(quanLyDichVuService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/api/dich-vu")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void danhSachCoPhanTrang() throws Exception {
        DichVuDto dto = new DichVuDto();
        dto.setId(1L);
        when(quanLyDichVuService.timPhanTrang(any(), eq("spa")))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 12), 1));
        mockMvc.perform(get("/api/dich-vu").param("page", "0").param("q", "spa")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        DichVuDto body = new DichVuDto();
        body.setTen("Giat ui");
        body.setGia(BigDecimal.valueOf(50000));
        DichVuDto tra = new DichVuDto();
        tra.setId(10L);
        when(quanLyDichVuService.tao(any(DichVuDto.class))).thenReturn(tra);
        mockMvc.perform(post("/api/dich-vu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        DichVuDto body = new DichVuDto();
        body.setTen("Spa");
        when(quanLyDichVuService.capNhat(eq(2L), any(DichVuDto.class))).thenReturn(body);
        mockMvc.perform(put("/api/dich-vu/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/api/dich-vu/3")).andExpect(status().isOk());
        verify(quanLyDichVuService).xoa(3L);
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void themVaoDatPhong_coSoLuong() throws Exception {
        mockMvc.perform(post("/api/dich-vu/dat-phong/100/them")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idDichVu", 5, "soLuong", 2))))
                .andExpect(status().isOk());
        verify(quanLyDichVuService).themVaoDatPhong(100L, 5L, 2);
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void themVaoDatPhong_macDinhSoLuong1() throws Exception {
        mockMvc.perform(post("/api/dich-vu/dat-phong/101/them")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idDichVu", 7))))
                .andExpect(status().isOk());
        verify(quanLyDichVuService).themVaoDatPhong(101L, 7L, 1);
    }
}
