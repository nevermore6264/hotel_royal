package com.royallotushotel.controller;

import com.royallotushotel.dto.LoaiPhongDto;
import com.royallotushotel.service.LoaiPhongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loai-phong")
@RequiredArgsConstructor
public class LoaiPhongController {

    private final LoaiPhongService loaiPhongService;

    @GetMapping
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q) {
        if (page == null) {
            return ResponseEntity.ok(loaiPhongService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<LoaiPhongDto> ketQua = loaiPhongService.timPhanTrang(phanTrang, q);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoaiPhongDto> layTheoId(@PathVariable Long id) {
        return ResponseEntity.ok(loaiPhongService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<LoaiPhongDto> tao(@Valid @RequestBody LoaiPhongDto dto) {
        return ResponseEntity.ok(loaiPhongService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<LoaiPhongDto> capNhat(@PathVariable Long id, @Valid @RequestBody LoaiPhongDto dto) {
        return ResponseEntity.ok(loaiPhongService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('QUAN_TRI')")
    public void xoa(@PathVariable Long id) {
        loaiPhongService.xoa(id);
    }
}
