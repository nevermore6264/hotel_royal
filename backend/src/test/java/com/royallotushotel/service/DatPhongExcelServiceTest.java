package com.royallotushotel.service;

import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class DatPhongExcelServiceTest {

    @Mock
    private DatPhongService datPhongService;
    @Mock
    private PhongRepository phongRepository;
    @Mock
    private KhachHangRepository khachHangRepository;
    @Mock
    private LoaiPhongRepository loaiPhongRepository;
    @InjectMocks
    private DatPhongExcelService datPhongExcelService;

    @Test
    void taoMauLeTan_traVeXlsx() throws Exception {
        byte[] data = datPhongExcelService.taoMauLeTan();
        assertThat(data.length).isGreaterThan(800);
    }

    @Test
    void taoMauKhach_traVeXlsx() throws Exception {
        byte[] data = datPhongExcelService.taoMauKhach();
        assertThat(data.length).isGreaterThan(800);
    }

    @Test
    void nhapLeTan_tuChoiKhiKhongPhaiXlsx() {
        MockMultipartFile tep = new MockMultipartFile("tep", "a.csv", "text/csv", "x".getBytes());
        assertThatThrownBy(() -> datPhongExcelService.nhapLeTan(tep))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining(".xlsx");
    }

    @Test
    void nhapLeTan_tuChoiKhiTepRong() {
        MockMultipartFile tep = new MockMultipartFile("tep", "a.xlsx", "application/octet-stream", new byte[0]);
        assertThatThrownBy(() -> datPhongExcelService.nhapLeTan(tep))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("chọn file");
    }
}
