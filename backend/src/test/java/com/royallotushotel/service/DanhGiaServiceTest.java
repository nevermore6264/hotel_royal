package com.royallotushotel.service;

import com.royallotushotel.repository.DanhGiaRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
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

    @Test
    void listTheoLoaiPhong_rong() {
        when(danhGiaRepository.findByLoaiPhong_IdOrderByThoiDiemDesc(10L)).thenReturn(List.of());
        assertThat(danhGiaService.listTheoLoaiPhong(10L)).isEmpty();
    }
}
