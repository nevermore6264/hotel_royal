package com.royallotushotel.service;

import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.CuocTroChuyenRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.TinNhanChatRepository;
import com.royallotushotel.security.ChuTheNguoiDung;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    @Test
    void tinNhanCuaKhach_tuChoiKhiKhongPhaiKhachHang() {
        ChuTheNguoiDung leTan = new ChuTheNguoiDung(
                1L,
                "lt",
                "lt@test.vn",
                "x",
                "HOAT_DONG",
                List.of(new SimpleGrantedAuthority(MaVaiTro.LE_TAN)));
        assertThatThrownBy(() -> chatService.tinNhanCuaKhach(leTan, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("khách hàng");
    }

    @Test
    void tinNhanCuaKhach_tuChoiKhiThieuNguoiHoTro() {
        ChuTheNguoiDung khach = new ChuTheNguoiDung(
                1L,
                "k",
                "k@test.vn",
                "x",
                "HOAT_DONG",
                List.of(new SimpleGrantedAuthority(MaVaiTro.KHACH_HANG)));
        assertThatThrownBy(() -> chatService.tinNhanCuaKhach(khach, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("hỗ trợ");
    }
}
