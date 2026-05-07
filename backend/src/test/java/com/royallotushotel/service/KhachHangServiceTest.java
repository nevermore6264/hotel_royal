package com.royallotushotel.service;

import com.royallotushotel.dto.KhachHangDto;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.repository.KhachHangRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KhachHangServiceTest {

    @Mock
    private KhachHangRepository repository;
    @InjectMocks
    private KhachHangService service;

    @Test
    void timKiem_shouldUseFindAllWhenEmptyKeyword() {
        when(repository.findAll()).thenReturn(List.of(entity(1L)));
        assertThat(service.timKiem(" ")).hasSize(1);
    }

    @Test
    void timKiem_shouldTrimKeyword() {
        when(repository.timKiem("abc")).thenReturn(List.of(entity(1L)));
        assertThat(service.timKiem(" abc ")).hasSize(1);
    }

    @Test
    void timPhanTrang_shouldMap() {
        var pageable = PageRequest.of(0, 10);
        when(repository.timCoPhanTrang(eq("a"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(entity(1L))));
        assertThat(service.timPhanTrang(pageable, " a ").getContent()).hasSize(1);
    }

    @Test
    void layTheoId_shouldThrowWhenMissing() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.layTheoId(1L)).isInstanceOf(RuntimeException.class);
    }

    @Test
    void layTheoId_laySdtVaEmailTuTaiKhoanKhiHoSoKhachTrong() {
        NguoiDung nd = new NguoiDung();
        nd.setId(5L);
        nd.setSoDienThoai("0909111222");
        nd.setEmail("user@test.com");
        KhachHang kh = new KhachHang();
        kh.setId(1L);
        kh.setHoTen("Nguyen A");
        kh.setSoDienThoai(null);
        kh.setEmail(null);
        kh.setNguoiDung(nd);
        when(repository.findById(1L)).thenReturn(Optional.of(kh));
        KhachHangDto r = service.layTheoId(1L);
        assertThat(r.getSoDienThoai()).isEqualTo("0909111222");
        assertThat(r.getEmail()).isEqualTo("user@test.com");
        assertThat(r.getIdNguoiDung()).isEqualTo(5L);
    }

    @Test
    void tao_shouldSave() {
        when(repository.save(any(KhachHang.class))).thenAnswer(inv -> {
            KhachHang value = inv.getArgument(0);
            value.setId(99L);
            return value;
        });
        KhachHangDto dto = dto();
        var result = service.tao(dto);
        assertThat(result.getId()).isEqualTo(99L);
    }

    private static KhachHang entity(Long id) {
        KhachHang kh = new KhachHang();
        kh.setId(id);
        kh.setHoTen("Nguyen Van A");
        kh.setSoDienThoai("0123456789");
        kh.setEmail("a@test.com");
        kh.setSoCanCuoc("123456789");
        return kh;
    }

    private static KhachHangDto dto() {
        KhachHangDto dto = new KhachHangDto();
        dto.setHoTen("Nguyen Van A");
        dto.setSoDienThoai("0123456789");
        dto.setEmail("a@test.com");
        dto.setSoCanCuoc("123456789");
        return dto;
    }
}
