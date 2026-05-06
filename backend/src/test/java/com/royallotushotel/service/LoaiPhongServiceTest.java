package com.royallotushotel.service;

import com.royallotushotel.dto.LoaiPhongDto;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.repository.LoaiPhongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoaiPhongServiceTest {

    @Mock
    private LoaiPhongRepository repository;
    @InjectMocks
    private LoaiPhongService service;

    @Test
    void timTatCa_shouldReturnDtos() {
        when(repository.findAll()).thenReturn(List.of(entity(1L)));
        assertThat(service.timTatCa()).hasSize(1);
    }

    @Test
    void timPhanTrang_shouldTrimKeyword() {
        var pageable = PageRequest.of(0, 10);
        when(repository.timCoPhanTrang(eq("abc"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(entity(1L))));
        assertThat(service.timPhanTrang(pageable, " abc ").getContent()).hasSize(1);
    }

    @Test
    void layTheoId_shouldThrowWhenNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.layTheoId(1L)).isInstanceOf(RuntimeException.class);
    }

    @Test
    void tao_shouldSave() {
        when(repository.save(any(LoaiPhong.class))).thenAnswer(inv -> {
            LoaiPhong value = inv.getArgument(0);
            value.setId(100L);
            return value;
        });
        var result = service.tao(dto());
        assertThat(result.getId()).isEqualTo(100L);
    }

    @Test
    void xoa_shouldDelete() {
        service.xoa(2L);
        verify(repository).deleteById(2L);
    }

    private static LoaiPhong entity(Long id) {
        LoaiPhong lp = new LoaiPhong();
        lp.setId(id);
        lp.setTen("Deluxe");
        lp.setGia(BigDecimal.valueOf(1000000));
        lp.setSucChuaToiDa(2);
        return lp;
    }

    private static LoaiPhongDto dto() {
        LoaiPhongDto dto = new LoaiPhongDto();
        dto.setTen("Deluxe");
        dto.setGia(BigDecimal.valueOf(1000000));
        dto.setMoTa("Mo ta");
        dto.setSucChuaToiDa(2);
        return dto;
    }
}
