package com.royallotushotel.service;

import com.royallotushotel.dto.PhongDto;
import com.royallotushotel.dto.YeuCauTimPhong;
import com.royallotushotel.entity.ChiTietDatPhong;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.entity.Phong;
import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.hangso.MaTrangThaiVeSinh;
import com.royallotushotel.repository.LichSuTrangThaiPhongRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

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

    private LoaiPhong loaiPhong;
    private Phong phongCoLoai;

    @BeforeEach
    void setUp() {
        loaiPhong = new LoaiPhong();
        loaiPhong.setId(10L);
        loaiPhong.setTen("Deluxe");
        loaiPhong.setGia(BigDecimal.valueOf(800000));
        phongCoLoai = new Phong();
        phongCoLoai.setId(1L);
        phongCoLoai.setSoPhong("101");
        phongCoLoai.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        phongCoLoai.setLoaiPhong(loaiPhong);
        phongCoLoai.setAnh(new ArrayList<>());
        phongCoLoai.setChiTietDatPhong(new ArrayList<>());
    }

    @Test
    void timTatCa_rong() {
        when(phongRepository.findAll()).thenReturn(List.of());
        assertThat(phongService.timTatCa()).isEmpty();
    }

    @Test
    void timTatCa_coBanGhi() {
        when(phongRepository.findAll()).thenReturn(List.of(phongCoLoai));
        List<PhongDto> rs = phongService.timTatCa();
        assertThat(rs).hasSize(1);
        assertThat(rs.get(0).getSoPhong()).isEqualTo("101");
        assertThat(rs.get(0).getGiaChoKyLuuTru()).isEqualByComparingTo(loaiPhong.getGia());
    }

    @Test
    void timPhanTrang_trimThamSo() {
        Pageable pg = PageRequest.of(0, 5);
        when(phongRepository.timCoPhanTrang(eq("q"), eq("TT"), eq(3L), eq(pg)))
                .thenReturn(new PageImpl<>(List.of(phongCoLoai)));
        var page = phongService.timPhanTrang(pg, "  q  ", "TT", 3L);
        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    void timPhanTrang_qVaTrangThaiRongThanhNull() {
        Pageable pg = PageRequest.of(0, 5);
        when(phongRepository.timCoPhanTrang(isNull(), isNull(), isNull(), eq(pg)))
                .thenReturn(new PageImpl<>(List.of()));
        assertThat(phongService.timPhanTrang(pg, " ", "", null).getContent()).isEmpty();
    }

    @Test
    void timPhongTrong_khongNgay_locTheoLoai() {
        YeuCauTimPhong y = new YeuCauTimPhong();
        y.setIdLoaiPhong(10L);
        Phong p2 = new Phong();
        p2.setId(2L);
        p2.setLoaiPhong(loaiPhong);
        p2.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        p2.setSoPhong("102");
        p2.setAnh(new ArrayList<>());
        p2.setChiTietDatPhong(new ArrayList<>());
        LoaiPhong khac = new LoaiPhong();
        khac.setId(99L);
        Phong p3 = new Phong();
        p3.setLoaiPhong(khac);
        p3.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        p3.setSoPhong("103");
        p3.setAnh(new ArrayList<>());
        p3.setChiTietDatPhong(new ArrayList<>());
        when(phongRepository.findByTrangThai(MaTrangThaiPhong.PHONG_TRONG)).thenReturn(List.of(phongCoLoai, p2, p3));
        List<PhongDto> rs = phongService.timPhongTrong(y);
        assertThat(rs).hasSize(2);
    }

    @Test
    void timPhongTrong_khongNgay_khongLocLoai() {
        when(phongRepository.findByTrangThai(MaTrangThaiPhong.PHONG_TRONG)).thenReturn(List.of(phongCoLoai));
        YeuCauTimPhong y = new YeuCauTimPhong();
        assertThat(phongService.timPhongTrong(y)).hasSize(1);
    }

    @Test
    void timPhongTrong_ngayKhongHopLe_traVeRong() {
        YeuCauTimPhong y = new YeuCauTimPhong();
        y.setNgayNhanPhong(LocalDate.of(2026, 6, 5));
        y.setNgayTraPhong(LocalDate.of(2026, 6, 5));
        assertThat(phongService.timPhongTrong(y)).isEmpty();
    }

    @Test
    void timPhongTrong_coNgay_goiTimPhongTrongVaGiaKy() {
        YeuCauTimPhong y = new YeuCauTimPhong();
        y.setNgayNhanPhong(LocalDate.of(2026, 6, 1));
        y.setNgayTraPhong(LocalDate.of(2026, 6, 4));
        y.setIdLoaiPhong(10L);
        when(phongRepository.timPhongTrong(y.getNgayNhanPhong(), y.getNgayTraPhong())).thenReturn(List.of(phongCoLoai));
        when(bangGiaPhongService.tinhGiaChoKyLuuTru(eq(loaiPhong), eq(y.getNgayNhanPhong()), eq(y.getNgayTraPhong())))
                .thenReturn(BigDecimal.valueOf(2400000));
        List<PhongDto> rs = phongService.timPhongTrong(y);
        assertThat(rs.get(0).getGiaChoKyLuuTru()).isEqualByComparingTo(BigDecimal.valueOf(2400000));
    }

    @Test
    void layTheoId_thanhCong_vaSangDtoChiTietDatPhong() {
        ChiTietDatPhong ct = new ChiTietDatPhong();
        DatPhong dp1 = new DatPhong();
        dp1.setId(5L);
        ct.setDatPhong(dp1);
        phongCoLoai.getChiTietDatPhong().add(ct);
        DatPhong dp2 = new DatPhong();
        dp2.setId(7L);
        ChiTietDatPhong ct2 = new ChiTietDatPhong();
        ct2.setDatPhong(dp2);
        phongCoLoai.getChiTietDatPhong().add(ct2);
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        PhongDto dto = phongService.layTheoId(1L);
        assertThat(dto.getIdDatPhong()).isEqualTo(7L);
    }

    @Test
    void layTheoId_khongThay() {
        when(phongRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> phongService.layTheoId(1L)).isInstanceOf(RuntimeException.class);
    }

    @Test
    void tao_soPhongTrung() {
        when(phongRepository.existsBySoPhong("101")).thenReturn(true);
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setIdLoaiPhong(10L);
        assertThatThrownBy(() -> phongService.tao(dto)).hasMessageContaining("tồn tại");
    }

    @Test
    void tao_loaiPhongKhongTonTai() {
        when(phongRepository.existsBySoPhong("201")).thenReturn(false);
        when(loaiPhongRepository.findById(10L)).thenReturn(Optional.empty());
        PhongDto dto = new PhongDto();
        dto.setSoPhong("201");
        dto.setIdLoaiPhong(10L);
        assertThatThrownBy(() -> phongService.tao(dto)).hasMessageContaining("loại phòng");
    }

    @Test
    void tao_thanhCong_macDinhTrangThaiVaVeSinh_dongBoAnh() {
        when(phongRepository.existsBySoPhong("301")).thenReturn(false);
        when(loaiPhongRepository.findById(10L)).thenReturn(Optional.of(loaiPhong));
        AtomicReference<Phong> ref = new AtomicReference<>();
        when(phongRepository.save(any(Phong.class))).thenAnswer(inv -> {
            Phong p = inv.getArgument(0);
            if (p.getId() == null) {
                p.setId(55L);
            }
            ref.set(p);
            return p;
        });
        when(phongRepository.findById(55L)).thenAnswer(inv -> Optional.ofNullable(ref.get()));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("301");
        dto.setIdLoaiPhong(10L);
        dto.setDuongDanAnh(List.of(" /a ", "", " /b "));
        PhongDto rs = phongService.tao(dto);
        assertThat(rs.getId()).isEqualTo(55L);
        assertThat(ref.get().getAnh()).hasSize(2);
    }

    @Test
    void capNhat_doiTrangThai_ghiLichSu() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setTrangThai(MaTrangThaiPhong.DANG_SU_DUNG);
        dto.setTrangThaiVeSinh(MaTrangThaiVeSinh.CAN_DON);
        dto.setGhiChuVeSinh("note");
        phongService.capNhat(1L, dto);
        verify(lichSuTrangThaiPhongRepository).save(any());
    }

    @Test
    void capNhat_khongDoiTrangThai_khongLichSu() {
        phongCoLoai.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        phongService.capNhat(1L, dto);
        verify(lichSuTrangThaiPhongRepository, never()).save(any());
    }

    @Test
    void capNhat_idLoaiPhongNull_boQuaLoai() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        dto.setIdLoaiPhong(null);
        phongService.capNhat(1L, dto);
        verify(loaiPhongRepository, never()).findById(any());
    }

    @Test
    void capNhat_trangThaiVeSinhNull_khongGhiDe() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        dto.setTrangThaiVeSinh(null);
        phongService.capNhat(1L, dto);
    }

    @Test
    void capNhat_ghiChuVeSinhNull_khongSet() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        PhongDto dto = new PhongDto();
        dto.setSoPhong("101");
        dto.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        dto.setGhiChuVeSinh(null);
        phongService.capNhat(1L, dto);
    }

    @Test
    void capNhatTrangThai() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        phongService.capNhatTrangThai(1L, MaTrangThaiPhong.DA_GIU);
        verify(lichSuTrangThaiPhongRepository).save(any());
    }

    @Test
    void xoa() {
        phongService.xoa(9L);
        verify(phongRepository).deleteById(9L);
    }

    @Test
    void timPhongCanDon() {
        when(phongRepository.findByTrangThaiVeSinhIn(List.of(MaTrangThaiVeSinh.CAN_DON, MaTrangThaiVeSinh.BAN)))
                .thenReturn(List.of(phongCoLoai));
        assertThat(phongService.timPhongCanDon()).hasSize(1);
    }

    @Test
    void capNhatVeSinh_ghiChuNull() {
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        phongService.capNhatVeSinh(1L, MaTrangThaiVeSinh.SACH, null);
        verify(phongRepository).save(any(Phong.class));
    }

    @Test
    void capNhatVeSinh_sachVaPhongTrong() {
        phongCoLoai.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        when(phongRepository.findById(1L)).thenReturn(Optional.of(phongCoLoai));
        when(phongRepository.save(any(Phong.class))).thenAnswer(i -> i.getArgument(0));
        phongService.capNhatVeSinh(1L, MaTrangThaiVeSinh.SACH, "x");
        verify(phongRepository).save(any(Phong.class));
    }
}
