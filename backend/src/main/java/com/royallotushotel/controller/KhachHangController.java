package com.royallotushotel.controller;

import com.royallotushotel.dto.KhachHangDto;
import com.royallotushotel.service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/khach-hang")
@RequiredArgsConstructor
public class KhachHangController {

    private final KhachHangService khachHangService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String q) {
        if (page == null) {
            if (q != null && !q.isBlank())
                return ResponseEntity.ok(khachHangService.timKiem(q));
            return ResponseEntity.ok(khachHangService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<KhachHangDto> ketQua = khachHangService.timPhanTrang(phanTrang, q);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<KhachHangDto> layTheoId(@PathVariable Long id) {
        return ResponseEntity.ok(khachHangService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<KhachHangDto> tao(@RequestBody KhachHangDto dto) {
        return ResponseEntity.ok(khachHangService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<KhachHangDto> capNhat(@PathVariable Long id, @RequestBody KhachHangDto dto) {
        return ResponseEntity.ok(khachHangService.capNhat(id, dto));
    }
}
