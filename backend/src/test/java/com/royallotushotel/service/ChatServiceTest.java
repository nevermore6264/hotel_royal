package com.royallotushotel.service;

import com.royallotushotel.repository.CuocTroChuyenRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.TinNhanChatRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private CuocTroChuyenRepository cuocTroChuyenRepository;
    @Mock
    private TinNhanChatRepository tinNhanChatRepository;
    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @InjectMocks
    private ChatService chatService;

    @Test
    void danhSachNhanVienHoTro_rong() {
        when(nguoiDungRepository.timNhanVienHoTroChat(anyString())).thenReturn(List.of());
        assertThat(chatService.danhSachNhanVienHoTro()).isEmpty();
    }
}
