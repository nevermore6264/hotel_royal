package com.royallotushotel.controller;

import com.royallotushotel.dto.NguoiDungDto;
import com.royallotushotel.dto.YeuCauCapNhatHoSo;
import com.royallotushotel.dto.YeuCauDoiMatKhau;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ho-so")
@RequiredArgsConstructor
public class HoSoController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    public ResponseEntity<NguoiDungDto> lay(@AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(nguoiDungService.layTheoId(chuThe.getId()));
    }

    @PutMapping
    public ResponseEntity<NguoiDungDto> capNhat(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @RequestBody YeuCauCapNhatHoSo body) {
        NguoiDungDto dto = nguoiDungService.capNhatThongTinCaNhan(chuThe.getId(), body);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/doi-mat-khau")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void doiMatKhau(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @RequestBody YeuCauDoiMatKhau body) {
        nguoiDungService.doiMatKhau(chuThe.getId(), body.getMatKhauCu(), body.getMatKhauMoi());
    }
}
