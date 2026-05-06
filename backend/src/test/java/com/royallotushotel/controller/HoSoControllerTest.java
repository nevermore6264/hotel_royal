package com.royallotushotel.controller;

import com.royallotushotel.dto.NguoiDungDto;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.NguoiDungService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
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

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = HoSoController.class, properties = "server.servlet.context-path=/")
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class HoSoControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private NguoiDungService nguoiDungService;

    @Test
    void layHoSo() throws Exception {
        ChuTheNguoiDung principal = new ChuTheNguoiDung(
                1L,
                "user",
                "u@u.com",
                "pw",
                MaTrangThaiNguoiDung.HOAT_DONG,
                List.of(new SimpleGrantedAuthority(MaVaiTro.KHACH_HANG))
        );
        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(1L);
        when(nguoiDungService.layTheoId(1L)).thenReturn(dto);
        mockMvc.perform(get("/ho-so").with(user(principal)).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
