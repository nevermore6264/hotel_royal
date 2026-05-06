package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DatPhongDtoTest {

    @Test
    void gettersVaSetters() {
        ChiTietDatPhongDto ct = new ChiTietDatPhongDto();
        ct.setId(1L);
        ct.setSoPhong("101");

        SuDungDichVuDto dv = new SuDungDichVuDto();
        dv.setId(2L);
        dv.setTenDichVu("Giat ui");

        ThanhToanDto tt = new ThanhToanDto();
        tt.setId(3L);
        tt.setTongPhaiThu(BigDecimal.valueOf(1000000));

        DatPhongDto dto = new DatPhongDto();
        dto.setId(100L);
        dto.setIdKhachHang(5L);
        dto.setTenKhachHang("A");
        dto.setTenKhach("A");
        dto.setSdtKhach("0123");
        dto.setEmailKhach("a@b.com");
        dto.setNgayNhanPhong(LocalDate.of(2026, 5, 1));
        dto.setNgayTraPhong(LocalDate.of(2026, 5, 3));
        dto.setTrangThai("DA_XAC_NHAN");
        dto.setTienPhong(BigDecimal.valueOf(800000));
        dto.setTienDichVu(BigDecimal.valueOf(100000));
        dto.setTienHoan(BigDecimal.ZERO);
        dto.setTongTien(BigDecimal.valueOf(900000));
        dto.setThoiGianTao(LocalDateTime.of(2026, 5, 1, 10, 0));
        dto.setSoGioHuyApDung(24);
        dto.setTyLeHoanTienApDung(BigDecimal.valueOf(50));
        dto.setChiTiet(List.of(ct));
        dto.setSuDungDichVu(List.of(dv));
        dto.setThanhToan(tt);

        assertThat(dto.getId()).isEqualTo(100L);
        assertThat(dto.getChiTiet()).hasSize(1);
        assertThat(dto.getChiTiet().get(0).getSoPhong()).isEqualTo("101");
        assertThat(dto.getSuDungDichVu()).hasSize(1);
        assertThat(dto.getThanhToan().getId()).isEqualTo(3L);
    }
}
