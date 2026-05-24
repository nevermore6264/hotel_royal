package com.royallotushotel.service;

import com.royallotushotel.dto.*;
import com.royallotushotel.entity.*;
import com.royallotushotel.hangso.LoaiGiaoDichThanhToan;
import com.royallotushotel.hangso.MaTrangThaiChiTietDatPhong;
import com.royallotushotel.hangso.MaTrangThaiDatPhong;
import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.hangso.MaTrangThaiThanhToan;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.hangso.MaTrangThaiVeSinh;
import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.PhongRepository;
import com.royallotushotel.repository.ThanhToanRepository;
import com.royallotushotel.security.ChuTheNguoiDung;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatPhongService {

    private static final ZoneId MUI_GIO_KHACH_SAN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DatPhongRepository datPhongRepository;
    private final KhachHangRepository khachHangRepository;
    private final PhongRepository phongRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;
    private final BangGiaPhongService bangGiaPhongService;
    private final DichVuHoanTien dichVuHoanTien;
    private final GuiEmailService guiEmailService;

    @Value("${app.dat-phong.phut-giu-cho-thanh-toan:30}")
    private int phutGiuChoThanhToan;

    @Transactional(readOnly = true)
    public Page<DatPhongDto> timTatCa(
            Pageable phanTrang, String trangThai, LocalDate tuNgay, LocalDate denNgay, String q) {
        String tt = (trangThai != null && !trangThai.isBlank()) ? trangThai : null;
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return datPhongRepository.timLoc(tt, tuNgay, denNgay, qq, phanTrang).map(this::sangDto);
    }

    @Transactional
    public DatPhongDto layTheoId(Long id, ChuTheNguoiDung chuThe) {
        huyTuDongNeuCanTheoId(id);
        DatPhong dp = datPhongRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        if (chuThe != null && chiLaKhachHang(chuThe) && !chiLaNhanVienLeTanHoacQuanTri(chuThe)) {
            Long idKhach = layIdKhachHangTheoIdNguoiDung(chuThe.getId());
            if (idKhach == null || !dp.getKhachHang().getId().equals(idKhach))
                throw new RuntimeException("Không có quyền xem đặt phòng này");
        }
        return sangDto(dp);
    }

    private boolean chiLaKhachHang(ChuTheNguoiDung chuThe) {
        return chuThe.getAuthorities().stream().anyMatch(a -> MaVaiTro.KHACH_HANG.equals(a.getAuthority()));
    }

    private boolean chiLaNhanVienLeTanHoacQuanTri(ChuTheNguoiDung chuThe) {
        return chuThe.getAuthorities().stream().anyMatch(a ->
                MaVaiTro.QUAN_TRI.equals(a.getAuthority()) || MaVaiTro.LE_TAN.equals(a.getAuthority()));
    }

    @Transactional(readOnly = true)
    public Long layIdKhachHangTheoIdNguoiDung(Long idNguoiDung) {
        return khachHangRepository.findByNguoiDung_Id(idNguoiDung).map(KhachHang::getId).orElse(null);
    }

    @Transactional
    public List<DatPhongDto> timTheoKhachHang(Long idKhachHang) {
        List<DatPhong> truoc = datPhongRepository.timLichSuTheoKhach(idKhachHang);
        for (DatPhong x : truoc) {
            huyTuDongNeuCanTheoId(x.getId());
        }
        return datPhongRepository.timLichSuTheoKhach(idKhachHang).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void huyTuDongNeuCanTheoId(Long idDatPhong) {
        if (phutGiuChoThanhToan <= 0) {
            return;
        }
        Optional<DatPhong> opt = datPhongRepository.timVaKhoaTheoId(idDatPhong);
        if (opt.isEmpty()) {
            return;
        }
        DatPhong dp = opt.get();
        if (!MaTrangThaiDatPhong.CHO_DUYET.equals(dp.getTrangThai())) {
            return;
        }
        if (dp.getThoiGianTao() == null) {
            return;
        }
        LocalDateTime hetHan = dp.getThoiGianTao().plusMinutes(phutGiuChoThanhToan);
        if (!LocalDateTime.now().isAfter(hetHan)) {
            return;
        }
        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(dp.getId()).orElse(null);
        if (tt != null && tt.getTongDaThu() != null && tt.getTongDaThu().compareTo(BigDecimal.ZERO) > 0) {
            return;
        }
        for (ChiTietDatPhong d : new ArrayList<>(dp.getChiTiet())) {
            if (coTheHuy(d)) {
                huyChiTietNoiBo(dp, d, "Tu dong huy: het han thanh toan");
            }
        }
        capNhatTrangThaiDonSauKhiHuy(dp);
        capNhatTongThanhToan(dp);
        datPhongRepository.save(dp);
    }

    @Transactional
    public DatPhongDto tao(YeuCauTaoDatPhong yeuCau) {
        KhachHang kh = khachHangRepository.findById(yeuCau.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        int soDem = tinhSoDem(yeuCau);
        List<Phong> theoLich = phongRepository.timPhongTrong(yeuCau.getNgayNhanPhong(), yeuCau.getNgayTraPhong());
        Set<Long> idPhongConTrongTheoLich = theoLich.stream().map(Phong::getId).collect(Collectors.toSet());
        List<Phong> dsPhong = new ArrayList<>();
        for (Long idPhong : yeuCau.getIdPhong()) {
            Phong p = phongRepository.findById(idPhong)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng: " + idPhong));
            if (MaTrangThaiPhong.BAO_TRI.equals(p.getTrangThai())) {
                throw new RuntimeException("Phòng đang bảo trì: " + p.getSoPhong());
            }
            if (!idPhongConTrongTheoLich.contains(idPhong)) {
                throw new RuntimeException("Phòng không còn trống trong khoảng ngày đã chọn: " + p.getSoPhong());
            }
            dsPhong.add(p);
        }

        ChinhSachHuyPhong chinhSach = timChinhSachApDung(yeuCau.getNgayNhanPhong());
        DatPhong dp = DatPhong.builder()
                .khachHang(kh)
                .ngayNhanPhong(yeuCau.getNgayNhanPhong())
                .ngayTraPhong(yeuCau.getNgayTraPhong())
                .trangThai(MaTrangThaiDatPhong.CHO_DUYET)
                .tenKhach(yeuCau.getTenKhach() != null ? yeuCau.getTenKhach() : kh.getHoTen())
                .sdtKhach(yeuCau.getSdtKhach() != null ? yeuCau.getSdtKhach() : kh.getSoDienThoai())
                .emailKhach(yeuCau.getEmailKhach() != null ? yeuCau.getEmailKhach() : kh.getEmail())
                .chinhSachHuyApDung(chinhSach)
                .soGioHuyApDung(chinhSach != null ? chinhSach.getSoGioTruocNhanPhong() : null)
                .tyLeHoanTienApDung(chinhSach != null ? chinhSach.getTyLeHoanTien() : BigDecimal.ZERO)
                .build();
        dp = datPhongRepository.save(dp);

        for (Phong p : dsPhong) {
            BigDecimal giaChoKyLuuTru = bangGiaPhongService.tinhGiaChoKyLuuTru(
                    p.getLoaiPhong(),
                    yeuCau.getNgayNhanPhong(),
                    yeuCau.getNgayTraPhong()
            );
            BigDecimal giaMoiDem = giaChoKyLuuTru.divide(BigDecimal.valueOf(soDem), 2, java.math.RoundingMode.HALF_UP);
            ChiTietDatPhong ct = ChiTietDatPhong.builder()
                    .datPhong(dp)
                    .phong(p)
                    .trangThai(MaTrangThaiChiTietDatPhong.DANG_GIU)
                    .giaGocMoiDem(giaMoiDem)
                    .soDem(soDem)
                    .gia(giaChoKyLuuTru)
                    .soTienHoan(BigDecimal.ZERO)
                    .soGioHuyApDung(dp.getSoGioHuyApDung())
                    .tyLeHoanTienApDung(dp.getTyLeHoanTienApDung())
                    .build();
            dp.getChiTiet().add(ct);
        }
        dp = datPhongRepository.save(dp);

        BigDecimal tongTien = tinhTongTien(dp);
        ThanhToan thanhToan = ThanhToan.builder()
                .datPhong(dp)
                .tongPhaiThu(tongTien)
                .tongDaThu(BigDecimal.ZERO)
                .tongHoan(BigDecimal.ZERO)
                .conPhaiThu(tongTien)
                .trangThai(MaTrangThaiThanhToan.CHUA_THANH_TOAN)
                .build();
        thanhToanRepository.save(thanhToan);

        ThongTinEmailDatPhong tinMail = thongTinEmailTuDon(dp, tongTien, false);
        if (tinMail != null) {
            guiEmailService.guiThongBaoDatPhong(tinMail);
        }

        return sangDto(datPhongRepository.findById(dp.getId()).orElseThrow());
    }

    @Transactional
    public void nhanPhong(Long idDatPhong) {
        DatPhong dp = layThucThe(idDatPhong);
        if (!MaTrangThaiDatPhong.DA_XAC_NHAN.equals(dp.getTrangThai())) {
            throw new RuntimeException("Đơn phải ở trạng thái DA_XAC_NHAN để nhận phòng");
        }
        LocalDate ngayNhanTheoDon = dp.getNgayNhanPhong();
        if (ngayNhanTheoDon != null) {
            LocalDate homNay = LocalDate.now(MUI_GIO_KHACH_SAN);
            if (homNay.isBefore(ngayNhanTheoDon)) {
                throw new RuntimeException(
                        "Chưa đến ngày nhận phòng theo đơn ("
                                + ngayNhanTheoDon.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                + "). Chỉ có thể nhận phòng từ ngày này trở đi.");
            }
        }
        dp.setTrangThai(MaTrangThaiDatPhong.DA_NHAN_PHONG);
        for (ChiTietDatPhong d : dp.getChiTiet()) {
            if (coHieuLuc(d)) {
                d.setTrangThai(MaTrangThaiChiTietDatPhong.DA_NHAN_PHONG);
                phongRepository.findById(d.getPhong().getId()).ifPresent(p -> {
                    p.setTrangThai(MaTrangThaiPhong.DANG_SU_DUNG);
                    p.setTrangThaiVeSinh(MaTrangThaiVeSinh.SACH);
                    phongRepository.save(p);
                });
            }
        }
        datPhongRepository.save(dp);
    }

    @Transactional
    public void traPhong(Long idDatPhong) {
        DatPhong dp = layThucThe(idDatPhong);
        if (!MaTrangThaiDatPhong.DA_NHAN_PHONG.equals(dp.getTrangThai())) {
            throw new RuntimeException("Đơn phải ở trạng thái DA_NHAN_PHONG để trả phòng");
        }
        capNhatTongThanhToan(dp);
        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElse(null);
        if (tt != null && tt.getConPhaiThu() != null
                && tt.getConPhaiThu().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal con = tt.getConPhaiThu().setScale(0, RoundingMode.HALF_UP);
            throw new RuntimeException(
                    "Chưa thanh toán đủ — còn phải thu "
                            + con.toPlainString()
                            + " VND. Vui lòng thu đủ (theo hệ thống thanh toán đang dùng) trước khi trả phòng tại quầy.");
        }
        dp.setTrangThai(MaTrangThaiDatPhong.DA_TRA_PHONG);
        for (ChiTietDatPhong d : dp.getChiTiet()) {
            if (coHieuLuc(d)) {
                d.setTrangThai(MaTrangThaiChiTietDatPhong.DA_TRA_PHONG);
                phongRepository.findById(d.getPhong().getId()).ifPresent(p -> {
                    p.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
                    p.setTrangThaiVeSinh(MaTrangThaiVeSinh.CAN_DON);
                    p.setGhiChuVeSinh(null);
                    phongRepository.save(p);
                });
            }
        }
        datPhongRepository.save(dp);
    }

    @Transactional
    public DatPhongDto huy(Long idDatPhong, Long idNguoiDung) {
        return huy(idDatPhong, idNguoiDung, false);
    }

    @Transactional
    public DatPhongDto huy(Long idDatPhong, Long idNguoiDung, boolean boQuaKiemTraChuDon) {
        DatPhong dp = layThucThe(idDatPhong);
        if (!boQuaKiemTraChuDon) {
            kiemTraQuyenChuDon(dp, idNguoiDung);
        }
        for (ChiTietDatPhong d : dp.getChiTiet()) {
            if (coTheHuy(d)) {
                huyChiTietNoiBo(dp, d, "Huy toan bo don");
            }
        }
        capNhatTrangThaiDonSauKhiHuy(dp);
        capNhatTongThanhToan(dp);
        return sangDto(datPhongRepository.save(dp));
    }

    @Transactional
    public DatPhongDto huyChiTiet(Long idDatPhong, Long idChiTiet, Long idNguoiDung, boolean boQuaKiemTraChuDon, String lyDo) {
        DatPhong dp = layThucThe(idDatPhong);
        if (!boQuaKiemTraChuDon) {
            kiemTraQuyenChuDon(dp, idNguoiDung);
        }
        ChiTietDatPhong chiTiet = dp.getChiTiet().stream()
                .filter(item -> item.getId().equals(idChiTiet))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đặt phòng"));
        huyChiTietNoiBo(dp, chiTiet, lyDo != null && !lyDo.isBlank() ? lyDo : "Huy tung phong");
        capNhatTrangThaiDonSauKhiHuy(dp);
        capNhatTongThanhToan(dp);
        return sangDto(datPhongRepository.save(dp));
    }

    @Transactional
    public void xacNhanDatPhong(Long idDatPhong) {
        DatPhong dp = layThucThe(idDatPhong);
        if (!MaTrangThaiDatPhong.CHO_DUYET.equals(dp.getTrangThai())) {
            return;
        }
        dp.setTrangThai(MaTrangThaiDatPhong.DA_XAC_NHAN);
        for (ChiTietDatPhong d : dp.getChiTiet()) {
            if (MaTrangThaiChiTietDatPhong.DANG_GIU.equals(d.getTrangThai())) {
                d.setTrangThai(MaTrangThaiChiTietDatPhong.DA_XAC_NHAN);
                phongRepository.findById(d.getPhong().getId()).ifPresent(p -> {
                    p.setTrangThai(MaTrangThaiPhong.DA_GIU);
                    phongRepository.save(p);
                });
            }
        }
        datPhongRepository.save(dp);
        capNhatTongThanhToan(dp);
        ThongTinEmailDatPhong tinMail = thongTinEmailTuDon(dp, tinhTongTien(dp), true);
        if (tinMail != null) {
            guiEmailService.guiThongBaoDatPhong(tinMail);
        }
    }

    @Transactional
    public void capNhatTongThanhToan(Long idDatPhong) {
        capNhatTongThanhToan(layThucThe(idDatPhong));
    }

    @Transactional(readOnly = true)
    public BigDecimal tinhTongTien(Long idDatPhong) {
        return tinhTongTien(layThucThe(idDatPhong));
    }

    private DatPhong layThucThe(Long idDatPhong) {
        return datPhongRepository.findById(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
    }

    private void capNhatTongThanhToan(DatPhong dp) {
        BigDecimal tongTien = tinhTongTien(dp);
        ThanhToan thanhToan = thanhToanRepository.findByDatPhong_Id(dp.getId())
                .orElseGet(() -> ThanhToan.builder()
                        .datPhong(dp)
                        .tongDaThu(BigDecimal.ZERO)
                        .tongHoan(BigDecimal.ZERO)
                        .build());
        thanhToan.setTongPhaiThu(tongTien);
        if (thanhToan.getTongDaThu() == null) {
            thanhToan.setTongDaThu(BigDecimal.ZERO);
        }
        thanhToan.setTongHoan(tinhTienHoan(dp));
        BigDecimal conPhaiThu = tongTien.subtract(thanhToan.getTongDaThu()).add(thanhToan.getTongHoan());
        if (conPhaiThu.compareTo(BigDecimal.ZERO) < 0) {
            conPhaiThu = BigDecimal.ZERO;
        }
        thanhToan.setConPhaiThu(conPhaiThu);
        if (thanhToan.getTongDaThu().compareTo(BigDecimal.ZERO) <= 0) {
            thanhToan.setTrangThai(MaTrangThaiThanhToan.CHUA_THANH_TOAN);
        } else if (thanhToan.getTongHoan().compareTo(BigDecimal.ZERO) > 0
                && thanhToan.getTongHoan().compareTo(thanhToan.getTongDaThu()) >= 0) {
            thanhToan.setTrangThai(MaTrangThaiThanhToan.DA_HOAN_TIEN);
        } else if (thanhToan.getTongDaThu().compareTo(tongTien) >= 0 && thanhToan.getTongHoan().compareTo(BigDecimal.ZERO) <= 0) {
            thanhToan.setTrangThai(MaTrangThaiThanhToan.DA_THANH_TOAN);
        } else if (thanhToan.getTongHoan().compareTo(BigDecimal.ZERO) > 0) {
            thanhToan.setTrangThai(MaTrangThaiThanhToan.HOAN_TIEN_MOT_PHAN);
        } else if (thanhToan.getTongDaThu().compareTo(BigDecimal.ZERO) > 0) {
            thanhToan.setTrangThai(
                    thanhToan.getTongDaThu().compareTo(tongTien) < 0
                            ? MaTrangThaiThanhToan.DAT_COC
                            : MaTrangThaiThanhToan.THANH_TOAN_MOT_PHAN
            );
        }
        thanhToanRepository.save(thanhToan);
    }

    private void huyChiTietNoiBo(DatPhong dp, ChiTietDatPhong chiTiet, String lyDo) {
        huyChiTietNoiBo(dp, chiTiet, lyDo, true);
    }

    private void huyChiTietNoiBo(DatPhong dp, ChiTietDatPhong chiTiet, String lyDo, boolean hoanNgay) {
        if (!coTheHuy(chiTiet)) {
            throw new RuntimeException("Phòng này không thể hủy");
        }
        ChinhSachHuyPhong cs = timChinhSachApDung(dp.getNgayNhanPhong());
        BigDecimal tyLe = cs != null ? cs.getTyLeHoanTien() : BigDecimal.ZERO;
        chiTiet.setTyLeHoanTienApDung(tyLe);
        BigDecimal soTienHoan = dichVuHoanTien.tinhSoTienHoan(chiTiet);
        huyChiTietChiCapNhatTrangThai(dp, chiTiet, lyDo, soTienHoan, tyLe);
        if (hoanNgay) {
            ghiNhanHoanChiTiet(dp, chiTiet, soTienHoan, lyDo);
        }
    }

    @Transactional
    public void huyChiTietChoDuyet(DatPhong dp, ChiTietDatPhong chiTiet, String lyDo, BigDecimal soTienHoan, BigDecimal tyLe) {
        if (!coTheHuy(chiTiet)) {
            throw new RuntimeException("Phòng này không thể hủy");
        }
        huyChiTietChiCapNhatTrangThai(dp, chiTiet, lyDo, soTienHoan, tyLe);
    }

    private void huyChiTietChiCapNhatTrangThai(
            DatPhong dp, ChiTietDatPhong chiTiet, String lyDo, BigDecimal soTienHoan, BigDecimal tyLe) {
        chiTiet.setTrangThai(MaTrangThaiChiTietDatPhong.DA_HUY);
        chiTiet.setSoTienHoan(soTienHoan != null ? soTienHoan : BigDecimal.ZERO);
        chiTiet.setTyLeHoanTienApDung(tyLe != null ? tyLe : BigDecimal.ZERO);
        chiTiet.setThoiDiemHuy(LocalDateTime.now());
        chiTiet.setLyDoHuy(lyDo);
        phongRepository.findById(chiTiet.getPhong().getId()).ifPresent(p -> {
            if (MaTrangThaiPhong.DA_GIU.equals(p.getTrangThai()) || MaTrangThaiPhong.PHONG_TRONG.equals(p.getTrangThai())) {
                p.setTrangThai(MaTrangThaiPhong.PHONG_TRONG);
                phongRepository.save(p);
            }
        });
    }

    @Transactional
    public void ghiNhanHoanChiTiet(DatPhong dp, ChiTietDatPhong chiTiet, BigDecimal soTienHoan, String lyDo) {
        if (soTienHoan == null || soTienHoan.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        ThanhToan tt = napThanhToan(dp);
        if (tt == null) {
            return;
        }
        tt.getGiaoDich().add(GiaoDichThanhToan.builder()
                .thanhToan(tt)
                .maGiaoDich("HT-" + dp.getId() + "-" + chiTiet.getId() + "-" + System.currentTimeMillis())
                .loaiGiaoDich(LoaiGiaoDichThanhToan.HOAN_TIEN)
                .soTien(soTienHoan)
                .trangThai(MaTrangThaiThanhToan.HOAN_TIEN_MOT_PHAN)
                .phuongThuc(tt.getPhuongThuc())
                .congThanhToan(tt.getPhuongThuc())
                .thamChieuCong("REFUND-" + chiTiet.getId())
                .ghiChu(lyDo)
                .build());
        dichVuHoanTien.luuHoanTienDon(dp, soTienHoan, lyDo);
        capNhatTongThanhToan(dp);
    }

    @Transactional
    public void ghiNhanHoanDon(DatPhong dp, BigDecimal soTienHoan, String lyDo) {
        if (soTienHoan == null || soTienHoan.compareTo(BigDecimal.ZERO) <= 0) {
            capNhatTongThanhToan(dp);
            return;
        }
        ThanhToan tt = napThanhToan(dp);
        if (tt == null) {
            capNhatTongThanhToan(dp);
            return;
        }
        tt.getGiaoDich().add(GiaoDichThanhToan.builder()
                .thanhToan(tt)
                .maGiaoDich("HT-DP-" + dp.getId() + "-" + System.currentTimeMillis())
                .loaiGiaoDich(LoaiGiaoDichThanhToan.HOAN_TIEN)
                .soTien(soTienHoan)
                .trangThai(MaTrangThaiThanhToan.HOAN_TIEN_MOT_PHAN)
                .phuongThuc(tt.getPhuongThuc())
                .congThanhToan(tt.getPhuongThuc())
                .thamChieuCong("REFUND-DP-" + dp.getId())
                .ghiChu(lyDo)
                .build());
        dichVuHoanTien.luuHoanTienDon(dp, soTienHoan, lyDo);
        capNhatTongThanhToan(dp);
    }

    private ThanhToan napThanhToan(DatPhong dp) {
        return thanhToanRepository.findByDatPhong_Id(dp.getId())
                .map(tt -> {
                    dp.setThanhToan(tt);
                    return tt;
                })
                .orElse(null);
    }

    private void capNhatTrangThaiDonSauKhiHuy(DatPhong dp) {
        boolean conPhongHieuLuc = dp.getChiTiet().stream().anyMatch(this::coHieuLuc);
        if (!conPhongHieuLuc) {
            dp.setTrangThai(MaTrangThaiDatPhong.DA_HUY);
        }
    }

    private boolean coHieuLuc(ChiTietDatPhong chiTiet) {
        return !MaTrangThaiChiTietDatPhong.DA_HUY.equals(chiTiet.getTrangThai());
    }

    private boolean coTheHuy(ChiTietDatPhong chiTiet) {
        return MaTrangThaiChiTietDatPhong.DANG_GIU.equals(chiTiet.getTrangThai())
                || MaTrangThaiChiTietDatPhong.DA_XAC_NHAN.equals(chiTiet.getTrangThai());
    }

    private void kiemTraQuyenChuDon(DatPhong dp, Long idNguoiDung) {
        if (dp.getKhachHang() == null || dp.getKhachHang().getNguoiDung() == null) {
            throw new RuntimeException("Không có quyền hủy đơn này");
        }
        Long chuSoHuu = dp.getKhachHang().getNguoiDung().getId();
        if (chuSoHuu == null || !chuSoHuu.equals(idNguoiDung)) {
            throw new RuntimeException("Không có quyền hủy đơn này");
        }
    }

    public void kiemTraQuyenChuDonCongKhai(DatPhong dp, Long idNguoiDung) {
        kiemTraQuyenChuDon(dp, idNguoiDung);
    }

    public void capNhatTrangThaiDonSauHuyCongKhai(DatPhong dp) {
        capNhatTrangThaiDonSauKhiHuy(dp);
    }

    private int tinhSoDem(YeuCauTaoDatPhong yeuCau) {
        int soDem = (int) ChronoUnit.DAYS.between(yeuCau.getNgayNhanPhong(), yeuCau.getNgayTraPhong());
        return Math.max(1, soDem);
    }

    private ChinhSachHuyPhong timChinhSachApDung(java.time.LocalDate ngayNhanPhong) {
        long gioConLai = ChronoUnit.HOURS.between(LocalDateTime.now(), ngayNhanPhong.atStartOfDay());
        return chinhSachHuyPhongRepository.findByConHieuLucTrueOrderBySoGioTruocNhanPhongDesc().stream()
                .filter(cs -> gioConLai >= cs.getSoGioTruocNhanPhong())
                .findFirst()
                .orElse(null);
    }

    private BigDecimal tinhTienPhong(DatPhong dp) {
        return dp.getChiTiet().stream()
                .filter(this::coHieuLuc)
                .map(ChiTietDatPhong::getGia)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal tinhTienDichVu(DatPhong dp) {
        return dp.getSuDungDichVu().stream()
                .map(su -> su.getDichVu().getGia().multiply(BigDecimal.valueOf(su.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<SuDungDichVuDto> gopSuDungDichVuChoDto(DatPhong dp) {
        if (dp.getSuDungDichVu() == null || dp.getSuDungDichVu().isEmpty()) {
            return new ArrayList<>();
        }
        return dp.getSuDungDichVu().stream()
                .collect(Collectors.groupingBy(su -> su.getDichVu().getId()))
                .values()
                .stream()
                .map(list -> {
                    list.sort(Comparator.comparing(SuDungDichVu::getId, Comparator.nullsLast(Comparator.naturalOrder())));
                    SuDungDichVu mau = list.get(0);
                    int tongSoLuong = list.stream().mapToInt(SuDungDichVu::getSoLuong).sum();
                    BigDecimal donGia = mau.getDichVu().getGia();
                    SuDungDichVuDto s = new SuDungDichVuDto();
                    s.setId(mau.getId());
                    s.setIdDichVu(mau.getDichVu().getId());
                    s.setTenDichVu(mau.getDichVu().getTen());
                    s.setSoLuong(tongSoLuong);
                    s.setDonGia(donGia);
                    s.setThanhTien(donGia.multiply(BigDecimal.valueOf(tongSoLuong)));
                    return s;
                })
                .sorted(Comparator.comparing(SuDungDichVuDto::getTenDichVu, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private BigDecimal tinhTienHoan(DatPhong dp) {
        return dp.getHoanTien().stream()
                .map(HoanTien::getSoTienHoan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal tinhTongTien(DatPhong dp) {
        return tinhTienPhong(dp).add(tinhTienDichVu(dp));
    }

    private DatPhongDto sangDto(DatPhong dp) {
        DatPhongDto dto = new DatPhongDto();
        dto.setId(dp.getId());
        dto.setIdKhachHang(dp.getKhachHang().getId());
        dto.setTenKhachHang(dp.getKhachHang().getHoTen());
        String tenKhach = dp.getTenKhach();
        if (tenKhach == null || tenKhach.isBlank()) {
            tenKhach = dp.getKhachHang().getHoTen();
        }
        dto.setTenKhach(tenKhach);
        String sdt = dp.getSdtKhach();
        if (sdt == null || sdt.isBlank()) {
            sdt = dp.getKhachHang().getSoDienThoai();
        }
        if ((sdt == null || sdt.isBlank()) && dp.getKhachHang().getNguoiDung() != null) {
            sdt = dp.getKhachHang().getNguoiDung().getSoDienThoai();
        }
        dto.setSdtKhach(sdt);
        String email = dp.getEmailKhach();
        if (email == null || email.isBlank()) {
            email = dp.getKhachHang().getEmail();
        }
        if ((email == null || email.isBlank()) && dp.getKhachHang().getNguoiDung() != null) {
            email = dp.getKhachHang().getNguoiDung().getEmail();
        }
        dto.setEmailKhach(email);
        dto.setNgayNhanPhong(dp.getNgayNhanPhong());
        dto.setNgayTraPhong(dp.getNgayTraPhong());
        dto.setTrangThai(dp.getTrangThai());
        dto.setTienPhong(tinhTienPhong(dp));
        dto.setTienDichVu(tinhTienDichVu(dp));
        dto.setTienHoan(tinhTienHoan(dp));
        dto.setTongTien(tinhTongTien(dp));
        dto.setThoiGianTao(dp.getThoiGianTao());
        if (phutGiuChoThanhToan > 0
                && MaTrangThaiDatPhong.CHO_DUYET.equals(dp.getTrangThai())
                && dp.getThoiGianTao() != null) {
            ThanhToan tt0 = dp.getThanhToan();
            boolean chuaThuTien = tt0 == null
                    || tt0.getTongDaThu() == null
                    || tt0.getTongDaThu().compareTo(BigDecimal.ZERO) <= 0;
            if (chuaThuTien) {
                dto.setThoiDiemHetHanThanhToan(dp.getThoiGianTao().plusMinutes(phutGiuChoThanhToan));
            }
        }
        dto.setSoGioHuyApDung(dp.getSoGioHuyApDung());
        dto.setTyLeHoanTienApDung(dp.getTyLeHoanTienApDung());
        dto.setChiTiet(dp.getChiTiet().stream().map(d -> {
            ChiTietDatPhongDto c = new ChiTietDatPhongDto();
            c.setId(d.getId());
            c.setIdPhong(d.getPhong().getId());
            c.setSoPhong(d.getPhong().getSoPhong());
            c.setTrangThai(d.getTrangThai());
            c.setGiaGocMoiDem(d.getGiaGocMoiDem());
            c.setSoDem(d.getSoDem());
            c.setGia(d.getGia());
            c.setSoTienHoan(d.getSoTienHoan());
            c.setThoiDiemHuy(d.getThoiDiemHuy());
            c.setLyDoHuy(d.getLyDoHuy());
            c.setSoGioHuyApDung(d.getSoGioHuyApDung());
            c.setTyLeHoanTienApDung(d.getTyLeHoanTienApDung());
            return c;
        }).collect(Collectors.toList()));
        dto.setSuDungDichVu(gopSuDungDichVuChoDto(dp));
        if (dp.getThanhToan() != null) {
            ThanhToanDto tt = new ThanhToanDto();
            tt.setId(dp.getThanhToan().getId());
            tt.setTongPhaiThu(dp.getThanhToan().getTongPhaiThu());
            tt.setTongDaThu(dp.getThanhToan().getTongDaThu());
            tt.setTongHoan(dp.getThanhToan().getTongHoan());
            tt.setConPhaiThu(dp.getThanhToan().getConPhaiThu());
            tt.setPhuongThuc(dp.getThanhToan().getPhuongThuc());
            tt.setTrangThai(dp.getThanhToan().getTrangThai());
            tt.setThoiDiemThanhToan(dp.getThanhToan().getThoiDiemThanhToan());
            tt.setLanCapNhatCuoi(dp.getThanhToan().getLanCapNhatCuoi());
            List<GiaoDichThanhToan> gdList = new ArrayList<>(dp.getThanhToan().getGiaoDich());
            gdList.sort(Comparator.comparing(GiaoDichThanhToan::getId, Comparator.nullsLast(Comparator.naturalOrder())));
            Set<String> daThayMaGiaoDich = new HashSet<>();
            List<GiaoDichThanhToanDto> gdDtos = new ArrayList<>();
            for (GiaoDichThanhToan gd : gdList) {
                String maGd = gd.getMaGiaoDich();
                if (maGd != null && !maGd.isBlank()) {
                    if (!daThayMaGiaoDich.add(maGd)) {
                        continue;
                    }
                }
                GiaoDichThanhToanDto g = new GiaoDichThanhToanDto();
                g.setId(gd.getId());
                g.setMaGiaoDich(gd.getMaGiaoDich());
                g.setLoaiGiaoDich(gd.getLoaiGiaoDich());
                g.setSoTien(gd.getSoTien());
                g.setTrangThai(gd.getTrangThai());
                g.setPhuongThuc(gd.getPhuongThuc());
                g.setCongThanhToan(gd.getCongThanhToan());
                g.setThamChieuCong(gd.getThamChieuCong());
                g.setThoiDiemGiaoDich(gd.getThoiDiemGiaoDich());
                g.setGhiChu(gd.getGhiChu());
                gdDtos.add(g);
            }
            tt.setGiaoDich(gdDtos);
            dto.setThanhToan(tt);
        }
        return dto;
    }

    private ThongTinEmailDatPhong thongTinEmailTuDon(DatPhong dp, BigDecimal tongTien, boolean laXacNhanTuLeTan) {
        String den = layEmailKhach(dp);
        if (den == null || den.isBlank()) {
            return null;
        }
        List<String> dongPhong = new ArrayList<>();
        for (ChiTietDatPhong ct : dp.getChiTiet()) {
            Phong p = ct.getPhong();
            dongPhong.add(String.format("Phòng %s · %s", p.getSoPhong(), p.getLoaiPhong().getTen()));
        }
        return new ThongTinEmailDatPhong(
                dp.getTenKhach(),
                den.trim(),
                dp.getId(),
                dp.getNgayNhanPhong(),
                dp.getNgayTraPhong(),
                tongTien,
                List.copyOf(dongPhong),
                laXacNhanTuLeTan
        );
    }

    private String layEmailKhach(DatPhong dp) {
        if (dp.getEmailKhach() != null && !dp.getEmailKhach().isBlank()) {
            return dp.getEmailKhach();
        }
        if (dp.getKhachHang() != null && dp.getKhachHang().getEmail() != null) {
            return dp.getKhachHang().getEmail();
        }
        return null;
    }
}
