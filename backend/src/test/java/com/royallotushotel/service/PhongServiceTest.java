package com.royallotushotel.service;

import com.royallotushotel.repository.LichSuTrangThaiPhongRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PhongServiceTest {

    @Mock
    private PhongRepository phongRepository;
    @Mock
    private LoaiPhongRepository loaiPhongRepository;
    @Mock
    private LichSuTrangThaiPhongRepository lichSuTrangThaiPhongRepository;
    @Mock
    private BangGiaPhongService bangGiaPhongService;
    @InjectMocks
    private PhongService phongService;

    @Test
    void timTatCa_rong() {
        when(phongRepository.findAll()).thenReturn(List.of());
        assertThat(phongService.timTatCa()).isEmpty();
    }
}
