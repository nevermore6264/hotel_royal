package com.royallotushotel.service;

import com.royallotushotel.dto.PhanHoiXacThuc;
import com.royallotushotel.dto.YeuCauDangKy;
import com.royallotushotel.dto.YeuCauDangNhap;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.VaiTro;
import com.royallotushotel.hangso.MaLoaiTaiKhoan;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.VaiTroRepository;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.security.TienIchJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final NguoiDungRepository nguoiDungRepository;
    private final KhachHangRepository khachHangRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TienIchJwt tienIchJwt;

    @Transactional
    public PhanHoiXacThuc dangNhap(YeuCauDangNhap yeuCau) {
        try {
            Authentication xacThuc = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(yeuCau.getTenDangNhap(), yeuCau.getMatKhau()));
            ChuTheNguoiDung chuThe = (ChuTheNguoiDung) xacThuc.getPrincipal();
            String tokenTruyCap = tienIchJwt.taoToken(xacThuc);
            String tokenLamMoi = tienIchJwt.taoTokenLamMoi(chuThe.getTenDangNhap());
            return PhanHoiXacThuc.builder()
                    .tokenTruyCap(tokenTruyCap)
                    .tokenLamMoi(tokenLamMoi)
                    .idNguoiDung(chuThe.getId())
                    .tenDangNhap(chuThe.getTenDangNhap())
                    .email(chuThe.getEmail())
                    .vaiTro(chuThe.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList()))
                    .build();
        } catch (LockedException e) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        } catch (DisabledException e) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác");
        }
    }

    @Transactional
    public PhanHoiXacThuc dangKy(YeuCauDangKy yeuCau) {
        if (nguoiDungRepository.existsByTenDangNhap(yeuCau.getTenDangNhap()))
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        if (nguoiDungRepository.existsByEmail(yeuCau.getEmail()))
            throw new RuntimeException("Email đã được đăng ký");

        String loai = yeuCau.getLoaiTaiKhoan();
        boolean chiVangLai = loai != null && loai.equalsIgnoreCase(MaLoaiTaiKhoan.VANG_LAI);

        VaiTro vaiTroVangLai = vaiTroRepository.findByTen(MaVaiTro.VANG_LAI)
                .orElseGet(() -> vaiTroRepository.save(VaiTro.builder().ten(MaVaiTro.VANG_LAI).build()));
        VaiTro vaiTroKhach = vaiTroRepository.findByTen(MaVaiTro.KHACH_HANG)
                .orElseGet(() -> vaiTroRepository.save(VaiTro.builder().ten(MaVaiTro.KHACH_HANG).build()));

        NguoiDung nd = NguoiDung.builder()
                .tenDangNhap(yeuCau.getTenDangNhap())
                .matKhau(passwordEncoder.encode(yeuCau.getMatKhau()))
                .email(yeuCau.getEmail())
                .hoTen(yeuCau.getHoTen())
                .soDienThoai(yeuCau.getSoDienThoai())
                .trangThai(MaTrangThaiNguoiDung.HOAT_DONG)
                .build();
        Set<VaiTro> vts = new HashSet<>();
        vts.add(vaiTroVangLai);
        if (!chiVangLai) vts.add(vaiTroKhach);
        nd.getVaiTro().addAll(vts);
        nd = nguoiDungRepository.save(nd);

        KhachHang kh = KhachHang.builder()
                .hoTen(yeuCau.getHoTen())
                .email(yeuCau.getEmail())
                .soDienThoai(yeuCau.getSoDienThoai())
                .nguoiDung(nd)
                .build();
        khachHangRepository.save(kh);
        nd.setHoSoKhachHang(kh);
        nguoiDungRepository.save(nd);

        String tokenTruyCap = tienIchJwt.taoTokenTuTenDangNhap(nd.getTenDangNhap());
        String tokenLamMoi = tienIchJwt.taoTokenLamMoi(nd.getTenDangNhap());
        return PhanHoiXacThuc.builder()
                .tokenTruyCap(tokenTruyCap)
                .tokenLamMoi(tokenLamMoi)
                .idNguoiDung(nd.getId())
                .tenDangNhap(nd.getTenDangNhap())
                .email(nd.getEmail())
                .vaiTro(nd.getVaiTro().stream().map(VaiTro::getTen).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public Map<String, Object> layThongTinToi(Long idNguoiDung) {
        Map<String, Object> map = new HashMap<>();
        if (idNguoiDung == null) return map;
        NguoiDung nd = nguoiDungRepository.findById(idNguoiDung).orElse(null);
        if (nd == null) return map;
        map.put("idNguoiDung", nd.getId());
        map.put("tenDangNhap", nd.getTenDangNhap());
        map.put("email", nd.getEmail());
        map.put("hoTen", nd.getHoTen());
        map.put("vaiTro", nd.getVaiTro().stream().map(VaiTro::getTen).collect(Collectors.toList()));
        Long idKhachHang = khachHangRepository.findByNguoiDung_Id(idNguoiDung)
                .map(KhachHang::getId)
                .orElse(null);
        if (idKhachHang == null) {
            idKhachHang = taoKhachHangNeuCan(nd);
        }
        if (idKhachHang != null) {
            map.put("idKhachHang", idKhachHang);
        }
        return map;
    }

    private Long taoKhachHangNeuCan(NguoiDung nd) {
        boolean laKhach = nd.getVaiTro().stream().map(VaiTro::getTen).anyMatch(MaVaiTro.KHACH_HANG::equals);
        if (!laKhach) {
            return null;
        }
        String hoTen = nd.getHoTen();
        if (hoTen == null || hoTen.isBlank()) {
            hoTen = nd.getTenDangNhap() != null && !nd.getTenDangNhap().isBlank() ? nd.getTenDangNhap() : "Khách";
        }
        KhachHang kh = KhachHang.builder()
                .hoTen(hoTen)
                .email(nd.getEmail())
                .soDienThoai(nd.getSoDienThoai())
                .nguoiDung(nd)
                .build();
        kh = khachHangRepository.save(kh);
        nd.setHoSoKhachHang(kh);
        nguoiDungRepository.save(nd);
        return kh.getId();
    }
}
