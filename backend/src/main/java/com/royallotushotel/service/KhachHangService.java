package com.royallotushotel.service;

import com.royallotushotel.dto.KhachHangDto;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.repository.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;

    @Transactional(readOnly = true)
    public List<KhachHangDto> timKiem(String tuKhoa) {
        if (tuKhoa == null || tuKhoa.trim().isEmpty())
            return khachHangRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
        return khachHangRepository.timKiem(tuKhoa.trim()).stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<KhachHangDto> timTatCa() {
        return khachHangRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<KhachHangDto> timPhanTrang(Pageable phanTrang, String q) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return khachHangRepository.timCoPhanTrang(qq, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public KhachHangDto layTheoId(Long id) {
        KhachHang kh = khachHangRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return sangDto(kh);
    }

    @Transactional
    public KhachHangDto tao(KhachHangDto dto) {
        KhachHang kh = new KhachHang();
        kh.setHoTen(dto.getHoTen());
        kh.setSoDienThoai(dto.getSoDienThoai());
        kh.setEmail(dto.getEmail());
        kh.setSoCanCuoc(dto.getSoCanCuoc());
        kh = khachHangRepository.save(kh);
        return sangDto(kh);
    }

    @Transactional
    public KhachHangDto capNhat(Long id, KhachHangDto dto) {
        KhachHang kh = khachHangRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        kh.setHoTen(dto.getHoTen());
        kh.setSoDienThoai(dto.getSoDienThoai());
        kh.setEmail(dto.getEmail());
        kh.setSoCanCuoc(dto.getSoCanCuoc());
        kh = khachHangRepository.save(kh);
        return sangDto(kh);
    }

    private KhachHangDto sangDto(KhachHang kh) {
        KhachHangDto dto = new KhachHangDto();
        dto.setId(kh.getId());
        dto.setHoTen(kh.getHoTen());

        String sdt = kh.getSoDienThoai();
        if ((sdt == null || sdt.isBlank()) && kh.getNguoiDung() != null) {
            String nd = kh.getNguoiDung().getSoDienThoai();
            if (nd != null && !nd.isBlank()) {
                sdt = nd;
            }
        }
        dto.setSoDienThoai(sdt);

        String email = kh.getEmail();
        if ((email == null || email.isBlank()) && kh.getNguoiDung() != null) {
            String nd = kh.getNguoiDung().getEmail();
            if (nd != null && !nd.isBlank()) {
                email = nd;
            }
        }
        dto.setEmail(email);

        dto.setSoCanCuoc(kh.getSoCanCuoc());
        if (kh.getNguoiDung() != null) dto.setIdNguoiDung(kh.getNguoiDung().getId());
        return dto;
    }
}
