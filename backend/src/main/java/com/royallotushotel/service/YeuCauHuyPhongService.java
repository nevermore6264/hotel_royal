package com.royallotushotel.service;

import com.royallotushotel.dto.*;
import com.royallotushotel.entity.*;
import com.royallotushotel.hangso.MaTrangThaiChiTietDatPhong;
import com.royallotushotel.hangso.MaTrangThaiYeuCauHuy;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.YeuCauHuyPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class YeuCauHuyPhongService {

    private static final List<String> TRANG_THAI_DANG_CHO = List.of(
            MaTrangThaiYeuCauHuy.CHO_DUYET,
            MaTrangThaiYeuCauHuy.DA_DUYET);

    private final YeuCauHuyPhongRepository yeuCauHuyPhongRepository;
    private final DatPhongRepository datPhongRepository;
    private final DatPhongService datPhongService;
    private final DichVuHoanTien dichVuHoanTien;

    @Transactional(readOnly = true)
    public DanhGiaHuyDto danhGia(Long idDatPhong, Long idChiTiet, Long idNguoiDung) {
        DatPhong dp = layDon(idDatPhong);
        datPhongService.kiemTraQuyenChuDonCongKhai(dp, idNguoiDung);

        if (idChiTiet != null) {
            ChiTietDatPhong ct = timChiTiet(dp, idChiTiet);
            if (!coTheHuy(ct)) {
                return DanhGiaHuyDto.builder()
                        .idDatPhong(idDatPhong)
                        .idChiTiet(idChiTiet)
                        .coTheYeuCau(false)
                        .lyDoKhongThe("Phòng này không ở trạng thái cho phép hủy.")
                        .build();
            }
            DanhGiaHuyDto.DanhGiaHuyPhongDto phong = dichVuHoanTien.danhGiaMotPhong(dp, ct);
            return DanhGiaHuyDto.builder()
                    .idDatPhong(idDatPhong)
                    .idChiTiet(idChiTiet)
                    .coTheYeuCau(true)
                    .soGioConLai(dichVuHoanTien.tinhSoGioConLai(dp.getNgayNhanPhong()))
                    .tyLeHoan(phong.getTyLeHoan())
                    .soTienHoanDuKien(phong.getSoTienHoan())
                    .moTaChinhSach(phong.getMoTaChinhSach())
                    .tungPhong(List.of(phong))
                    .build();
        }

        List<DanhGiaHuyDto.DanhGiaHuyPhongDto> ds = new ArrayList<>();
        BigDecimal tongHoan = BigDecimal.ZERO;
        BigDecimal tyLeChung = BigDecimal.ZERO;
        String moTa = null;
        boolean coPhong = false;
        for (ChiTietDatPhong ct : dp.getChiTiet()) {
            if (!coTheHuy(ct)) {
                continue;
            }
            coPhong = true;
            DanhGiaHuyDto.DanhGiaHuyPhongDto phong = dichVuHoanTien.danhGiaMotPhong(dp, ct);
            ds.add(phong);
            tongHoan = tongHoan.add(phong.getSoTienHoan() != null ? phong.getSoTienHoan() : BigDecimal.ZERO);
            tyLeChung = phong.getTyLeHoan();
            moTa = phong.getMoTaChinhSach();
        }
        if (!coPhong) {
            return DanhGiaHuyDto.builder()
                    .idDatPhong(idDatPhong)
                    .coTheYeuCau(false)
                    .lyDoKhongThe("Không còn phòng nào có thể hủy trong đơn.")
                    .build();
        }
        return DanhGiaHuyDto.builder()
                .idDatPhong(idDatPhong)
                .coTheYeuCau(true)
                .soGioConLai(dichVuHoanTien.tinhSoGioConLai(dp.getNgayNhanPhong()))
                .tyLeHoan(tyLeChung)
                .soTienHoanDuKien(tongHoan)
                .moTaChinhSach(moTa)
                .tungPhong(ds)
                .build();
    }

    @Transactional
    public YeuCauHuyDto tao(TaoYeuCauHuyDto req, Long idNguoiDung) {
        DanhGiaHuyDto dg = danhGia(req.getIdDatPhong(), req.getIdChiTiet(), idNguoiDung);
        if (!dg.isCoTheYeuCau()) {
            throw new RuntimeException(dg.getLyDoKhongThe() != null
                    ? dg.getLyDoKhongThe()
                    : "Không thể gửi yêu cầu hủy.");
        }
        kiemTraTrungYeuCau(req.getIdDatPhong(), req.getIdChiTiet());

        DatPhong dp = layDon(req.getIdDatPhong());
        ChiTietDatPhong ct = req.getIdChiTiet() != null ? timChiTiet(dp, req.getIdChiTiet()) : null;

        YeuCauHuyPhong yc = YeuCauHuyPhong.builder()
                .datPhong(dp)
                .chiTietDatPhong(ct)
                .idKhachYeuCau(idNguoiDung)
                .lyDoKhach(req.getLyDoKhach())
                .trangThai(MaTrangThaiYeuCauHuy.CHO_DUYET)
                .soGioConLaiLucYeuCau(dg.getSoGioConLai())
                .tyLeHoanDuKien(dg.getTyLeHoan())
                .soTienHoanDuKien(dg.getSoTienHoanDuKien())
                .moTaChinhSach(dg.getMoTaChinhSach())
                .build();
        return sangDto(yeuCauHuyPhongRepository.save(yc));
    }

    @Transactional(readOnly = true)
    public List<YeuCauHuyDto> danhSachChoDuyet() {
        return yeuCauHuyPhongRepository.timTheoTrangThai(MaTrangThaiYeuCauHuy.CHO_DUYET).stream()
                .map(this::sangDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<YeuCauHuyDto> danhSachChoHoan() {
        return yeuCauHuyPhongRepository.timTheoTrangThai(MaTrangThaiYeuCauHuy.DA_DUYET).stream()
                .map(this::sangDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<YeuCauHuyDto> danhSachTheoDon(Long idDatPhong, Long idNguoiDung) {
        DatPhong dp = layDon(idDatPhong);
        datPhongService.kiemTraQuyenChuDonCongKhai(dp, idNguoiDung);
        return yeuCauHuyPhongRepository.timTheoDatPhong(idDatPhong).stream()
                .map(this::sangDto)
                .toList();
    }

    @Transactional
    public YeuCauHuyDto duyet(Long id, Long idAdmin, XuLyYeuCauHuyDto body) {
        YeuCauHuyPhong yc = layYeuCau(id);
        if (!MaTrangThaiYeuCauHuy.CHO_DUYET.equals(yc.getTrangThai())) {
            throw new RuntimeException("Yêu cầu không ở trạng thái chờ duyệt.");
        }
        DatPhong dp = yc.getDatPhong();
        String lyDo = yc.getLyDoKhach() != null ? yc.getLyDoKhach() : "Hủy theo yêu cầu khách";

        if (yc.getChiTietDatPhong() != null) {
            datPhongService.huyChiTietChoDuyet(
                    dp,
                    yc.getChiTietDatPhong(),
                    lyDo,
                    yc.getSoTienHoanDuKien(),
                    yc.getTyLeHoanDuKien());
        } else {
            BigDecimal tyLe = yc.getTyLeHoanDuKien() != null ? yc.getTyLeHoanDuKien() : BigDecimal.ZERO;
            for (ChiTietDatPhong ct : dp.getChiTiet()) {
                if (!coTheHuy(ct)) {
                    continue;
                }
                ct.setTyLeHoanTienApDung(tyLe);
                BigDecimal soTien = dichVuHoanTien.tinhSoTienHoan(ct);
                datPhongService.huyChiTietChoDuyet(dp, ct, lyDo, soTien, tyLe);
            }
        }
        datPhongService.capNhatTrangThaiDonSauHuyCongKhai(dp);
        datPhongRepository.save(dp);
        datPhongService.capNhatTongThanhToan(dp.getId());

        yc.setTrangThai(MaTrangThaiYeuCauHuy.DA_DUYET);
        yc.setIdNguoiDuyet(idAdmin);
        yc.setThoiDiemDuyet(LocalDateTime.now());
        if (body != null && body.getGhiChu() != null) {
            yc.setGhiChuQuanTri(body.getGhiChu());
        }
        return sangDto(yeuCauHuyPhongRepository.save(yc));
    }

    @Transactional
    public YeuCauHuyDto tuChoi(Long id, Long idAdmin, XuLyYeuCauHuyDto body) {
        YeuCauHuyPhong yc = layYeuCau(id);
        if (!MaTrangThaiYeuCauHuy.CHO_DUYET.equals(yc.getTrangThai())) {
            throw new RuntimeException("Yêu cầu không ở trạng thái chờ duyệt.");
        }
        yc.setTrangThai(MaTrangThaiYeuCauHuy.TU_CHOI);
        yc.setIdNguoiDuyet(idAdmin);
        yc.setThoiDiemDuyet(LocalDateTime.now());
        yc.setGhiChuQuanTri(body != null ? body.getGhiChu() : null);
        return sangDto(yeuCauHuyPhongRepository.save(yc));
    }

    @Transactional
    public YeuCauHuyDto thucHienHoan(Long id, Long idLeTan, XuLyYeuCauHuyDto body) {
        YeuCauHuyPhong yc = layYeuCau(id);
        if (!MaTrangThaiYeuCauHuy.DA_DUYET.equals(yc.getTrangThai())) {
            throw new RuntimeException("Yêu cầu chưa được duyệt hoặc đã hoàn tiền.");
        }
        DatPhong dp = yc.getDatPhong();
        datPhongService.capNhatTongThanhToan(dp.getId());
        BigDecimal soTien = body != null && body.getSoTienHoanThucTe() != null
                ? body.getSoTienHoanThucTe()
                : yc.getSoTienHoanDuKien();
        if (soTien == null) {
            soTien = BigDecimal.ZERO;
        }
        String lyDo = "Hoàn tiền theo yêu cầu hủy #" + yc.getId();

        if (yc.getChiTietDatPhong() != null) {
            datPhongService.ghiNhanHoanChiTiet(dp, yc.getChiTietDatPhong(), soTien, lyDo);
        } else {
            datPhongService.ghiNhanHoanDon(dp, soTien, lyDo);
        }

        yc.setTrangThai(MaTrangThaiYeuCauHuy.DA_HOAN_TIEN);
        yc.setIdNguoiHoan(idLeTan);
        yc.setThoiDiemHoan(LocalDateTime.now());
        yc.setSoTienHoanThucTe(soTien);
        if (body != null && body.getGhiChu() != null) {
            yc.setGhiChuLeTan(body.getGhiChu());
        }
        return sangDto(yeuCauHuyPhongRepository.save(yc));
    }

    private void kiemTraTrungYeuCau(Long idDatPhong, Long idChiTiet) {
        if (idChiTiet != null) {
            if (yeuCauHuyPhongRepository.existsByDatPhong_IdAndChiTietDatPhong_IdAndTrangThaiIn(
                    idDatPhong, idChiTiet, TRANG_THAI_DANG_CHO)) {
                throw new RuntimeException("Đã có yêu cầu hủy phòng này đang chờ xử lý.");
            }
        } else if (yeuCauHuyPhongRepository.existsByDatPhong_IdAndChiTietDatPhongIsNullAndTrangThaiIn(
                idDatPhong, TRANG_THAI_DANG_CHO)) {
            throw new RuntimeException("Đã có yêu cầu hủy cả đơn đang chờ xử lý.");
        }
    }

    private YeuCauHuyPhong layYeuCau(Long id) {
        return yeuCauHuyPhongRepository.timChiTietTheoId(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hủy."));
    }

    private DatPhong layDon(Long id) {
        return datPhongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
    }

    private ChiTietDatPhong timChiTiet(DatPhong dp, Long idChiTiet) {
        return dp.getChiTiet().stream()
                .filter(c -> c.getId().equals(idChiTiet))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đặt phòng"));
    }

    private boolean coTheHuy(ChiTietDatPhong chiTiet) {
        return MaTrangThaiChiTietDatPhong.DANG_GIU.equals(chiTiet.getTrangThai())
                || MaTrangThaiChiTietDatPhong.DA_XAC_NHAN.equals(chiTiet.getTrangThai());
    }

    private YeuCauHuyDto sangDto(YeuCauHuyPhong yc) {
        DatPhong dp = yc.getDatPhong();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        String tenKhach = dp.getKhachHang() != null && dp.getKhachHang().getNguoiDung() != null
                ? dp.getKhachHang().getNguoiDung().getHoTen()
                : null;
        String soPhong = null;
        if (yc.getChiTietDatPhong() != null && yc.getChiTietDatPhong().getPhong() != null) {
            soPhong = yc.getChiTietDatPhong().getPhong().getSoPhong();
        }
        return YeuCauHuyDto.builder()
                .id(yc.getId())
                .idDatPhong(dp.getId())
                .idChiTiet(yc.getChiTietDatPhong() != null ? yc.getChiTietDatPhong().getId() : null)
                .soPhong(soPhong)
                .trangThai(yc.getTrangThai())
                .lyDoKhach(yc.getLyDoKhach())
                .soGioConLaiLucYeuCau(yc.getSoGioConLaiLucYeuCau())
                .tyLeHoanDuKien(yc.getTyLeHoanDuKien())
                .soTienHoanDuKien(yc.getSoTienHoanDuKien())
                .moTaChinhSach(yc.getMoTaChinhSach())
                .ghiChuQuanTri(yc.getGhiChuQuanTri())
                .ghiChuLeTan(yc.getGhiChuLeTan())
                .soTienHoanThucTe(yc.getSoTienHoanThucTe())
                .thoiDiemYeuCau(yc.getThoiDiemYeuCau())
                .thoiDiemDuyet(yc.getThoiDiemDuyet())
                .thoiDiemHoan(yc.getThoiDiemHoan())
                .tenKhach(tenKhach)
                .ngayNhanPhong(dp.getNgayNhanPhong() != null ? dp.getNgayNhanPhong().format(fmt) : null)
                .ngayTraPhong(dp.getNgayTraPhong() != null ? dp.getNgayTraPhong().format(fmt) : null)
                .build();
    }
}
