package com.royallotushotel.service;

import com.royallotushotel.dto.ChinhSachHuyPhongDto;
import com.royallotushotel.entity.ChinhSachHuyPhong;
import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
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
class ChinhSachHuyPhongServiceTest {

    @Mock
    private ChinhSachHuyPhongRepository repository;
    @InjectMocks
    private ChinhSachHuyPhongService service;

    @Test
    void timTatCa_shouldReturnDtos() {
        when(repository.findAll()).thenReturn(List.of(entity(1L)));
        assertThat(service.timTatCa()).hasSize(1);
    }

    @Test
    void timPhanTrang_shouldTrimKeyword() {
        var pageable = PageRequest.of(0, 10);
        when(repository.timCoPhanTrang(eq("abc"), eq(true), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(entity(1L))));
        assertThat(service.timPhanTrang(pageable, " abc ", true).getContent()).hasSize(1);
    }

    @Test
    void tao_shouldSave() {
        when(repository.save(any(ChinhSachHuyPhong.class))).thenAnswer(inv -> {
            ChinhSachHuyPhong value = inv.getArgument(0);
            value.setId(8L);
            return value;
        });
        var dto = dto();
        var result = service.tao(dto);
        assertThat(result.getId()).isEqualTo(8L);
    }

    @Test
    void capNhat_shouldThrowWhenMissing() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.capNhat(1L, dto())).isInstanceOf(RuntimeException.class);
    }

    @Test
    void xoa_shouldDeleteById() {
        service.xoa(2L);
        verify(repository).deleteById(2L);
    }

    private static ChinhSachHuyPhongDto dto() {
        ChinhSachHuyPhongDto dto = new ChinhSachHuyPhongDto();
        dto.setSoGioTruocNhanPhong(24);
        dto.setTyLeHoanTien(BigDecimal.valueOf(60));
        dto.setConHieuLuc(true);
        dto.setMoTa("test");
        return dto;
    }

    private static ChinhSachHuyPhong entity(Long id) {
        ChinhSachHuyPhong cs = new ChinhSachHuyPhong();
        cs.setId(id);
        cs.setSoGioTruocNhanPhong(24);
        cs.setTyLeHoanTien(BigDecimal.valueOf(50));
        cs.setConHieuLuc(true);
        return cs;
    }
}
