package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.DanhGiaDto;
import com.royallotushotel.dto.YeuCauTaoDanhGia;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.DanhGiaService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DanhGiaController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class DanhGiaControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private DanhGiaService danhGiaService;

    @BeforeEach
    void resetMock() {
        reset(danhGiaService);
    }

    @Test
    void theoLoaiPhong() throws Exception {
        when(danhGiaService.listTheoLoaiPhong(1L)).thenReturn(List.of());
        mockMvc.perform(get("/api/danh-gia").param("idLoaiPhong", "1")).andExpect(status().isOk());
    }

    @Test
    void tao() throws Exception {
        ChuTheNguoiDung khach = new ChuTheNguoiDung(
                3L,
                "khach1",
                "k@k.com",
                "pw",
                MaTrangThaiNguoiDung.HOAT_DONG,
                List.of(new SimpleGrantedAuthority(MaVaiTro.KHACH_HANG))
        );
        YeuCauTaoDanhGia body = new YeuCauTaoDanhGia();
        body.setIdLoaiPhong(10L);
        body.setDiem(5);
        body.setNoiDung("Tot");
        DanhGiaDto tra = DanhGiaDto.builder().id(99L).build();
        when(danhGiaService.tao(any(ChuTheNguoiDung.class), any(YeuCauTaoDanhGia.class))).thenReturn(tra);
        mockMvc.perform(post("/api/danh-gia")
                        .with(user(khach))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }
}
