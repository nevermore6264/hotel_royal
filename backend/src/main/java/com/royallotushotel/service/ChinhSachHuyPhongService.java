package com.royallotushotel.service;

import com.royallotushotel.dto.ChinhSachHuyPhongDto;
import com.royallotushotel.entity.ChinhSachHuyPhong;
import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChinhSachHuyPhongService {

    private final ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;

    @Transactional(readOnly = true)
    public List<ChinhSachHuyPhongDto> timTatCa() {
        return chinhSachHuyPhongRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ChinhSachHuyPhongDto> timPhanTrang(Pageable phanTrang, String q, Boolean conHieuLuc) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return chinhSachHuyPhongRepository.timCoPhanTrang(qq, conHieuLuc, phanTrang).map(this::sangDto);
    }

    @Transactional
    public ChinhSachHuyPhongDto tao(ChinhSachHuyPhongDto dto) {
        ChinhSachHuyPhong cs = new ChinhSachHuyPhong();
        cs.setSoGioTruocNhanPhong(dto.getSoGioTruocNhanPhong());
        cs.setTyLeHoanTien(dto.getTyLeHoanTien());
        cs.setMoTa(dto.getMoTa());
        cs.setConHieuLuc(dto.getConHieuLuc() != null ? dto.getConHieuLuc() : true);
        cs = chinhSachHuyPhongRepository.save(cs);
        return sangDto(cs);
    }

    @Transactional
    public ChinhSachHuyPhongDto capNhat(Long id, ChinhSachHuyPhongDto dto) {
        ChinhSachHuyPhong cs = chinhSachHuyPhongRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay chinh sach"));
        cs.setSoGioTruocNhanPhong(dto.getSoGioTruocNhanPhong());
        cs.setTyLeHoanTien(dto.getTyLeHoanTien());
        cs.setMoTa(dto.getMoTa());
        if (dto.getConHieuLuc() != null) cs.setConHieuLuc(dto.getConHieuLuc());
        cs = chinhSachHuyPhongRepository.save(cs);
        return sangDto(cs);
    }

    @Transactional
    public void xoa(Long id) {
        chinhSachHuyPhongRepository.deleteById(id);
    }

    private ChinhSachHuyPhongDto sangDto(ChinhSachHuyPhong cs) {
        ChinhSachHuyPhongDto dto = new ChinhSachHuyPhongDto();
        dto.setId(cs.getId());
        dto.setSoGioTruocNhanPhong(cs.getSoGioTruocNhanPhong());
        dto.setTyLeHoanTien(cs.getTyLeHoanTien());
        dto.setMoTa(cs.getMoTa());
        dto.setConHieuLuc(cs.getConHieuLuc());
        return dto;
    }
}
