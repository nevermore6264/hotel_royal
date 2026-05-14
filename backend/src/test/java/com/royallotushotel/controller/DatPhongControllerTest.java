package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.dto.DatPhongDto;
import com.royallotushotel.dto.KetQuaNhapExcelDatPhongDto;
import com.royallotushotel.dto.YeuCauTaoDatPhong;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DatPhongController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class DatPhongControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
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

    @Test
    void mauExcelLeTan_traVeFile() throws Exception {
        when(datPhongExcelService.taoMauLeTan()).thenReturn(new byte[] {80, 75, 3, 4});
        mockMvc.perform(get("/dat-phong/mau-excel-le-tan"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("mau-dat-phong-le-tan")));
    }

    @Test
    void mauExcelKhach_traVeFile() throws Exception {
        when(datPhongExcelService.taoMauKhach()).thenReturn(new byte[] {80, 75, 3, 4});
        mockMvc.perform(get("/dat-phong/mau-excel-khach"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("mau-dat-phong-khach")));
    }

    @Test
    void layTheoId_traVeDto() throws Exception {
        DatPhongDto dto = new DatPhongDto();
        dto.setId(12L);
        dto.setTenKhachHang("A");
        when(datPhongService.layTheoId(eq(12L), isNull())).thenReturn(dto);
        mockMvc.perform(get("/dat-phong/12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(12));
    }

    @Test
    void taoDatPhong_traVeDto() throws Exception {
        YeuCauTaoDatPhong y = new YeuCauTaoDatPhong();
        y.setIdKhachHang(1L);
        y.setNgayNhanPhong(LocalDate.of(2026, 6, 1));
        y.setNgayTraPhong(LocalDate.of(2026, 6, 3));
        y.setIdPhong(List.of(5L));
        DatPhongDto tra = new DatPhongDto();
        tra.setId(99L);
        when(datPhongService.tao(any(YeuCauTaoDatPhong.class))).thenReturn(tra);
        mockMvc.perform(post("/dat-phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(y)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99));
    }

    @Test
    void nhanPhong_traVe204() throws Exception {
        mockMvc.perform(post("/dat-phong/7/nhan-phong")).andExpect(status().isNoContent());
        verify(datPhongService).nhanPhong(7L);
    }

    @Test
    void nhapExcelLeTan_multipart() throws Exception {
        when(datPhongExcelService.nhapLeTan(any())).thenReturn(
                KetQuaNhapExcelDatPhongDto.builder()
                        .tongHang(0)
                        .soThanhCong(0)
                        .soThatBai(0)
                        .chiTiet(List.of())
                        .build());
        MockMultipartFile tep = new MockMultipartFile(
                "tep",
                "t.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[] {80, 75});
        mockMvc.perform(multipart("/dat-phong/nhap-excel-le-tan").file(tep))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tongHang").value(0));
    }
}
