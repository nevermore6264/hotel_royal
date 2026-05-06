package com.royallotushotel.config;

import com.royallotushotel.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class KhoiTaoDuLieuTest {

    @Test
    void taoInstance() {
        assertThat(new KhoiTaoDuLieu(
                mock(VaiTroRepository.class),
                mock(NguoiDungRepository.class),
                mock(KhachHangRepository.class),
                mock(PasswordEncoder.class),
                mock(DichVuRepository.class),
                mock(LoaiPhongRepository.class),
                mock(PhongRepository.class),
                mock(ChinhSachHuyPhongRepository.class),
                mock(BangGiaPhongRepository.class)
        )).isNotNull();
    }
}
