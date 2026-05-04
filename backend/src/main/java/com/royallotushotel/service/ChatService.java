package com.royallotushotel.service;

import com.royallotushotel.dto.CuocTroChuyenTomTatDto;
import com.royallotushotel.dto.NguoiDungHoTroChatDto;
import com.royallotushotel.dto.TinNhanChatDto;
import com.royallotushotel.entity.CuocTroChuyen;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.TinNhanChat;
import com.royallotushotel.hangso.MaKieuTinChat;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.CuocTroChuyenRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.TinNhanChatRepository;
import com.royallotushotel.security.ChuTheNguoiDung;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final CuocTroChuyenRepository cuocTroChuyenRepository;
    private final TinNhanChatRepository tinNhanChatRepository;
    private final NguoiDungRepository nguoiDungRepository;

    private boolean laNhanVienHoTro(ChuTheNguoiDung u) {
        return coVaiTro(u, MaVaiTro.LE_TAN) || coVaiTro(u, MaVaiTro.QUAN_TRI);
    }

    private boolean laKhachHang(ChuTheNguoiDung u) {
        return coVaiTro(u, MaVaiTro.KHACH_HANG);
    }

    private boolean coVaiTro(ChuTheNguoiDung u, String role) {
        return u.getAuthorities().stream().anyMatch(a -> role.equals(a.getAuthority()));
    }

    private boolean laNhanVienHoTroChat(NguoiDung nd) {
        return nd.getVaiTro().stream().anyMatch(v ->
                MaVaiTro.LE_TAN.equals(v.getTen()) || MaVaiTro.QUAN_TRI.equals(v.getTen()));
    }

    private String tenHienThi(NguoiDung nd) {
        if (nd.getHoTen() != null && !nd.getHoTen().isBlank()) return nd.getHoTen();
        return nd.getTenDangNhap();
    }

    private TinNhanChatDto sangDto(TinNhanChat t) {
        NguoiDung g = t.getNguoiGui();
        String kt = t.getKieuTin();
        if (kt == null || kt.isBlank()) kt = MaKieuTinChat.VAN_BAN;
        return TinNhanChatDto.builder()
                .id(t.getId())
                .idNguoiGui(g.getId())
                .tenHienThiNguoiGui(tenHienThi(g))
                .noiDung(t.getNoiDung())
                .kieuTin(kt)
                .thoiDiem(t.getThoiDiem())
                .build();
    }

    private record NoiDungVaKieu(String noiDung, String kieuTin) {}

    private NoiDungVaKieu chuanHoaNoiDung(String noiDung, String kieuTinRaw) {
        String kt = (kieuTinRaw == null || kieuTinRaw.isBlank())
                ? MaKieuTinChat.VAN_BAN
                : kieuTinRaw.trim();
        if (!MaKieuTinChat.VAN_BAN.equals(kt) && !MaKieuTinChat.ANH.equals(kt)) {
            throw new RuntimeException("Kieu tin khong hop le");
        }
        String nd = noiDung == null ? "" : noiDung.trim();
        if (MaKieuTinChat.ANH.equals(kt)) {
            if (nd.isEmpty()) throw new RuntimeException("Thieu duong dan anh");
            if (nd.length() > 512) throw new RuntimeException("Duong dan anh qua dai");
            if (!nd.startsWith("/api/uploads/chat/")) {
                throw new RuntimeException("Duong dan anh khong hop le");
            }
            return new NoiDungVaKieu(nd, kt);
        }
        if (nd.isEmpty()) throw new RuntimeException("Noi dung khong hop le");
        if (nd.length() > 2000) throw new RuntimeException("Noi dung qua dai");
        return new NoiDungVaKieu(nd, kt);
    }

    private void kiemTraQuyenXemCuoc(ChuTheNguoiDung user, CuocTroChuyen cuoc) {
        if (coVaiTro(user, MaVaiTro.QUAN_TRI)) return;
        if (!laNhanVienHoTro(user)) {
            throw new RuntimeException("Khong co quyen xem tro chuyen");
        }
        NguoiDung ht = cuoc.getNguoiHoTro();
        if (ht == null) {
            throw new RuntimeException("Cuoc tro chuyen khong co nguoi ho tro");
        }
        if (!ht.getId().equals(user.getId())) {
            throw new RuntimeException("Ban khong phai nguoi ho tro duoc chon cho cuoc nay");
        }
    }

    @Transactional(readOnly = true)
    public List<NguoiDungHoTroChatDto> danhSachNhanVienHoTro() {
        return nguoiDungRepository.timNhanVienHoTroChat(MaTrangThaiNguoiDung.HOAT_DONG).stream()
                .map(this::sangHoTroDto)
                .collect(Collectors.toList());
    }

    private NguoiDungHoTroChatDto sangHoTroDto(NguoiDung n) {
        boolean lt = n.getVaiTro().stream().anyMatch(v -> MaVaiTro.LE_TAN.equals(v.getTen()));
        boolean qt = n.getVaiTro().stream().anyMatch(v -> MaVaiTro.QUAN_TRI.equals(v.getTen()));
        String loai = qt && lt ? "Quản trị · Lễ tân" : (qt ? "Quản trị" : "Lễ tân");
        return NguoiDungHoTroChatDto.builder()
                .id(n.getId())
                .hoTen(tenHienThi(n))
                .tenDangNhap(n.getTenDangNhap())
                .loaiVaiTro(loai)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TinNhanChatDto> tinNhanCuaKhach(ChuTheNguoiDung user, Long idNguoiHoTro) {
        if (!laKhachHang(user)) {
            throw new RuntimeException("Chi tai khoan khach hang moi xem duoc kenh nay");
        }
        if (idNguoiHoTro == null) throw new RuntimeException("Thieu nguoi ho tro");
        return cuocTroChuyenRepository
                .findByNguoiDungKhach_IdAndNguoiHoTro_Id(user.getId(), idNguoiHoTro)
                .map(c -> tinNhanChatRepository.findByCuocTroChuyen_IdOrderByThoiDiemAsc(c.getId())
                        .stream().map(this::sangDto).collect(Collectors.toList()))
                .orElse(List.of());
    }

    @Transactional
    public TinNhanChatDto guiTinKhach(ChuTheNguoiDung user, String noiDung, Long idNguoiHoTro, String kieuTin) {
        if (!laKhachHang(user)) {
            throw new RuntimeException("Chi tai khoan khach hang moi gui tin tai day");
        }
        if (idNguoiHoTro == null) throw new RuntimeException("Chon nguoi ho tro");
        NoiDungVaKieu nk = chuanHoaNoiDung(noiDung, kieuTin);

        NguoiDung nguoiGui = nguoiDungRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        NguoiDung nguoiHoTro = nguoiDungRepository.findById(idNguoiHoTro)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi ho tro"));
        if (!MaTrangThaiNguoiDung.HOAT_DONG.equals(nguoiHoTro.getTrangThai())) {
            throw new RuntimeException("Tai khoan ho tro khong hoat dong");
        }
        if (!laNhanVienHoTroChat(nguoiHoTro)) {
            throw new RuntimeException("Chi duoc chat voi le tan hoac quan tri");
        }

        CuocTroChuyen cuoc = cuocTroChuyenRepository
                .findByNguoiDungKhach_IdAndNguoiHoTro_Id(user.getId(), idNguoiHoTro)
                .orElseGet(() -> cuocTroChuyenRepository.save(CuocTroChuyen.builder()
                        .nguoiDungKhach(nguoiGui)
                        .nguoiHoTro(nguoiHoTro)
                        .thoiDiemCapNhat(LocalDateTime.now())
                        .build()));

        TinNhanChat tin = TinNhanChat.builder()
                .cuocTroChuyen(cuoc)
                .nguoiGui(nguoiGui)
                .noiDung(nk.noiDung())
                .kieuTin(nk.kieuTin())
                .thoiDiem(LocalDateTime.now())
                .build();
        tin = tinNhanChatRepository.save(tin);

        cuoc.setThoiDiemCapNhat(LocalDateTime.now());
        cuocTroChuyenRepository.save(cuoc);

        return sangDto(tin);
    }

    @Transactional(readOnly = true)
    public List<CuocTroChuyenTomTatDto> danhSachCuocChoNhanVien(ChuTheNguoiDung user) {
        if (!laNhanVienHoTro(user)) {
            throw new RuntimeException("Khong co quyen");
        }
        List<CuocTroChuyen> ds;
        if (coVaiTro(user, MaVaiTro.QUAN_TRI)) {
            ds = cuocTroChuyenRepository.findAllByOrderByThoiDiemCapNhatDesc();
        } else {
            ds = cuocTroChuyenRepository.findByNguoiHoTro_IdOrderByThoiDiemCapNhatDesc(user.getId());
        }
        return ds.stream().map(this::sangTomTat).collect(Collectors.toList());
    }

    private CuocTroChuyenTomTatDto sangTomTat(CuocTroChuyen c) {
        NguoiDung k = c.getNguoiDungKhach();
        NguoiDung ht = c.getNguoiHoTro();
        return CuocTroChuyenTomTatDto.builder()
                .id(c.getId())
                .idNguoiDungKhach(k.getId())
                .tenDangNhapKhach(k.getTenDangNhap())
                .hoTenKhach(k.getHoTen())
                .idNguoiHoTro(ht != null ? ht.getId() : null)
                .tenNguoiHoTro(ht != null ? tenHienThi(ht) : null)
                .thoiDiemCapNhat(c.getThoiDiemCapNhat())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TinNhanChatDto> tinTrongCuoc(ChuTheNguoiDung user, Long idCuoc) {
        if (!laNhanVienHoTro(user)) {
            throw new RuntimeException("Khong co quyen xem tro chuyen");
        }
        CuocTroChuyen cuoc = cuocTroChuyenRepository.findById(idCuoc)
                .orElseThrow(() -> new RuntimeException("Khong tim thay cuoc tro chuyen"));
        kiemTraQuyenXemCuoc(user, cuoc);
        return tinNhanChatRepository.findByCuocTroChuyen_IdOrderByThoiDiemAsc(idCuoc).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TinNhanChatDto guiTinNhanVien(ChuTheNguoiDung user, Long idCuoc, String noiDung, String kieuTin) {
        if (!laNhanVienHoTro(user)) {
            throw new RuntimeException("Khong co quyen gui tin");
        }
        NoiDungVaKieu nk = chuanHoaNoiDung(noiDung, kieuTin);

        CuocTroChuyen cuoc = cuocTroChuyenRepository.findById(idCuoc)
                .orElseThrow(() -> new RuntimeException("Khong tim thay cuoc tro chuyen"));
        kiemTraQuyenXemCuoc(user, cuoc);

        NguoiDung nguoiGui = nguoiDungRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));

        TinNhanChat tin = TinNhanChat.builder()
                .cuocTroChuyen(cuoc)
                .nguoiGui(nguoiGui)
                .noiDung(nk.noiDung())
                .kieuTin(nk.kieuTin())
                .thoiDiem(LocalDateTime.now())
                .build();
        tin = tinNhanChatRepository.save(tin);

        cuoc.setThoiDiemCapNhat(LocalDateTime.now());
        cuocTroChuyenRepository.save(cuoc);

        return sangDto(tin);
    }
}
