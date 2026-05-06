package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.PhongDto;
import com.royallotushotel.service.PhongService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private PhongService phongService;

    @BeforeEach
    void resetMock() {
        reset(phongService);
    }

    @Test
    void conTrong_khongThamSo() throws Exception {
        when(phongService.timPhongTrong(any())).thenReturn(List.of());
        mockMvc.perform(get("/phong/con-trong")).andExpect(status().isOk());
    }

    @Test
    void conTrong_coThamSo() throws Exception {
        when(phongService.timPhongTrong(any())).thenReturn(List.of());
        mockMvc.perform(get("/phong/con-trong")
                        .param("ngayNhanPhong", "2026-05-01")
                        .param("ngayTraPhong", "2026-05-03")
                        .param("idLoaiPhong", "2"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void danhSach_khongPhanTrang() throws Exception {
        when(phongService.timTatCa()).thenReturn(List.of());
        mockMvc.perform(get("/phong")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "BUONG_PHONG")
    void danhSach_coPhanTrang() throws Exception {
        PhongDto dto = new PhongDto();
        dto.setId(1L);
        when(phongService.timPhanTrang(any(), eq("101"), eq("PHONG_TRONG"), eq(5L)))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 12), 1));
        mockMvc.perform(get("/phong")
                        .param("page", "0")
                        .param("size", "12")
                        .param("q", "101")
                        .param("trangThai", "PHONG_TRONG")
                        .param("idLoaiPhong", "5"))
                .andExpect(status().isOk());
    }

    @Test
    void layTheoId() throws Exception {
        PhongDto dto = new PhongDto();
        dto.setId(1L);
        when(phongService.layTheoId(1L)).thenReturn(dto);
        mockMvc.perform(get("/phong/1")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void tao() throws Exception {
        PhongDto body = new PhongDto();
        body.setSoPhong("201");
        body.setIdLoaiPhong(1L);
        PhongDto traVe = new PhongDto();
        traVe.setId(99L);
        when(phongService.tao(any(PhongDto.class))).thenReturn(traVe);
        mockMvc.perform(post("/phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhat() throws Exception {
        PhongDto body = new PhongDto();
        body.setSoPhong("201");
        when(phongService.capNhat(eq(7L), any(PhongDto.class))).thenReturn(body);
        mockMvc.perform(put("/phong/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhatTrangThai() throws Exception {
        mockMvc.perform(patch("/phong/3/trang-thai").param("trangThai", "DANG_SU_DUNG"))
                .andExpect(status().isOk());
        verify(phongService).capNhatTrangThai(3L, "DANG_SU_DUNG");
    }

    @Test
    @WithMockUser(roles = "LE_TAN")
    void canDonVeSinh() throws Exception {
        when(phongService.timPhongCanDon()).thenReturn(List.of());
        mockMvc.perform(get("/phong/can-don-ve-sinh")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void capNhatVeSinh_coGhiChu() throws Exception {
        mockMvc.perform(patch("/phong/4/ve-sinh")
                        .param("trangThaiVeSinh", "SACH")
                        .param("ghiChu", "Da don"))
                .andExpect(status().isOk());
        verify(phongService).capNhatVeSinh(4L, "SACH", "Da don");
    }

    @Test
    @WithMockUser(roles = "BUONG_PHONG")
    void capNhatVeSinh_khongGhiChu() throws Exception {
        mockMvc.perform(patch("/phong/4/ve-sinh").param("trangThaiVeSinh", "BAN"))
                .andExpect(status().isOk());
        verify(phongService).capNhatVeSinh(4L, "BAN", null);
    }

    @Test
    @WithMockUser(roles = "QUAN_TRI")
    void xoa() throws Exception {
        mockMvc.perform(delete("/phong/8")).andExpect(status().isOk());
        verify(phongService).xoa(8L);
    }
}
