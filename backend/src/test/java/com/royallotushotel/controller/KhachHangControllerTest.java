package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.KhachHangDto;
import com.royallotushotel.service.KhachHangService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = KhachHangController.class, properties = "server.servlet.context-path=/")
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class KhachHangControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private KhachHangService khachHangService;

    @BeforeEach
    void resetMock() {
        reset(khachHangService);
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void danhSachKhongPhanTrangKhongQ_goiTimTatCa() throws Exception {
        when(khachHangService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/khach-hang")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void danhSachKhongPhanTrangCoQ_goiTimKiem() throws Exception {
        when(khachHangService.timKiem("090")).thenReturn(List.of());
        mockMvc.perform(get("/khach-hang").param("q", "090")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void danhSachCoPhanTrang() throws Exception {
        KhachHangDto dto = new KhachHangDto();
        dto.setId(1L);
        when(khachHangService.timPhanTrang(any(), eq("a")))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 15), 1));
        mockMvc.perform(get("/khach-hang")
                        .param("page", "0")
                        .param("size", "15")
                        .param("q", "a"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void layTheoId() throws Exception {
        KhachHangDto dto = new KhachHangDto();
        dto.setId(8L);
        when(khachHangService.layTheoId(8L)).thenReturn(dto);
        mockMvc.perform(get("/khach-hang/8")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void tao() throws Exception {
        KhachHangDto body = new KhachHangDto();
        body.setHoTen("Nguyen A");
        KhachHangDto tra = new KhachHangDto();
        tra.setId(20L);
        when(khachHangService.tao(any(KhachHangDto.class))).thenReturn(tra);
        mockMvc.perform(post("/khach-hang")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        KhachHangDto body = new KhachHangDto();
        body.setHoTen("Tran B");
        when(khachHangService.capNhat(eq(3L), any(KhachHangDto.class))).thenReturn(body);
        mockMvc.perform(put("/khach-hang/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }
}
