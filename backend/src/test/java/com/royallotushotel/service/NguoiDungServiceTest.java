package com.royallotushotel.service;

import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.VaiTroRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NguoiDungServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private KhachHangRepository khachHangRepository;
    @Mock
    private VaiTroRepository vaiTroRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private NguoiDungService nguoiDungService;

    @Test
    void timTatCa_rong() {
        when(nguoiDungRepository.findAll()).thenReturn(List.of());
        assertThat(nguoiDungService.timTatCa()).isEmpty();
    }

    @Test
    void layTheoId_tuChoiKhiKhongTonTai() {
        when(nguoiDungRepository.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> nguoiDungService.layTheoId(404L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy");
    }
}
