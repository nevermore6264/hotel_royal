package com.royallotushotel.service;

import com.royallotushotel.dto.NguoiDungDto;
import com.royallotushotel.dto.YeuCauCapNhatHoSo;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.VaiTro;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final KhachHangRepository khachHangRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<NguoiDungDto> timTatCa() {
        return nguoiDungRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NguoiDungDto> timPhanTrang(Pageable phanTrang, String q, String trangThai, String vaiTro) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        String tt = (trangThai != null && !trangThai.isBlank()) ? trangThai : null;
        String vt = (vaiTro != null && !vaiTro.isBlank()) ? vaiTro : null;
        return nguoiDungRepository.timCoPhanTrang(qq, tt, vt, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public NguoiDungDto layTheoId(Long id) {
        NguoiDung nd = nguoiDungRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        return sangDto(nd);
    }

    @Transactional
    public NguoiDungDto tao(NguoiDungDto dto) {
        if (nguoiDungRepository.existsByTenDangNhap(dto.getTenDangNhap())) throw new RuntimeException("Ten dang nhap da ton tai");
        if (nguoiDungRepository.existsByEmail(dto.getEmail())) throw new RuntimeException("Email da ton tai");
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap(dto.getTenDangNhap());
        nd.setMatKhau(passwordEncoder.encode(dto.getMatKhau()));
        nd.setEmail(dto.getEmail());
        nd.setHoTen(dto.getHoTen());
        nd.setSoDienThoai(dto.getSoDienThoai());
        nd.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : MaTrangThaiNguoiDung.HOAT_DONG);
        for (String tenVt : dto.getVaiTro()) {
            VaiTro vt = vaiTroRepository.findByTen(tenVt).orElseGet(() -> vaiTroRepository.save(VaiTro.builder().ten(tenVt).build()));
            nd.getVaiTro().add(vt);
        }
        nd = nguoiDungRepository.save(nd);
        return sangDto(nd);
    }

    @Transactional
    public NguoiDungDto capNhat(Long id, NguoiDungDto dto) {
        NguoiDung nd = nguoiDungRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String emailMoi = dto.getEmail().trim();
            if (!emailMoi.equals(nd.getEmail())
                    && nguoiDungRepository.existsByEmailAndIdNot(emailMoi, id))
                throw new RuntimeException("Email da duoc su dung");
            nd.setEmail(emailMoi);
        }
        nd.setHoTen(dto.getHoTen());
        nd.setSoDienThoai(dto.getSoDienThoai());
        nd.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : nd.getTrangThai());
        if (dto.getMatKhau() != null && !dto.getMatKhau().isEmpty())
            nd.setMatKhau(passwordEncoder.encode(dto.getMatKhau()));
        if (dto.getVaiTro() != null && !dto.getVaiTro().isEmpty()) {
            nd.getVaiTro().clear();
            for (String tenVt : dto.getVaiTro()) {
                VaiTro vt = vaiTroRepository.findByTen(tenVt).orElseGet(() -> vaiTroRepository.save(VaiTro.builder().ten(tenVt).build()));
                nd.getVaiTro().add(vt);
            }
        }
        nd = nguoiDungRepository.save(nd);
        return sangDto(nd);
    }

    @Transactional
    public void xoa(Long id) {
        nguoiDungRepository.deleteById(id);
    }

    @Transactional
    public NguoiDungDto capNhatThongTinCaNhan(Long idNguoiDung, YeuCauCapNhatHoSo yeuCau) {
        NguoiDung nd = nguoiDungRepository.findById(idNguoiDung).orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        if (yeuCau.getEmail() != null) {
            String emailMoi = yeuCau.getEmail().trim();
            String emailCu = nd.getEmail() != null ? nd.getEmail().trim() : "";
            if (!emailMoi.equalsIgnoreCase(emailCu)
                    && nguoiDungRepository.existsByEmailAndIdNot(emailMoi, idNguoiDung))
                throw new RuntimeException("Email da duoc su dung");
            nd.setEmail(emailMoi);
        }
        if (yeuCau.getHoTen() != null) nd.setHoTen(yeuCau.getHoTen().trim());
        if (yeuCau.getSoDienThoai() != null) {
            String sdtRaw = yeuCau.getSoDienThoai().trim();
            String sdtMoi = sdtRaw.isEmpty() ? null : sdtRaw;
            String sdtCu = nd.getSoDienThoai() != null ? nd.getSoDienThoai().trim() : null;
            if (sdtMoi != null && !Objects.equals(sdtMoi, sdtCu)
                    && nguoiDungRepository.existsBySoDienThoaiAndIdNot(sdtMoi, idNguoiDung))
                throw new RuntimeException("So dien thoai da duoc su dung");
            nd.setSoDienThoai(sdtMoi);
        }
        nd = nguoiDungRepository.save(nd);
        NguoiDung finalNd = nd;
        khachHangRepository.findByNguoiDung_Id(idNguoiDung).ifPresent(kh -> {
            if (yeuCau.getHoTen() != null) kh.setHoTen(finalNd.getHoTen());
            if (yeuCau.getSoDienThoai() != null) kh.setSoDienThoai(finalNd.getSoDienThoai());
            if (yeuCau.getEmail() != null) kh.setEmail(finalNd.getEmail());
            khachHangRepository.save(kh);
        });
        return sangDto(nd);
    }

    @Transactional
    public void doiMatKhau(Long idNguoiDung, String matKhauCu, String matKhauMoi) {
        if (matKhauMoi == null || matKhauMoi.length() < 6)
            throw new RuntimeException("Mat khau moi phai co it nhat 6 ky tu");
        NguoiDung nd = nguoiDungRepository.findById(idNguoiDung).orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
        if (!passwordEncoder.matches(matKhauCu, nd.getMatKhau()))
            throw new RuntimeException("Mat khau hien tai khong dung");
        nd.setMatKhau(passwordEncoder.encode(matKhauMoi));
        nguoiDungRepository.save(nd);
    }

    private NguoiDungDto sangDto(NguoiDung nd) {
        NguoiDungDto dto = new NguoiDungDto();
        dto.setId(nd.getId());
        dto.setTenDangNhap(nd.getTenDangNhap());
        dto.setEmail(nd.getEmail());
        dto.setHoTen(nd.getHoTen());
        dto.setSoDienThoai(nd.getSoDienThoai());
        dto.setTrangThai(nd.getTrangThai());
        dto.setVaiTro(nd.getVaiTro().stream().map(VaiTro::getTen).collect(Collectors.toList()));
        return dto;
    }
}
