package com.royallotushotel.controller;

import com.royallotushotel.dto.NhatKyHeThongDto;
import com.royallotushotel.service.NhatKyHeThongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/nhat-ky")
@RequiredArgsConstructor
public class NhatKyHeThongController {

    private final NhatKyHeThongService nhatKyHeThongService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Page<NhatKyHeThongDto>> danhSach(
            Pageable phanTrang,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        LocalDateTime tu = tuNgay != null ? tuNgay.atStartOfDay() : null;
        LocalDateTime den = denNgay != null ? LocalDateTime.of(denNgay, LocalTime.of(23, 59, 59)) : null;
        return ResponseEntity.ok(nhatKyHeThongService.timLoc(phanTrang, q, tu, den));
    }
}
