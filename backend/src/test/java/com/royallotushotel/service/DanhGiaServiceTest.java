package com.royallotushotel.service;

import com.royallotushotel.dto.YeuCauTaoDanhGia;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.DanhGiaRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.NguoiDungRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DanhGiaServiceTest {

    @Mock
    private DanhGiaRepository danhGiaRepository;
    @Mock
    private LoaiPhongRepository loaiPhongRepository;
    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @InjectMocks
    private DanhGiaService danhGiaService;

    private static ChuTheNguoiDung khach(long id) {
        return new ChuTheNguoiDung(
                id,
                "k",
                "k@test.vn",
                "x",
                "HOAT_DONG",
                List.of(new SimpleGrantedAuthority(MaVaiTro.KHACH_HANG)));
    }

    @Test
    void listTheoLoaiPhong_rong() {
        when(danhGiaRepository.findByLoaiPhong_IdOrderByThoiDiemDesc(10L)).thenReturn(List.of());
        assertThat(danhGiaService.listTheoLoaiPhong(10L)).isEmpty();
    }

    @Test
    void tao_tuChoiKhiDiemNgoaiKhoang() {
        YeuCauTaoDanhGia y = new YeuCauTaoDanhGia();
        y.setIdLoaiPhong(1L);
        y.setDiem(6);
        assertThatThrownBy(() -> danhGiaService.tao(khach(5L), y))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("1 đến 5");
    }

    @Test
    void tao_tuChoiKhiThieuDuLieu() {
        YeuCauTaoDanhGia y = new YeuCauTaoDanhGia();
        y.setDiem(5);
        assertThatThrownBy(() -> danhGiaService.tao(khach(5L), y))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Thiếu");
    }
}
