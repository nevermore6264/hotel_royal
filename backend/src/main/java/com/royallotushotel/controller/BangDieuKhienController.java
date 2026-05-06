package com.royallotushotel.controller;

import com.royallotushotel.service.BangDieuKhienService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bang-dieu-khien")
@RequiredArgsConstructor
public class BangDieuKhienController {

    private final BangDieuKhienService bangDieuKhienService;

    @GetMapping("/thoi-gian-thuc")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Map<String, Object>> thoiGianThuc() {
        return ResponseEntity.ok(bangDieuKhienService.layThongKeThoiGianThuc());
    }

    @GetMapping("/doanh-thu")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Map<String, Object>> doanhThu(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tu,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate den) {
        return ResponseEntity.ok(bangDieuKhienService.layThongKeDoanhThu(tu, den));
    }

    @GetMapping("/doanh-thu-theo-ngay")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> doanhThuTheoNgay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tu,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate den) {
        return ResponseEntity.ok(bangDieuKhienService.layChuoiDoanhThuTheoNgay(tu, den));
    }

    @GetMapping("/phong-theo-trang-thai")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> phongTheoTrangThai() {
        return ResponseEntity.ok(bangDieuKhienService.layPhongTheoTrangThai());
    }

    @GetMapping("/dat-phong-theo-trang-thai")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> datPhongTheoTrangThai() {
        return ResponseEntity.ok(bangDieuKhienService.layDatPhongTheoTrangThai());
    }

    @GetMapping("/don-theo-ngay")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> donTheoNgay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tu,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate den) {
        return ResponseEntity.ok(bangDieuKhienService.layChuoiDonTheoNgay(tu, den));
    }

    @GetMapping("/doanh-thu-theo-loai-phong")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> doanhThuTheoLoaiPhong(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tu,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate den) {
        return ResponseEntity.ok(bangDieuKhienService.layDoanhThuTheoLoaiPhong(tu, den));
    }

    @GetMapping("/phong-theo-loai-phong")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<Map<String, Object>>> phongTheoLoaiPhong() {
        return ResponseEntity.ok(bangDieuKhienService.layPhongTheoLoaiPhong());
    }
}
