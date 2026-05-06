package com.royallotushotel.service;

import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.DichVuRepository;
import com.royallotushotel.repository.SuDungDichVuRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuanLyDichVuServiceTest {

    @Mock
    private DichVuRepository dichVuRepository;
    @Mock
    private DatPhongRepository datPhongRepository;
    @Mock
    private DatPhongService datPhongService;
    @Mock
    private SuDungDichVuRepository suDungDichVuRepository;
    @InjectMocks
    private QuanLyDichVuService quanLyDichVuService;

    @Test
    void timTatCa_rong() {
        when(dichVuRepository.findAll()).thenReturn(List.of());
        assertThat(quanLyDichVuService.timTatCa()).isEmpty();
    }
}
