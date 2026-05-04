package com.royallotushotel.service;

import com.royallotushotel.dto.DichVuDto;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.DichVu;
import com.royallotushotel.entity.SuDungDichVu;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.DichVuRepository;
import com.royallotushotel.repository.SuDungDichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuanLyDichVuService {

    private final DichVuRepository dichVuRepository;
    private final DatPhongRepository datPhongRepository;
    private final DatPhongService datPhongService;
    private final SuDungDichVuRepository suDungDichVuRepository;

    @Transactional(readOnly = true)
    public List<DichVuDto> timTatCa() {
        return dichVuRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DichVuDto> timPhanTrang(Pageable phanTrang, String q) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return dichVuRepository.timCoPhanTrang(qq, phanTrang).map(this::sangDto);
    }

    @Transactional
    public DichVuDto tao(DichVuDto dto) {
        DichVu dv = new DichVu();
        dv.setTen(dto.getTen());
        dv.setGia(dto.getGia());
        dv.setMoTa(dto.getMoTa());
        dv = dichVuRepository.save(dv);
        return sangDto(dv);
    }

    @Transactional
    public DichVuDto capNhat(Long id, DichVuDto dto) {
        DichVu dv = dichVuRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tim thay dich vu"));
        dv.setTen(dto.getTen());
        dv.setGia(dto.getGia());
        dv.setMoTa(dto.getMoTa());
        dv = dichVuRepository.save(dv);
        return sangDto(dv);
    }

    @Transactional
    public void xoa(Long id) {
        if (suDungDichVuRepository.existsByDichVu_Id(id)) {
            throw new RuntimeException("Khong xoa duoc: dich vu da duoc su dung trong dat phong");
        }
        dichVuRepository.deleteById(id);
    }

    @Transactional
    public void themVaoDatPhong(Long idDatPhong, Long idDichVu, int soLuong) {
        DatPhong dp = datPhongRepository.findById(idDatPhong).orElseThrow(() -> new RuntimeException("Khong tim thay dat phong"));
        DichVu dv = dichVuRepository.findById(idDichVu).orElseThrow(() -> new RuntimeException("Khong tim thay dich vu"));
        SuDungDichVu sd = SuDungDichVu.builder().datPhong(dp).dichVu(dv).soLuong(soLuong).build();
        dp.getSuDungDichVu().add(sd);
        datPhongRepository.save(dp);
        datPhongService.capNhatTongThanhToan(idDatPhong);
    }

    private DichVuDto sangDto(DichVu dv) {
        DichVuDto dto = new DichVuDto();
        dto.setId(dv.getId());
        dto.setTen(dv.getTen());
        dto.setGia(dv.getGia());
        dto.setMoTa(dv.getMoTa());
        return dto;
    }
}
