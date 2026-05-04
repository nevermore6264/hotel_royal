package com.royallotushotel.service;

import com.royallotushotel.dto.LoaiPhongDto;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.repository.LoaiPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoaiPhongService {

    private final LoaiPhongRepository loaiPhongRepository;

    @Transactional(readOnly = true)
    public List<LoaiPhongDto> timTatCa() {
        return loaiPhongRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<LoaiPhongDto> timPhanTrang(Pageable phanTrang, String q) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return loaiPhongRepository.timCoPhanTrang(qq, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public LoaiPhongDto layTheoId(Long id) {
        LoaiPhong lp = loaiPhongRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay loai phong"));
        return sangDto(lp);
    }

    @Transactional
    public LoaiPhongDto tao(LoaiPhongDto dto) {
        LoaiPhong lp = new LoaiPhong();
        lp.setTen(dto.getTen());
        lp.setGia(dto.getGia());
        lp.setMoTa(dto.getMoTa());
        lp.setSucChuaToiDa(dto.getSucChuaToiDa());
        lp = loaiPhongRepository.save(lp);
        return sangDto(lp);
    }

    @Transactional
    public LoaiPhongDto capNhat(Long id, LoaiPhongDto dto) {
        LoaiPhong lp = loaiPhongRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay loai phong"));
        lp.setTen(dto.getTen());
        lp.setGia(dto.getGia());
        lp.setMoTa(dto.getMoTa());
        lp.setSucChuaToiDa(dto.getSucChuaToiDa());
        lp = loaiPhongRepository.save(lp);
        return sangDto(lp);
    }

    @Transactional
    public void xoa(Long id) {
        loaiPhongRepository.deleteById(id);
    }

    private LoaiPhongDto sangDto(LoaiPhong lp) {
        LoaiPhongDto dto = new LoaiPhongDto();
        dto.setId(lp.getId());
        dto.setTen(lp.getTen());
        dto.setGia(lp.getGia());
        dto.setMoTa(lp.getMoTa());
        dto.setSucChuaToiDa(lp.getSucChuaToiDa());
        return dto;
    }
}
