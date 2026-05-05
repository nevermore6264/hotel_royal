package com.royallotushotel.config;

import com.royallotushotel.entity.*;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.hangso.MaTrangThaiVeSinh;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class KhoiTaoDuLieu implements CommandLineRunner {

    private static final String MK_MAC_DINH = "admin123";

    private final VaiTroRepository vaiTroRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final KhachHangRepository khachHangRepository;
    private final PasswordEncoder passwordEncoder;
    private final DichVuRepository dichVuRepository;
    private final LoaiPhongRepository loaiPhongRepository;
    private final PhongRepository phongRepository;
    private final ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;
    private final BangGiaPhongRepository bangGiaPhongRepository;

    @Override
    public void run(String... args) {
        damBaoVaiTro(MaVaiTro.QUAN_TRI);
        damBaoVaiTro(MaVaiTro.LE_TAN);
        damBaoVaiTro(MaVaiTro.KHACH_HANG);
        damBaoVaiTro(MaVaiTro.VANG_LAI);
        damBaoVaiTro(MaVaiTro.BUONG_PHONG);

        khoiTaoDichVu();
        List<LoaiPhong> loaiPhongs = khoiTaoLoaiPhongVaPhong();
        khoiTaoChinhSachHuyPhong();
        khoiTaoBangGiaPhong(loaiPhongs);
        khoiTaoTaiKhoan();
    }

    private void khoiTaoDichVu() {
        if (dichVuRepository.count() > 0) return;
        dichVuRepository.save(DichVu.builder()
                .ten("Dọn phòng theo yêu cầu")
                .gia(new BigDecimal("80000"))
                .moTa("Dọn dẹp, thay ga trải giường theo giờ khách chọn.")
                .build());
        dichVuRepository.save(DichVu.builder()
                .ten("Giặt ủi trong ngày")
                .gia(new BigDecimal("120000"))
                .moTa("Giặt sấy, là phẳng — trả trong ngày nếu trước 10 giờ sáng.")
                .build());
        dichVuRepository.save(DichVu.builder()
                .ten("Bữa sáng tại phòng")
                .gia(new BigDecimal("150000"))
                .moTa("Set buffet Á — Âu phục vụ tại phòng.")
                .build());
        dichVuRepository.save(DichVu.builder()
                .ten("Đưa đón sân bay (Nội Bài)")
                .gia(new BigDecimal("350000"))
                .moTa("Xe 4–7 chỗ, một chiều hoặc khứ hồi theo lịch.")
                .build());
        dichVuRepository.save(DichVu.builder()
                .ten("Thuê xe máy")
                .gia(new BigDecimal("200000"))
                .moTa("Xe tay ga đời mới, giao tại khách sạn (theo ngày).")
                .build());
    }

    private List<LoaiPhong> khoiTaoLoaiPhongVaPhong() {
        if (loaiPhongRepository.count() > 0) {
            return loaiPhongRepository.findAll();
        }

        LoaiPhong lpStd = loaiPhongRepository.save(LoaiPhong.builder()
                .ten("Phòng Standard")
                .gia(new BigDecimal("850000"))
                .moTa("Phòng ngủ 25 m², cửa sổ thành phố, đầy đủ tiện nghi cơ bản.")
                .sucChuaToiDa(2)
                .build());
        LoaiPhong lpSup = loaiPhongRepository.save(LoaiPhong.builder()
                .ten("Phòng Superior")
                .gia(new BigDecimal("1250000"))
                .moTa("Diện tích lớn hơn, ban công nhỏ, minibar.")
                .sucChuaToiDa(3)
                .build());
        LoaiPhong lpDlx = loaiPhongRepository.save(LoaiPhong.builder()
                .ten("Phòng Deluxe")
                .gia(new BigDecimal("1850000"))
                .moTa("View đẹp, bồn tắm đứng kính, bàn làm việc.")
                .sucChuaToiDa(3)
                .build());
        LoaiPhong lpSte = loaiPhongRepository.save(LoaiPhong.builder()
                .ten("Suite gia đình")
                .gia(new BigDecimal("3200000"))
                .moTa("Hai phòng ngủ, phòng khách riêng — phù hợp gia đình.")
                .sucChuaToiDa(5)
                .build());

        List<LoaiPhong> ds = List.of(lpStd, lpSup, lpDlx, lpSte);

        taoPhong("101", lpStd);
        taoPhong("102", lpStd);
        taoPhong("103", lpStd);
        taoPhong("201", lpSup);
        taoPhong("202", lpSup);
        taoPhong("301", lpDlx);
        taoPhong("302", lpDlx);
        taoPhong("401", lpSte);

        return new ArrayList<>(ds);
    }

    private void taoPhong(String soPhong, LoaiPhong loai) {
        if (phongRepository.existsBySoPhong(soPhong)) return;
        phongRepository.save(Phong.builder()
                .soPhong(soPhong)
                .trangThai(MaTrangThaiPhong.PHONG_TRONG)
                .trangThaiVeSinh(MaTrangThaiVeSinh.SACH)
                .loaiPhong(loai)
                .build());
    }

    private void khoiTaoChinhSachHuyPhong() {
        if (chinhSachHuyPhongRepository.count() > 0) return;
        chinhSachHuyPhongRepository.save(ChinhSachHuyPhong.builder()
                .soGioTruocNhanPhong(72)
                .tyLeHoanTien(new BigDecimal("100"))
                .moTa("Hủy trước giờ nhận phòng ít nhất 72 giờ: hoàn 100% tiền phòng (theo điều kiện thanh toán).")
                .thuTuUuTien(30)
                .conHieuLuc(true)
                .build());
        chinhSachHuyPhongRepository.save(ChinhSachHuyPhong.builder()
                .soGioTruocNhanPhong(24)
                .tyLeHoanTien(new BigDecimal("50"))
                .moTa("Hủy trước 24 giờ: hoàn 50% tiền phòng.")
                .thuTuUuTien(20)
                .conHieuLuc(true)
                .build());
        chinhSachHuyPhongRepository.save(ChinhSachHuyPhong.builder()
                .soGioTruocNhanPhong(0)
                .tyLeHoanTien(BigDecimal.ZERO)
                .moTa("Hủy trong vòng 24 giờ trước nhận phòng: không hoàn tiền.")
                .thuTuUuTien(10)
                .conHieuLuc(true)
                .build());
    }

    private void khoiTaoBangGiaPhong(List<LoaiPhong> loaiPhongs) {
        if (bangGiaPhongRepository.count() > 0 || loaiPhongs.isEmpty()) return;

        LoaiPhong deluxe = loaiPhongs.stream()
                .filter(lp -> lp.getTen() != null && lp.getTen().contains("Deluxe"))
                .findFirst()
                .orElse(loaiPhongs.get(Math.min(2, loaiPhongs.size() - 1)));

        bangGiaPhongRepository.save(BangGiaPhong.builder()
                .loaiPhong(deluxe)
                .tenChinhSach("Mùa cao điểm hè")
                .ngayBatDau(LocalDate.of(2026, 6, 1))
                .ngayKetThuc(LocalDate.of(2026, 8, 31))
                .giaApDung(new BigDecimal("2250000"))
                .kichHoat(true)
                .moTa("Phụ phí mùa cao — ưu tiên áp dụng cho khoảng ngày trùng lịch.")
                .build());

        loaiPhongs.stream()
                .filter(lp -> lp.getTen() != null && lp.getTen().toLowerCase().contains("suite"))
                .findFirst()
                .ifPresent(suite -> bangGiaPhongRepository.save(BangGiaPhong.builder()
                        .loaiPhong(suite)
                        .tenChinhSach("Dịp Tết Nguyên đán")
                        .ngayBatDau(LocalDate.of(2026, 1, 15))
                        .ngayKetThuc(LocalDate.of(2026, 2, 5))
                        .giaApDung(new BigDecimal("4200000"))
                        .kichHoat(true)
                        .moTa("Giá lễ Tết — đặt sớm được ưu tiên giữ phòng.")
                        .build()));
    }

    private void khoiTaoTaiKhoan() {
        VaiTro vtQuanTri = vaiTroRepository.findByTen(MaVaiTro.QUAN_TRI)
                .orElseThrow(() -> new RuntimeException("Thiếu vai trò quản trị"));
        VaiTro vtLeTan = vaiTroRepository.findByTen(MaVaiTro.LE_TAN)
                .orElseThrow(() -> new RuntimeException("Thiếu vai trò lễ tân"));
        VaiTro vtBuongPhong = vaiTroRepository.findByTen(MaVaiTro.BUONG_PHONG)
                .orElseThrow(() -> new RuntimeException("Thiếu vai trò buồng phòng"));
        VaiTro vtKhach = vaiTroRepository.findByTen(MaVaiTro.KHACH_HANG)
                .orElseThrow(() -> new RuntimeException("Thiếu vai trò khách hàng"));

        if (nguoiDungRepository.findByTenDangNhap("admin").isEmpty()) {
            NguoiDung admin = NguoiDung.builder()
                    .tenDangNhap("admin")
                    .matKhau(passwordEncoder.encode(MK_MAC_DINH))
                    .email("admin@royallotus.vn")
                    .hoTen("Quản trị viên")
                    .soDienThoai("02439998888")
                    .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                    .build();
            admin.getVaiTro().add(vtQuanTri);
            nguoiDungRepository.save(admin);
        }

        if (nguoiDungRepository.findByTenDangNhap("letan").isEmpty()) {
            NguoiDung nd = NguoiDung.builder()
                    .tenDangNhap("letan")
                    .matKhau(passwordEncoder.encode(MK_MAC_DINH))
                    .email("letan@royallotus.vn")
                    .hoTen("Nguyễn Thị Lễ Tân")
                    .soDienThoai("0912345678")
                    .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                    .build();
            nd.getVaiTro().add(vtLeTan);
            nguoiDungRepository.save(nd);
        }

        if (nguoiDungRepository.findByTenDangNhap("buongphong").isEmpty()) {
            NguoiDung nd = NguoiDung.builder()
                    .tenDangNhap("buongphong")
                    .matKhau(passwordEncoder.encode(MK_MAC_DINH))
                    .email("buongphong@royallotus.vn")
                    .hoTen("Trần Văn Buồng phòng")
                    .soDienThoai("0987654321")
                    .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                    .build();
            nd.getVaiTro().add(vtBuongPhong);
            nguoiDungRepository.save(nd);
        }

        if (nguoiDungRepository.findByTenDangNhap("khach").isEmpty()) {
            NguoiDung nd = NguoiDung.builder()
                    .tenDangNhap("khach")
                    .matKhau(passwordEncoder.encode(MK_MAC_DINH))
                    .email("khach.le@email.vn")
                    .hoTen("Lê Minh Khách")
                    .soDienThoai("0909123456")
                    .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                    .build();
            nd.getVaiTro().add(vtKhach);
            nd = nguoiDungRepository.save(nd);
            KhachHang kh = KhachHang.builder()
                    .hoTen("Lê Minh Khách")
                    .soDienThoai("0909123456")
                    .email("khach.le@email.vn")
                    .soCanCuoc("")
                    .nguoiDung(nd)
                    .build();
            khachHangRepository.save(kh);
        }
    }

    private void damBaoVaiTro(String ten) {
        if (vaiTroRepository.findByTen(ten).isPresent()) return;
        vaiTroRepository.save(VaiTro.builder().ten(ten).build());
    }
}
