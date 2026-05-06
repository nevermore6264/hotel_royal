package com.royallotushotel.security;

import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.VaiTro;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChuTheNguoiDungTest {

    @Test
    void taoTuNguoiDung() {
        VaiTro vt = VaiTro.builder().ten(MaVaiTro.KHACH_HANG).build();
        NguoiDung nd = NguoiDung.builder()
                .id(9L)
                .tenDangNhap("khach1")
                .email("k@k.com")
                .matKhau("enc")
                .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                .build();
        nd.getVaiTro().add(vt);

        ChuTheNguoiDung chuThe = ChuTheNguoiDung.tao(nd);

        assertThat(chuThe.getId()).isEqualTo(9L);
        assertThat(chuThe.getUsername()).isEqualTo("khach1");
        assertThat(chuThe.isEnabled()).isTrue();
        assertThat(chuThe.getAuthorities()).hasSize(1);
    }
}
