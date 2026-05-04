package com.royallotushotel.controller;

import com.royallotushotel.dto.NguoiDungDto;
import com.royallotushotel.service.NguoiDungService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String vaiTro) {
        if (page == null) {
            return ResponseEntity.ok(nguoiDungService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<NguoiDungDto> ketQua = nguoiDungService.timPhanTrang(phanTrang, q, trangThai, vaiTro);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<NguoiDungDto> layTheoId(@PathVariable Long id) {
        return ResponseEntity.ok(nguoiDungService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<NguoiDungDto> tao(@Valid @RequestBody NguoiDungDto dto) {
        return ResponseEntity.ok(nguoiDungService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<NguoiDungDto> capNhat(@PathVariable Long id, @Valid @RequestBody NguoiDungDto dto) {
        return ResponseEntity.ok(nguoiDungService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        nguoiDungService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
