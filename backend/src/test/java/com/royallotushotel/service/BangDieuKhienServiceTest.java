package com.royallotushotel.service;

import com.royallotushotel.entity.Phong;
import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BangDieuKhienServiceTest {

    @Mock
    private DatPhongRepository datPhongRepository;
    @Mock
    private PhongRepository phongRepository;
    @InjectMocks
    private BangDieuKhienService service;

    @Test
    void layThongKeThoiGianThuc_shouldMapStats() {
        when(phongRepository.count()).thenReturn(10L);
        when(phongRepository.findByTrangThai(MaTrangThaiPhong.PHONG_TRONG)).thenReturn(List.of(new Phong(), new Phong(), new Phong()));
        when(phongRepository.findByTrangThai(MaTrangThaiPhong.DANG_SU_DUNG)).thenReturn(List.of(new Phong(), new Phong()));
        when(phongRepository.countByTrangThai(MaTrangThaiPhong.DA_GIU)).thenReturn(0L);
        when(phongRepository.countByTrangThai(MaTrangThaiPhong.BAO_TRI)).thenReturn(0L);
        when(datPhongRepository.timLuuTruDangHoatDongVaoNgay(LocalDate.now())).thenReturn(List.of());
        when(datPhongRepository.tongDoanhThuTheoKhoangNgay(LocalDate.now(), LocalDate.now())).thenReturn(BigDecimal.valueOf(2000000));
        when(datPhongRepository.demDatPhongTheoKhoangNgay(LocalDate.now(), LocalDate.now())).thenReturn(3L);

        var result = service.layThongKeThoiGianThuc();

        assertThat(result.get("tongPhong")).isEqualTo(10L);
        assertThat(result.get("phongTrong")).isEqualTo(3L);
        assertThat(result.get("phongDangDung")).isEqualTo(2L);
        assertThat(result.get("donHomNay")).isEqualTo(3L);
    }

    @Test
    void layThongKeDoanhThu_shouldUseDefaultsForNull() {
        when(datPhongRepository.tongDoanhThuTheoKhoangNgay(LocalDate.now(), LocalDate.now())).thenReturn(null);
        when(datPhongRepository.demDatPhongTheoKhoangNgay(LocalDate.now(), LocalDate.now())).thenReturn(null);

        var result = service.layThongKeDoanhThu(LocalDate.now(), LocalDate.now());

        assertThat(result.get("doanhThu")).isEqualTo(BigDecimal.ZERO);
        assertThat(result.get("soDon")).isEqualTo(0);
    }
}
