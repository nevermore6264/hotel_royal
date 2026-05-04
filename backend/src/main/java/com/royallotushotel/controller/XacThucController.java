package com.royallotushotel.controller;

import com.royallotushotel.dto.PhanHoiXacThuc;
import com.royallotushotel.dto.YeuCauDangKy;
import com.royallotushotel.dto.YeuCauDangNhap;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.XacThucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/xac-thuc")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService xacThucService;

    @PostMapping("/dang-nhap")
    public ResponseEntity<PhanHoiXacThuc> dangNhap(@Valid @RequestBody YeuCauDangNhap yeuCau) {
        return ResponseEntity.ok(xacThucService.dangNhap(yeuCau));
    }

    @PostMapping("/dang-ky")
    public ResponseEntity<PhanHoiXacThuc> dangKy(@Valid @RequestBody YeuCauDangKy yeuCau) {
        return ResponseEntity.ok(xacThucService.dangKy(yeuCau));
    }

    @GetMapping("/toi")
    public ResponseEntity<Map<String, Object>> toi(@AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(xacThucService.layThongTinToi(chuThe != null ? chuThe.getId() : null));
    }
}
