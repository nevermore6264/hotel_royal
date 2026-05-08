package com.royallotushotel.service;

import com.royallotushotel.dto.PhongDto;
import com.royallotushotel.dto.YeuCauTimPhong;
import com.royallotushotel.entity.AnhPhong;
import com.royallotushotel.entity.LichSuTrangThaiPhong;
import com.royallotushotel.entity.Phong;
import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.hangso.MaTrangThaiVeSinh;
import com.royallotushotel.repository.LichSuTrangThaiPhongRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhongService {

    private final PhongRepository phongRepository;
    private final LoaiPhongRepository loaiPhongRepository;
    private final LichSuTrangThaiPhongRepository lichSuTrangThaiPhongRepository;
    private final BangGiaPhongService bangGiaPhongService;

    @Transactional(readOnly = true)
    public List<PhongDto> timTatCa() {
        return phongRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PhongDto> timPhanTrang(Pageable phanTrang, String q, String trangThai, Long idLoaiPhong) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        String tt = (trangThai != null && !trangThai.isBlank()) ? trangThai : null;
        return phongRepository.timCoPhanTrang(qq, tt, idLoaiPhong, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public List<PhongDto> timPhongTrong(YeuCauTimPhong yeuCau) {
        if (yeuCau.getNgayNhanPhong() == null || yeuCau.getNgayTraPhong() == null) {
            List<Phong> phong = phongRepository.findByTrangThaiNot(MaTrangThaiPhong.BAO_TRI);
            if (yeuCau.getIdLoaiPhong() != null) {
                phong = phong.stream()
                        .filter(r -> r.getLoaiPhong().getId().equals(yeuCau.getIdLoaiPhong()))
                        .collect(Collectors.toList());
            }
            return phong.stream().map(this::sangDto).collect(Collectors.toList());
        }
        if (yeuCau.getNgayTraPhong().isBefore(yeuCau.getNgayNhanPhong())
                || yeuCau.getNgayTraPhong().isEqual(yeuCau.getNgayNhanPhong())) {
            return List.of();
        }
        List<Phong> phong = phongRepository.timPhongTrong(yeuCau.getNgayNhanPhong(), yeuCau.getNgayTraPhong());
        if (yeuCau.getIdLoaiPhong() != null) {
            phong = phong.stream().filter(r -> r.getLoaiPhong().getId().equals(yeuCau.getIdLoaiPhong())).collect(Collectors.toList());
        }
        return phong.stream()
                .map(item -> sangDto(item, yeuCau.getNgayNhanPhong(), yeuCau.getNgayTraPhong()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PhongDto layTheoId(Long id) {
        Phong p = phongRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
        return sangDto(p);
    }

    @Transactional
    public PhongDto tao(PhongDto dto) {
        if (phongRepository.existsBySoPhong(dto.getSoPhong()))
            throw new RuntimeException("Số phòng đã tồn tại");
        Phong p = new Phong();
        p.setSoPhong(dto.getSoPhong());
        p.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : MaTrangThaiPhong.PHONG_TRONG);
        p.setLoaiPhong(loaiPhongRepository.findById(dto.getIdLoaiPhong()).orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng")));
        p.setTrangThaiVeSinh(dto.getTrangThaiVeSinh() != null ? dto.getTrangThaiVeSinh() : MaTrangThaiVeSinh.SACH);
        p.setGhiChuVeSinh(dto.getGhiChuVeSinh());
        p = phongRepository.save(p);
        dongBoAnhPhong(p, dto);
        phongRepository.save(p);
        return sangDto(phongRepository.findById(p.getId()).orElseThrow());
    }

    private void dongBoAnhPhong(Phong p, PhongDto dto) {
        if (dto.getDuongDanAnh() == null) return;
        p.getAnh().clear();
        for (String url : dto.getDuongDanAnh()) {
            if (url == null || url.isBlank()) continue;
            p.getAnh().add(AnhPhong.builder().phong(p).duongDanAnh(url.trim()).build());
        }
    }

    @Transactional
    public PhongDto capNhat(Long id, PhongDto dto) {
        Phong p = phongRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
        String trangThaiCu = p.getTrangThai();
        p.setSoPhong(dto.getSoPhong());
        p.setTrangThai(dto.getTrangThai());
        if (dto.getIdLoaiPhong() != null) {
            p.setLoaiPhong(loaiPhongRepository.findById(dto.getIdLoaiPhong()).orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng")));
        }
        if (dto.getTrangThaiVeSinh() != null) {
            p.setTrangThaiVeSinh(dto.getTrangThaiVeSinh());
        }
        if (dto.getGhiChuVeSinh() != null) {
            p.setGhiChuVeSinh(dto.getGhiChuVeSinh());
        }
        p = phongRepository.save(p);
        if (dto.getTrangThai() != null && !dto.getTrangThai().equals(trangThaiCu)) {
            LichSuTrangThaiPhong his = LichSuTrangThaiPhong.builder()
                    .phong(p).trangThaiCu(trangThaiCu).trangThaiMoi(dto.getTrangThai()).build();
            lichSuTrangThaiPhongRepository.save(his);
        }
        dongBoAnhPhong(p, dto);
        phongRepository.save(p);
        return sangDto(phongRepository.findById(p.getId()).orElseThrow());
    }

    @Transactional
    public void capNhatTrangThai(Long id, String trangThai) {
        Phong p = phongRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
        String cu = p.getTrangThai();
        p.setTrangThai(trangThai);
        phongRepository.save(p);
        lichSuTrangThaiPhongRepository.save(LichSuTrangThaiPhong.builder().phong(p).trangThaiCu(cu).trangThaiMoi(trangThai).build());
    }

    @Transactional
    public void xoa(Long id) {
        phongRepository.deleteById(id);
    }

    private PhongDto sangDto(Phong p) {
        return sangDto(p, null, null);
    }

    private PhongDto sangDto(Phong p, java.time.LocalDate ngayNhanPhong, java.time.LocalDate ngayTraPhong) {
        PhongDto dto = new PhongDto();
        dto.setId(p.getId());
        dto.setSoPhong(p.getSoPhong());
        dto.setTrangThai(p.getTrangThai());
        dto.setTrangThaiVeSinh(p.getTrangThaiVeSinh());
        dto.setGhiChuVeSinh(p.getGhiChuVeSinh());
        Long idDatPhong = p.getChiTietDatPhong() == null ? null :
                p.getChiTietDatPhong().stream()
                        .map(bd -> bd.getDatPhong() != null ? bd.getDatPhong().getId() : null)
                        .filter(Objects::nonNull)
                        .max(Long::compareTo)
                        .orElse(null);
        dto.setIdDatPhong(idDatPhong);
        dto.setIdLoaiPhong(p.getLoaiPhong().getId());
        dto.setTenLoaiPhong(p.getLoaiPhong().getTen());
        dto.setGiaLoaiPhong(p.getLoaiPhong().getGia());
        dto.setGiaChoKyLuuTru(
                ngayNhanPhong != null && ngayTraPhong != null
                        ? bangGiaPhongService.tinhGiaChoKyLuuTru(p.getLoaiPhong(), ngayNhanPhong, ngayTraPhong)
                        : p.getLoaiPhong().getGia()
        );
        dto.setDuongDanAnh(p.getAnh().stream().map(com.royallotushotel.entity.AnhPhong::getDuongDanAnh).collect(Collectors.toList()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<PhongDto> timPhongCanDon() {
        return phongRepository
                .findByTrangThaiVeSinhIn(
                        List.of(
                                MaTrangThaiVeSinh.CAN_DON,
                                MaTrangThaiVeSinh.BAN,
                                MaTrangThaiVeSinh.DANG_DON))
                .stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void capNhatVeSinh(Long idPhong, String trangThaiVeSinh, String ghiChu) {
        Phong p = phongRepository.findById(idPhong).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng"));
        p.setTrangThaiVeSinh(trangThaiVeSinh);
        if (ghiChu != null) p.setGhiChuVeSinh(ghiChu);

        if (MaTrangThaiVeSinh.SACH.equals(trangThaiVeSinh) && MaTrangThaiPhong.PHONG_TRONG.equals(p.getTrangThai())) {
            p.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
        }
        phongRepository.save(p);
    }
}
