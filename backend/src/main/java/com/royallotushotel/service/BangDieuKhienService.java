package com.royallotushotel.service;

import com.royallotushotel.hangso.MaTrangThaiPhong;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        map.put("phongDaGiu", phongRepository.countByTrangThai(MaTrangThaiPhong.DA_GIU));
        map.put("phongBaoTri", phongRepository.countByTrangThai(MaTrangThaiPhong.BAO_TRI));
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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layChuoiDoanhThuTheoNgay(LocalDate tu, LocalDate den) {
        if (tu == null || den == null || tu.isAfter(den)) return new ArrayList<>();
        List<Object[]> hang = datPhongRepository.tongDoanhThuGomTheoNgay(tu, den);
        return hang.stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            LocalDate ngay = (LocalDate) o[0];
            BigDecimal tien = o[1] instanceof BigDecimal ? (BigDecimal) o[1] : BigDecimal.ZERO;
            m.put("ngay", ngay.toString());
            m.put("doanhThu", tien);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layPhongTheoTrangThai() {
        return phongRepository.demNhomTheoTrangThai().stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            m.put("trangThai", o[0]);
            m.put("soLuong", o[1]);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layDatPhongTheoTrangThai() {
        return datPhongRepository.demNhomTheoTrangThaiDatPhong().stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            m.put("trangThai", o[0]);
            m.put("soLuong", o[1]);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layChuoiDonTheoNgay(LocalDate tu, LocalDate den) {
        if (tu == null || den == null || tu.isAfter(den)) return new ArrayList<>();
        return datPhongRepository.demDonGomTheoNgayNhan(tu, den).stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            LocalDate ngay = (LocalDate) o[0];
            long dem = o[1] instanceof Number ? ((Number) o[1]).longValue() : 0L;
            m.put("ngay", ngay.toString());
            m.put("soDon", dem);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layDoanhThuTheoLoaiPhong(LocalDate tu, LocalDate den) {
        if (tu == null || den == null || tu.isAfter(den)) return new ArrayList<>();
        return datPhongRepository.tongThanhTienPhongGomTheoLoaiPhong(tu, den).stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            m.put("tenLoai", o[0]);
            BigDecimal tien = o[1] instanceof BigDecimal ? (BigDecimal) o[1] : BigDecimal.ZERO;
            m.put("doanhThu", tien);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> layPhongTheoLoaiPhong() {
        return phongRepository.demNhomTheoLoaiPhong().stream().map(o -> {
            Map<String, Object> m = new HashMap<>(2);
            m.put("tenLoai", o[0]);
            m.put("soLuong", o[1]);
            return m;
        }).collect(Collectors.toList());
    }
}
