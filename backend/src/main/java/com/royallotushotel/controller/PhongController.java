package com.royallotushotel.controller;

import com.royallotushotel.dto.PhongDto;
import com.royallotushotel.dto.YeuCauTimPhong;
import com.royallotushotel.service.PhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/phong")
@RequiredArgsConstructor
public class PhongController {

    private final PhongService phongService;

    @GetMapping("/con-trong")
    public ResponseEntity<List<PhongDto>> conTrong(@ModelAttribute YeuCauTimPhong yeuCau) {
        return ResponseEntity.ok(phongService.timPhongTrong(yeuCau));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BUONG_PHONG')")
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Long idLoaiPhong) {
        if (page == null) {
            return ResponseEntity.ok(phongService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<PhongDto> ketQua = phongService.timPhanTrang(phanTrang, q, trangThai, idLoaiPhong);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhongDto> layTheoId(@PathVariable Long id) {
        return ResponseEntity.ok(phongService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<PhongDto> tao(@RequestBody PhongDto dto) {
        return ResponseEntity.ok(phongService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<PhongDto> capNhat(@PathVariable Long id, @RequestBody PhongDto dto) {
        return ResponseEntity.ok(phongService.capNhat(id, dto));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> capNhatTrangThai(@PathVariable Long id, @RequestParam String trangThai) {
        phongService.capNhatTrangThai(id, trangThai);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/can-don-ve-sinh")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BUONG_PHONG')")
    public ResponseEntity<List<PhongDto>> canDonVeSinh() {
        return ResponseEntity.ok(phongService.timPhongCanDon());
    }

    @PatchMapping("/{id}/ve-sinh")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BUONG_PHONG')")
    public ResponseEntity<Void> capNhatVeSinh(
            @PathVariable Long id,
            @RequestParam String trangThaiVeSinh,
            @RequestParam(required = false) String ghiChu) {
        phongService.capNhatVeSinh(id, trangThaiVeSinh, ghiChu);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        phongService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
