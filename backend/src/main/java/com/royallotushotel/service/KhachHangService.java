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
        KhachHang kh = khachHangRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay khach hang"));
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
        KhachHang kh = khachHangRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay khach hang"));
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
        dto.setSoDienThoai(kh.getSoDienThoai());
        dto.setEmail(kh.getEmail());
        dto.setSoCanCuoc(kh.getSoCanCuoc());
        if (kh.getNguoiDung() != null) dto.setIdNguoiDung(kh.getNguoiDung().getId());
        return dto;
    }
}
