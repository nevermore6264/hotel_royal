package com.royallotushotel.controller;

import com.royallotushotel.dto.DanhGiaDto;
import com.royallotushotel.dto.YeuCauTaoDanhGia;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.DanhGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/danh-gia")
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    @GetMapping
    public ResponseEntity<List<DanhGiaDto>> theoLoaiPhong(@RequestParam Long idLoaiPhong) {
        return ResponseEntity.ok(danhGiaService.listTheoLoaiPhong(idLoaiPhong));
    }

    @PostMapping
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<DanhGiaDto> tao(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @RequestBody YeuCauTaoDanhGia body) {
        return ResponseEntity.ok(danhGiaService.tao(chuThe, body));
    }
}
