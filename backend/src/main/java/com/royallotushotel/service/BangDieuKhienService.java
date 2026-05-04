package com.royallotushotel.service;

import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BangDieuKhienService {

    private final DatPhongRepository datPhongRepository;
    private final PhongRepository phongRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> layThongKeThoiGianThuc() {
        long tongPhong = phongRepository.count();
        long phongTrong = phongRepository.findByTrangThai(MaTrangThaiPhong.PHONG_TRONG).size();
        long phongDangDung = phongRepository.findByTrangThai(MaTrangThaiPhong.DANG_SU_DUNG).size();
        long nhanPhongHomNay = datPhongRepository.timLuuTruDangHoatDongVaoNgay(LocalDate.now()).size();
        BigDecimal doanhThuHomNay = datPhongRepository.tongDoanhThuTheoKhoangNgay(LocalDate.now(), LocalDate.now());
        Long soDonHomNay = datPhongRepository.demDatPhongTheoKhoangNgay(LocalDate.now(), LocalDate.now());
        Map<String, Object> map = new HashMap<>();
        map.put("tongPhong", tongPhong);
        map.put("phongTrong", phongTrong);
        map.put("phongDangDung", phongDangDung);
        map.put("nhanPhongHomNay", nhanPhongHomNay);
        map.put("doanhThuHomNay", doanhThuHomNay != null ? doanhThuHomNay : BigDecimal.ZERO);
        map.put("donHomNay", soDonHomNay != null ? soDonHomNay : 0);
        map.put("tyLeLapDay", tongPhong > 0 ? (phongDangDung * 100.0 / tongPhong) : 0);
        return map;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> layThongKeDoanhThu(LocalDate tu, LocalDate den) {
        BigDecimal doanhThu = datPhongRepository.tongDoanhThuTheoKhoangNgay(tu, den);
        Long dem = datPhongRepository.demDatPhongTheoKhoangNgay(tu, den);
        Map<String, Object> map = new HashMap<>();
        map.put("doanhThu", doanhThu != null ? doanhThu : BigDecimal.ZERO);
        map.put("soDon", dem != null ? dem : 0);
        return map;
    }
}
