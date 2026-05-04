package com.royallotushotel.controller;

import com.royallotushotel.dto.DichVuDto;
import com.royallotushotel.service.QuanLyDichVuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dich-vu")
@RequiredArgsConstructor
public class DichVuController {

    private final QuanLyDichVuService quanLyDichVuService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BUONG_PHONG')")
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q) {
        if (page == null) {
            return ResponseEntity.ok(quanLyDichVuService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<DichVuDto> ketQua = quanLyDichVuService.timPhanTrang(phanTrang, q);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<DichVuDto> tao(@RequestBody DichVuDto dto) {
        return ResponseEntity.ok(quanLyDichVuService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<DichVuDto> capNhat(@PathVariable Long id, @RequestBody DichVuDto dto) {
        return ResponseEntity.ok(quanLyDichVuService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        quanLyDichVuService.xoa(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dat-phong/{idDatPhong}/them")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BUONG_PHONG')")
    public ResponseEntity<Void> themVaoDatPhong(@PathVariable Long idDatPhong, @RequestBody Map<String, Object> body) {
        Long idDichVu = Long.valueOf(body.get("idDichVu").toString());
        int soLuong = body.containsKey("soLuong") ? ((Number) body.get("soLuong")).intValue() : 1;
        quanLyDichVuService.themVaoDatPhong(idDatPhong, idDichVu, soLuong);
        return ResponseEntity.noContent().build();
    }
}
