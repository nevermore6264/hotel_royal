package com.royallotushotel.service;

import com.royallotushotel.entity.ChiTietDatPhong;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
import com.royallotushotel.repository.HoanTienRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DichVuHoanTienTest {

    @Mock
    private ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;
    @Mock
    private HoanTienRepository hoanTienRepository;
    @InjectMocks
    private DichVuHoanTien service;

    @Test
    void tinhSoTienHoan_shouldReturnZeroWhenGiaInvalid() {
        ChiTietDatPhong chiTiet = new ChiTietDatPhong();
        chiTiet.setGia(BigDecimal.ZERO);

        assertThat(service.tinhSoTienHoan(chiTiet)).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void tinhSoTienHoan_shouldUseTyLeOnChiTiet() {
        ChiTietDatPhong chiTiet = new ChiTietDatPhong();
        chiTiet.setGia(BigDecimal.valueOf(1000000));
        chiTiet.setTyLeHoanTienApDung(BigDecimal.valueOf(50));
        DatPhong datPhong = new DatPhong();
        datPhong.setNgayNhanPhong(LocalDate.now().plusDays(1));
        chiTiet.setDatPhong(datPhong);

        assertThat(service.tinhSoTienHoan(chiTiet)).isEqualByComparingTo(BigDecimal.valueOf(500000.00));
    }

    @Test
    void apDungHoanChiTiet_shouldSaveWhenPositive() {
        ChiTietDatPhong chiTiet = new ChiTietDatPhong();
        chiTiet.setGia(BigDecimal.valueOf(1000000));
        chiTiet.setTyLeHoanTienApDung(BigDecimal.valueOf(50));
        DatPhong datPhong = new DatPhong();
        datPhong.setNgayNhanPhong(LocalDate.now().plusDays(1));
        chiTiet.setDatPhong(datPhong);

        BigDecimal result = service.apDungHoanChiTiet(datPhong, chiTiet, "ly do");

        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(500000.00));
        verify(hoanTienRepository).save(any());
    }
}
