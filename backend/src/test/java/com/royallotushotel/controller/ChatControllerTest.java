package com.royallotushotel.controller;

import com.royallotushotel.service.ChatService;
import com.royallotushotel.service.TapTinPhongService;
import com.royallotushotel.testsupport.WebMvcAuditMockSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest extends WebMvcAuditMockSupport {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ChatService chatService;
    @MockBean
    private TapTinPhongService tapTinPhongService;

    @Test
    void nhanVienHoTro() throws Exception {
        when(chatService.danhSachNhanVienHoTro()).thenReturn(List.of());
        mockMvc.perform(get("/chat/nhan-vien-ho-tro")).andExpect(status().isOk());
    }
}
