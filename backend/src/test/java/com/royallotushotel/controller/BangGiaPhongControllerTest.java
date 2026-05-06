package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.BangGiaPhongDto;
import com.royallotushotel.service.BangGiaPhongService;
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
import java.time.LocalDate;
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

@WebMvcTest(BangGiaPhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class BangGiaPhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private BangGiaPhongService bangGiaPhongService;

    @BeforeEach
    void resetMock() {
        reset(bangGiaPhongService);
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void danhSachKhongPhanTrang() throws Exception {
        when(bangGiaPhongService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/api/bang-gia-phong")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void danhSachCoPhanTrang() throws Exception {
        BangGiaPhongDto dto = new BangGiaPhongDto();
        dto.setId(1L);
        when(bangGiaPhongService.timPhanTrang(any(), eq("deluxe"), eq(3L)))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(1, 6), 2));
        mockMvc.perform(get("/api/bang-gia-phong")
                        .param("page", "1")
                        .param("size", "6")
                        .param("q", "deluxe")
                        .param("idLoaiPhong", "3"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        BangGiaPhongDto body = new BangGiaPhongDto();
        body.setIdLoaiPhong(1L);
        body.setTenChinhSach("He");
        body.setNgayBatDau(LocalDate.of(2026, 6, 1));
        body.setNgayKetThuc(LocalDate.of(2026, 8, 1));
        body.setGiaApDung(BigDecimal.valueOf(500000));
        BangGiaPhongDto tra = new BangGiaPhongDto();
        tra.setId(99L);
        when(bangGiaPhongService.tao(any(BangGiaPhongDto.class))).thenReturn(tra);
        mockMvc.perform(post("/api/bang-gia-phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        BangGiaPhongDto body = new BangGiaPhongDto();
        body.setGiaApDung(BigDecimal.ONE);
        when(bangGiaPhongService.capNhat(eq(4L), any(BangGiaPhongDto.class))).thenReturn(body);
        mockMvc.perform(put("/api/bang-gia-phong/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/api/bang-gia-phong/8")).andExpect(status().isNoContent());
        verify(bangGiaPhongService).xoa(8L);
    }
}
