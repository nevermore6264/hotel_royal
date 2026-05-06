package com.royallotushotel.service;

import com.royallotushotel.dto.BangGiaPhongDto;
import com.royallotushotel.entity.BangGiaPhong;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.repository.BangGiaPhongRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BangGiaPhongServiceTest {

    @Mock
    private BangGiaPhongRepository bangGiaPhongRepository;
    @Mock
    private LoaiPhongRepository loaiPhongRepository;
    @InjectMocks
    private BangGiaPhongService service;

    @Test
    void timTatCa_shouldMapData() {
        when(bangGiaPhongRepository.findAll()).thenReturn(List.of(bangGia(1L, loaiPhong(10L), BigDecimal.valueOf(900000))));

        List<BangGiaPhongDto> result = service.timTatCa();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIdLoaiPhong()).isEqualTo(10L);
    }

    @Test
    void timPhanTrang_shouldTrimQuery() {
        var pageable = PageRequest.of(0, 10);
        when(bangGiaPhongRepository.timCoPhanTrang(eq("abc"), eq(10L), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(bangGia(1L, loaiPhong(10L), BigDecimal.valueOf(900000)))));

        var page = service.timPhanTrang(pageable, " abc ", 10L);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    void tao_shouldPersist() {
        LoaiPhong loaiPhong = loaiPhong(10L);
        BangGiaPhongDto dto = dto(10L);
        when(loaiPhongRepository.findById(10L)).thenReturn(Optional.of(loaiPhong));
        when(bangGiaPhongRepository.save(any(BangGiaPhong.class))).thenAnswer(inv -> {
            BangGiaPhong value = inv.getArgument(0);
            value.setId(55L);
            return value;
        });

        var result = service.tao(dto);

        assertThat(result.getId()).isEqualTo(55L);
        assertThat(result.getIdLoaiPhong()).isEqualTo(10L);
    }

    @Test
    void tao_shouldThrowWhenLoaiPhongMissing() {
        when(loaiPhongRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.tao(dto(10L))).isInstanceOf(RuntimeException.class);
    }

    @Test
    void capNhat_shouldUpdateAndSave() {
        BangGiaPhong entity = bangGia(1L, loaiPhong(10L), BigDecimal.valueOf(900000));
        when(bangGiaPhongRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(loaiPhongRepository.findById(11L)).thenReturn(Optional.of(loaiPhong(11L)));
        when(bangGiaPhongRepository.save(any(BangGiaPhong.class))).thenAnswer(inv -> inv.getArgument(0));

        BangGiaPhongDto dto = dto(11L);
        dto.setGiaApDung(BigDecimal.valueOf(990000));
        var result = service.capNhat(1L, dto);

        assertThat(result.getGiaApDung()).isEqualTo(BigDecimal.valueOf(990000));
        assertThat(result.getIdLoaiPhong()).isEqualTo(11L);
    }

    @Test
    void xoa_shouldCallRepository() {
        service.xoa(5L);
        verify(bangGiaPhongRepository).deleteById(5L);
    }

    @Test
    void tinhGiaChoKyLuuTru_shouldUseDailyPrices() {
        LoaiPhong lp = loaiPhong(10L);
        when(bangGiaPhongRepository.timGiaApDungTheoNgay(eq(10L), any(LocalDate.class)))
                .thenReturn(List.of(bangGia(1L, lp, BigDecimal.valueOf(700000))));

        var total = service.tinhGiaChoKyLuuTru(lp, LocalDate.now(), LocalDate.now().plusDays(2));

        assertThat(total).isEqualTo(BigDecimal.valueOf(1400000));
    }

    @Test
    void layGiaTheoNgay_shouldFallbackBasePrice() {
        LoaiPhong lp = loaiPhong(10L);
        lp.setGia(BigDecimal.valueOf(1000000));
        when(bangGiaPhongRepository.timGiaApDungTheoNgay(10L, LocalDate.now())).thenReturn(List.of());

        var price = service.layGiaTheoNgay(lp, LocalDate.now());

        assertThat(price).isEqualTo(BigDecimal.valueOf(1000000));
    }

    private static BangGiaPhongDto dto(Long idLoaiPhong) {
        BangGiaPhongDto dto = new BangGiaPhongDto();
        dto.setIdLoaiPhong(idLoaiPhong);
        dto.setTenChinhSach("Le");
        dto.setNgayBatDau(LocalDate.now());
        dto.setNgayKetThuc(LocalDate.now().plusDays(1));
        dto.setGiaApDung(BigDecimal.valueOf(800000));
        dto.setKichHoat(true);
        dto.setMoTa("Mo ta");
        return dto;
    }

    private static LoaiPhong loaiPhong(Long id) {
        LoaiPhong lp = new LoaiPhong();
        lp.setId(id);
        lp.setTen("Deluxe");
        lp.setGia(BigDecimal.valueOf(1000000));
        return lp;
    }

    private static BangGiaPhong bangGia(Long id, LoaiPhong loaiPhong, BigDecimal gia) {
        BangGiaPhong bg = new BangGiaPhong();
        bg.setId(id);
        bg.setLoaiPhong(loaiPhong);
        bg.setTenChinhSach("Le");
        bg.setNgayBatDau(LocalDate.now());
        bg.setNgayKetThuc(LocalDate.now().plusDays(1));
        bg.setGiaApDung(gia);
        bg.setKichHoat(true);
        return bg;
    }
}
