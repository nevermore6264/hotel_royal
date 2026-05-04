package com.royallotushotel.controller;

import com.royallotushotel.service.BangDieuKhienService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
}
