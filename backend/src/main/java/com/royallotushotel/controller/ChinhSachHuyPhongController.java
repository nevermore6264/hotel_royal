package com.royallotushotel.controller;

import com.royallotushotel.dto.ChinhSachHuyPhongDto;
import com.royallotushotel.service.ChinhSachHuyPhongService;
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
@RequestMapping("/chinh-sach-huy-phong")
@RequiredArgsConstructor
public class ChinhSachHuyPhongController {

    private final ChinhSachHuyPhongService chinhSachHuyPhongService;

    @GetMapping
    public ResponseEntity<?> danhSach(
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean conHieuLuc) {
        if (page == null) {
            return ResponseEntity.ok(chinhSachHuyPhongService.timTatCa());
        }
        Pageable phanTrang = PageRequest.of(page, size);
        Page<ChinhSachHuyPhongDto> ketQua = chinhSachHuyPhongService.timPhanTrang(phanTrang, q, conHieuLuc);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ChinhSachHuyPhongDto> tao(@Valid @RequestBody ChinhSachHuyPhongDto dto) {
        return ResponseEntity.ok(chinhSachHuyPhongService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ChinhSachHuyPhongDto> capNhat(@PathVariable Long id, @Valid @RequestBody ChinhSachHuyPhongDto dto) {
        return ResponseEntity.ok(chinhSachHuyPhongService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        chinhSachHuyPhongService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
