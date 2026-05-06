package com.royallotushotel.service;

import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.NhatKyHeThong;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.NhatKyHeThongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NhatKyHeThongServiceTest {

    @Mock
    private NhatKyHeThongRepository nhatKyHeThongRepository;
    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @InjectMocks
    private NhatKyHeThongService service;

    @Test
    void ghi_shouldSetUserWhenProvided() {
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setId(1L);
        when(nguoiDungRepository.findById(1L)).thenReturn(Optional.of(nguoiDung));

        service.ghi("TEST", "chi tiet", 1L);

        verify(nhatKyHeThongRepository).save(any(NhatKyHeThong.class));
    }

    @Test
    void timTatCa_shouldDelegateToTimLoc() {
        var pageable = PageRequest.of(0, 10);
        NhatKyHeThong nk = new NhatKyHeThong();
        nk.setId(1L);
        nk.setHanhDong("A");
        nk.setChiTiet("B");
        nk.setThoiDiem(LocalDateTime.now());
        when(nhatKyHeThongRepository.timLoc(eq(null), eq(null), eq(null), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(nk)));

        var result = service.timTatCa(pageable);

        assertThat(result.getContent()).hasSize(1);
    }
}
