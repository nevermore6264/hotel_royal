package com.royallotushotel.service;

import com.royallotushotel.dto.BangGiaPhongDto;
import com.royallotushotel.entity.BangGiaPhong;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.repository.BangGiaPhongRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BangGiaPhongService {

    private final BangGiaPhongRepository bangGiaPhongRepository;
    private final LoaiPhongRepository loaiPhongRepository;

    @Transactional(readOnly = true)
    public List<BangGiaPhongDto> timTatCa() {
        return bangGiaPhongRepository.findAll().stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BangGiaPhongDto> timPhanTrang(Pageable phanTrang, String q, Long idLoaiPhong) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return bangGiaPhongRepository.timCoPhanTrang(qq, idLoaiPhong, phanTrang).map(this::sangDto);
    }

    @Transactional
    public BangGiaPhongDto tao(BangGiaPhongDto dto) {
        LoaiPhong loaiPhong = loaiPhongRepository.findById(dto.getIdLoaiPhong())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));
        BangGiaPhong bangGia = BangGiaPhong.builder()
                .loaiPhong(loaiPhong)
                .tenChinhSach(dto.getTenChinhSach())
                .ngayBatDau(dto.getNgayBatDau())
                .ngayKetThuc(dto.getNgayKetThuc())
                .giaApDung(dto.getGiaApDung())
                .kichHoat(dto.getKichHoat() != null ? dto.getKichHoat() : true)
                .moTa(dto.getMoTa())
                .build();
        return sangDto(bangGiaPhongRepository.save(bangGia));
    }

    @Transactional
    public BangGiaPhongDto capNhat(Long id, BangGiaPhongDto dto) {
        BangGiaPhong bangGia = bangGiaPhongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng giá"));
        if (dto.getIdLoaiPhong() != null) {
            LoaiPhong loaiPhong = loaiPhongRepository.findById(dto.getIdLoaiPhong())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));
            bangGia.setLoaiPhong(loaiPhong);
        }
        bangGia.setTenChinhSach(dto.getTenChinhSach());
        bangGia.setNgayBatDau(dto.getNgayBatDau());
        bangGia.setNgayKetThuc(dto.getNgayKetThuc());
        bangGia.setGiaApDung(dto.getGiaApDung());
        bangGia.setKichHoat(dto.getKichHoat() != null ? dto.getKichHoat() : true);
        bangGia.setMoTa(dto.getMoTa());
        return sangDto(bangGiaPhongRepository.save(bangGia));
    }

    @Transactional
    public void xoa(Long id) {
        bangGiaPhongRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public BigDecimal tinhGiaChoKyLuuTru(LoaiPhong loaiPhong, LocalDate ngayNhanPhong, LocalDate ngayTraPhong) {
        if (ngayNhanPhong == null || ngayTraPhong == null || !ngayTraPhong.isAfter(ngayNhanPhong)) {
            return loaiPhong.getGia();
        }
        BigDecimal tong = BigDecimal.ZERO;
        long soDem = ChronoUnit.DAYS.between(ngayNhanPhong, ngayTraPhong);
        for (int i = 0; i < soDem; i++) {
            LocalDate ngay = ngayNhanPhong.plusDays(i);
            tong = tong.add(layGiaTheoNgay(loaiPhong, ngay));
        }
        return tong;
    }

    @Transactional(readOnly = true)
    public BigDecimal layGiaTheoNgay(LoaiPhong loaiPhong, LocalDate ngay) {
        return bangGiaPhongRepository.timGiaApDungTheoNgay(loaiPhong.getId(), ngay).stream()
                .findFirst()
                .map(BangGiaPhong::getGiaApDung)
                .orElse(loaiPhong.getGia());
    }

    private BangGiaPhongDto sangDto(BangGiaPhong bangGia) {
        BangGiaPhongDto dto = new BangGiaPhongDto();
        dto.setId(bangGia.getId());
        dto.setIdLoaiPhong(bangGia.getLoaiPhong().getId());
        dto.setTenLoaiPhong(bangGia.getLoaiPhong().getTen());
        dto.setTenChinhSach(bangGia.getTenChinhSach());
        dto.setNgayBatDau(bangGia.getNgayBatDau());
        dto.setNgayKetThuc(bangGia.getNgayKetThuc());
        dto.setGiaApDung(bangGia.getGiaApDung());
        dto.setKichHoat(bangGia.getKichHoat());
        dto.setMoTa(bangGia.getMoTa());
        return dto;
    }
}
