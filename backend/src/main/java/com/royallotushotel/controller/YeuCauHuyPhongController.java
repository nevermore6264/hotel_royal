package com.royallotushotel.controller;

import com.royallotushotel.dto.*;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.YeuCauHuyPhongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/yeu-cau-huy")
@RequiredArgsConstructor
public class YeuCauHuyPhongController {

    private final YeuCauHuyPhongService yeuCauHuyPhongService;

    @GetMapping("/danh-gia")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<DanhGiaHuyDto> danhGia(
            @RequestParam Long idDatPhong,
            @RequestParam(required = false) Long idChiTiet,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.danhGia(idDatPhong, idChiTiet, chuThe.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<YeuCauHuyDto> tao(
            @Valid @RequestBody TaoYeuCauHuyDto req,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.tao(req, chuThe.getId()));
    }

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<List<YeuCauHuyDto>> cuaToi(
            @RequestParam Long idDatPhong,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.danhSachTheoDon(idDatPhong, chuThe.getId()));
    }

    @GetMapping("/cho-duyet")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<YeuCauHuyDto>> choDuyet() {
        return ResponseEntity.ok(yeuCauHuyPhongService.danhSachChoDuyet());
    }

    @GetMapping("/cho-hoan")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<List<YeuCauHuyDto>> choHoan() {
        return ResponseEntity.ok(yeuCauHuyPhongService.danhSachChoHoan());
    }

    @PostMapping("/{id:\\d+}/duyet")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<YeuCauHuyDto> duyet(
            @PathVariable Long id,
            @RequestBody(required = false) XuLyYeuCauHuyDto body,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.duyet(id, chuThe.getId(), body));
    }

    @PostMapping("/{id:\\d+}/tu-choi")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<YeuCauHuyDto> tuChoi(
            @PathVariable Long id,
            @RequestBody(required = false) XuLyYeuCauHuyDto body,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.tuChoi(id, chuThe.getId(), body));
    }

    @PostMapping("/{id:\\d+}/hoan-tien")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<YeuCauHuyDto> hoanTien(
            @PathVariable Long id,
            @RequestBody(required = false) XuLyYeuCauHuyDto body,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(yeuCauHuyPhongService.thucHienHoan(id, chuThe.getId(), body));
    }
}
