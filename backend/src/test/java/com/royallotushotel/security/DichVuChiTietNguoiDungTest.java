package com.royallotushotel.security;

import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.VaiTro;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.NguoiDungRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DichVuChiTietNguoiDungTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @InjectMocks
    private DichVuChiTietNguoiDung dichVuChiTietNguoiDung;

    @Test
    void loadUserByUsername() {
        VaiTro vt = VaiTro.builder().ten(MaVaiTro.LE_TAN).build();
        NguoiDung nd = NguoiDung.builder()
                .id(3L)
                .tenDangNhap("leTan1")
                .email("l@l.com")
                .matKhau("x")
                .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                .build();
        nd.getVaiTro().add(vt);
        when(nguoiDungRepository.findByTenDangNhap("leTan1")).thenReturn(Optional.of(nd));

        assertThat(dichVuChiTietNguoiDung.loadUserByUsername("leTan1").getUsername()).isEqualTo("leTan1");
    }
}
