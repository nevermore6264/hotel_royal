package com.royallotushotel.controller;

import com.royallotushotel.dto.BangGiaPhongDto;
import com.royallotushotel.service.BangGiaPhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bang-gia-phong")
@RequiredArgsConstructor
public class BangGiaPhongController {

    private final BangGiaPhongService bangGiaPhongService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long idLoaiPhong) {
        if (page == null) {
            return ResponseEntity.ok(bangGiaPhongService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<BangGiaPhongDto> ketQua = bangGiaPhongService.timPhanTrang(phanTrang, q, idLoaiPhong);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<BangGiaPhongDto> tao(@RequestBody BangGiaPhongDto dto) {
        return ResponseEntity.ok(bangGiaPhongService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<BangGiaPhongDto> capNhat(@PathVariable Long id, @RequestBody BangGiaPhongDto dto) {
        return ResponseEntity.ok(bangGiaPhongService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        bangGiaPhongService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
