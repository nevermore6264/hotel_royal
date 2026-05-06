package com.royallotushotel.service;

import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.PhongRepository;
import com.royallotushotel.repository.ThanhToanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DatPhongServiceTest {

    @Mock
    private DatPhongRepository datPhongRepository;
    @Mock
    private KhachHangRepository khachHangRepository;
    @Mock
    private PhongRepository phongRepository;
    @Mock
    private ThanhToanRepository thanhToanRepository;
    @Mock
    private ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;
    @Mock
    private BangGiaPhongService bangGiaPhongService;
    @Mock
    private DichVuHoanTien dichVuHoanTien;
    @Mock
    private GuiEmailService guiEmailService;
    @InjectMocks
    private DatPhongService datPhongService;

    @Test
    void timTatCa_rong() {
        Pageable p = PageRequest.of(0, 10);
        when(datPhongRepository.timLoc(isNull(), isNull(), isNull(), isNull(), eq(p)))
                .thenReturn(new PageImpl<>(List.of()));
        assertThat(datPhongService.timTatCa(p, null, null, null, null).getContent()).isEmpty();
    }
}
