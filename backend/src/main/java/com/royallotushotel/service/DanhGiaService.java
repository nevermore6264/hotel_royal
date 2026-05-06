package com.royallotushotel.service;

import com.royallotushotel.dto.DanhGiaDto;
import com.royallotushotel.dto.YeuCauTaoDanhGia;
import com.royallotushotel.entity.DanhGia;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.repository.DanhGiaRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.security.ChuTheNguoiDung;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final LoaiPhongRepository loaiPhongRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Transactional(readOnly = true)
    public List<DanhGiaDto> listTheoLoaiPhong(Long idLoaiPhong) {
        return danhGiaRepository.findByLoaiPhong_IdOrderByThoiDiemDesc(idLoaiPhong).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DanhGiaDto tao(ChuTheNguoiDung chuThe, YeuCauTaoDanhGia yeuCau) {
        if (yeuCau.getIdLoaiPhong() == null || yeuCau.getDiem() == null)
            throw new RuntimeException("Thiếu dữ liệu đánh giá");
        int diem = yeuCau.getDiem();
        if (diem < 1 || diem > 5) throw new RuntimeException("Điểm từ 1 đến 5");
        if (danhGiaRepository.existsByLoaiPhong_IdAndNguoiDung_Id(yeuCau.getIdLoaiPhong(), chuThe.getId()))
            throw new RuntimeException("Bạn đã đánh giá loại phòng này");
        LoaiPhong lp = loaiPhongRepository.findById(yeuCau.getIdLoaiPhong())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));
        NguoiDung nd = nguoiDungRepository.findById(chuThe.getId()).orElseThrow();
        DanhGia dg = DanhGia.builder()
                .loaiPhong(lp)
                .nguoiDung(nd)
                .diem(diem)
                .noiDung(yeuCau.getNoiDung() != null ? yeuCau.getNoiDung().trim() : "")
                .thoiDiem(LocalDateTime.now())
                .build();
        dg = danhGiaRepository.save(dg);
        return sangDto(dg);
    }

    private DanhGiaDto sangDto(DanhGia dg) {
        String hoTen = dg.getNguoiDung().getHoTen();
        String tdn = dg.getNguoiDung().getTenDangNhap();
        String tenHienThi = (hoTen != null && !hoTen.isBlank())
                ? hoTen.charAt(0) + "***"
                : (tdn != null && !tdn.isBlank()
                        ? tdn.charAt(0) + "***"
                        : "Khach");
        return DanhGiaDto.builder()
                .id(dg.getId())
                .idLoaiPhong(dg.getLoaiPhong().getId())
                .diem(dg.getDiem())
                .noiDung(dg.getNoiDung())
                .thoiDiem(dg.getThoiDiem())
                .tenHienThi(tenHienThi)
                .build();
    }
}
