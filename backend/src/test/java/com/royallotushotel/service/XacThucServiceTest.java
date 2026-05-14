package com.royallotushotel.service;

import com.royallotushotel.dto.YeuCauDangKy;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.VaiTroRepository;
import com.royallotushotel.security.TienIchJwt;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class XacThucServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private KhachHangRepository khachHangRepository;
    @Mock
    private VaiTroRepository vaiTroRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private TienIchJwt tienIchJwt;
    @InjectMocks
    private XacThucService xacThucService;

    @Test
    void layThongTinToi_idNull() {
        assertThat(xacThucService.layThongTinToi(null)).isEmpty();
    }

    @Test
    void dangKy_tuChoiKhiTrungTenDangNhap() {
        when(nguoiDungRepository.existsByTenDangNhap("dup")).thenReturn(true);
        YeuCauDangKy y = new YeuCauDangKy();
        y.setTenDangNhap("dup");
        y.setMatKhau("secret1");
        y.setEmail("e@test.vn");
        y.setHoTen("H");
        assertThatThrownBy(() -> xacThucService.dangKy(y))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Tên đăng nhập");
    }
}
