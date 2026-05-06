package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.LoaiPhongDto;
import com.royallotushotel.service.LoaiPhongService;
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

@WebMvcTest(LoaiPhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class LoaiPhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private LoaiPhongService loaiPhongService;

    @BeforeEach
    void resetMock() {
        reset(loaiPhongService);
    }

    @Test
    void danhSachKhongPhanTrang() throws Exception {
        when(loaiPhongService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/api/loai-phong")).andExpect(status().isOk());
    }

    @Test
    void danhSachCoPhanTrang() throws Exception {
        LoaiPhongDto dto = new LoaiPhongDto();
        dto.setId(1L);
        dto.setTen("Std");
        when(loaiPhongService.timPhanTrang(any(), eq("std")))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 5), 1));
        mockMvc.perform(get("/api/loai-phong")
                        .param("page", "0")
                        .param("size", "5")
                        .param("q", "std"))
                .andExpect(status().isOk());
    }

    @Test
    void layTheoId() throws Exception {
        LoaiPhongDto dto = new LoaiPhongDto();
        dto.setId(2L);
        when(loaiPhongService.layTheoId(2L)).thenReturn(dto);
        mockMvc.perform(get("/api/loai-phong/2")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        LoaiPhongDto body = new LoaiPhongDto();
        body.setTen("Suite");
        body.setGia(BigDecimal.TEN);
        LoaiPhongDto tra = new LoaiPhongDto();
        tra.setId(50L);
        when(loaiPhongService.tao(any(LoaiPhongDto.class))).thenReturn(tra);
        mockMvc.perform(post("/api/loai-phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        LoaiPhongDto body = new LoaiPhongDto();
        body.setTen("Suite+");
        when(loaiPhongService.capNhat(eq(3L), any(LoaiPhongDto.class))).thenReturn(body);
        mockMvc.perform(put("/api/loai-phong/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/api/loai-phong/9")).andExpect(status().isNoContent());
        verify(loaiPhongService).xoa(9L);
    }
}
