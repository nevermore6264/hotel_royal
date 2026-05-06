package com.royallotushotel.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.ThanhToan;
import com.royallotushotel.hangso.MaTrangThaiThanhToan;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.ThanhToanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThanhToanServiceTest {

    @Mock
    private DatPhongRepository datPhongRepository;
    @Mock
    private ThanhToanRepository thanhToanRepository;
    @Mock
    private DatPhongService datPhongService;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private ObjectMapper objectMapper;
    @InjectMocks
    private ThanhToanService thanhToanService;

    @Test
    void xacNhanThanhToan_boQuaKhiDaThanhToan() {
        Long id = 1L;
        DatPhong dp = new DatPhong();
        ThanhToan tt = ThanhToan.builder()
                .datPhong(dp)
                .tongPhaiThu(BigDecimal.ONE)
                .tongDaThu(BigDecimal.ONE)
                .tongHoan(BigDecimal.ZERO)
                .conPhaiThu(BigDecimal.ZERO)
                .trangThai(MaTrangThaiThanhToan.DA_THANH_TOAN)
                .build();
        when(datPhongRepository.findById(id)).thenReturn(Optional.of(dp));
        when(thanhToanRepository.findByDatPhong_Id(id)).thenReturn(Optional.of(tt));

        thanhToanService.xacNhanThanhToan(id, "TIEN_MAT", "ref");

        verify(thanhToanRepository, never()).save(any(ThanhToan.class));
    }
}
