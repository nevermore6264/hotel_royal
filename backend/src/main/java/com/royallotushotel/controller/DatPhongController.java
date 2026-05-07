package com.royallotushotel.controller;

import com.royallotushotel.dto.DatPhongDto;
import com.royallotushotel.dto.YeuCauTaoDatPhong;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.DatPhongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dat-phong")
@RequiredArgsConstructor
public class DatPhongController {

    private final DatPhongService datPhongService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<Page<DatPhongDto>> danhSach(
            Pageable phanTrang,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(datPhongService.timTatCa(phanTrang, trangThai, tuNgay, denNgay, q));
    }

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<List<DatPhongDto>> cuaToi(@AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        Long idKhach = datPhongService.layIdKhachHangTheoIdNguoiDung(chuThe.getId());
        if (idKhach == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(datPhongService.timTheoKhachHang(idKhach));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','KHACH_HANG')")
    public ResponseEntity<DatPhongDto> layTheoId(
            @PathVariable Long id, @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(datPhongService.layTheoId(id, chuThe));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','KHACH_HANG')")
    public ResponseEntity<DatPhongDto> tao(@Valid @RequestBody YeuCauTaoDatPhong yeuCau) {
        return ResponseEntity.ok(datPhongService.tao(yeuCau));
    }

    @PostMapping("/{id}/nhan-phong")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public void nhanPhong(@PathVariable Long id) {
        datPhongService.nhanPhong(id);
    }

    @PostMapping("/{id}/tra-phong")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public void traPhong(@PathVariable Long id) {
        datPhongService.traPhong(id);
    }

    @PostMapping("/{id}/huy")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<DatPhongDto> huy(@PathVariable Long id, @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(datPhongService.huy(id, chuThe.getId()));
    }

    @PostMapping("/{id}/chi-tiet/{idChiTiet}/huy")
    @PreAuthorize("hasAnyRole('KHACH_HANG','QUAN_TRI','LE_TAN')")
    public ResponseEntity<DatPhongDto> huyChiTiet(
            @PathVariable Long id,
            @PathVariable Long idChiTiet,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        boolean boQuaKiemTraChuDon = chuThe != null && chuThe.getAuthorities() != null
                && chuThe.getAuthorities().stream().anyMatch(quyen ->
                        "ROLE_QUAN_TRI".equals(quyen.getAuthority()) || "ROLE_LE_TAN".equals(quyen.getAuthority()));
        String lyDo = body != null ? body.get("lyDo") : null;
        Long idNguoiDung = chuThe != null ? chuThe.getId() : null;
        return ResponseEntity.ok(datPhongService.huyChiTiet(id, idChiTiet, idNguoiDung, boQuaKiemTraChuDon, lyDo));
    }

    @PostMapping("/{id}/xac-nhan")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public void xacNhan(@PathVariable Long id) {
        datPhongService.xacNhanDatPhong(id);
    }

    @GetMapping("/{id}/hoa-don")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','KHACH_HANG')")
    public ResponseEntity<DatPhongDto> hoaDon(
            @PathVariable Long id, @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(datPhongService.layTheoId(id, chuThe));
    }
}
