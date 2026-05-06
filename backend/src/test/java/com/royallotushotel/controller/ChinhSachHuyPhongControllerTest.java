package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.ChinhSachHuyPhongDto;
import com.royallotushotel.service.ChinhSachHuyPhongService;
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

@WebMvcTest(ChinhSachHuyPhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ChinhSachHuyPhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private ChinhSachHuyPhongService chinhSachHuyPhongService;

    @BeforeEach
    void resetMock() {
        reset(chinhSachHuyPhongService);
    }

    @Test
    void danhSachKhongPhanTrang() throws Exception {
        when(chinhSachHuyPhongService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/api/chinh-sach-huy-phong")).andExpect(status().isOk());
    }

    @Test
    void danhSachCoPhanTrangVaBoLoc() throws Exception {
        ChinhSachHuyPhongDto dto = new ChinhSachHuyPhongDto();
        dto.setId(1L);
        when(chinhSachHuyPhongService.timPhanTrang(any(), eq("vip"), eq(false)))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1));
        mockMvc.perform(get("/api/chinh-sach-huy-phong")
                        .param("page", "0")
                        .param("size", "10")
                        .param("q", "vip")
                        .param("conHieuLuc", "false"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        ChinhSachHuyPhongDto body = new ChinhSachHuyPhongDto();
        body.setSoGioTruocNhanPhong(48);
        body.setTyLeHoanTien(BigDecimal.valueOf(0.8));
        body.setMoTa("Test");
        ChinhSachHuyPhongDto tra = new ChinhSachHuyPhongDto();
        tra.setId(100L);
        when(chinhSachHuyPhongService.tao(any(ChinhSachHuyPhongDto.class))).thenReturn(tra);
        mockMvc.perform(post("/api/chinh-sach-huy-phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        ChinhSachHuyPhongDto body = new ChinhSachHuyPhongDto();
        body.setSoGioTruocNhanPhong(24);
        when(chinhSachHuyPhongService.capNhat(eq(5L), any(ChinhSachHuyPhongDto.class))).thenReturn(body);
        mockMvc.perform(put("/api/chinh-sach-huy-phong/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/api/chinh-sach-huy-phong/7")).andExpect(status().isNoContent());
        verify(chinhSachHuyPhongService).xoa(7L);
    }
}
