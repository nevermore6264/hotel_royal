package com.royallotushotel.controller;

import com.royallotushotel.service.TapTinPhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tap-tin")
@RequiredArgsConstructor
public class TapTinController {

    private final TapTinPhongService tapTinPhongService;

    @PostMapping("/phong-anh")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<?> taiLenPhongAnh(@RequestParam("file") MultipartFile tep) {
        try {
            String duongDan = tapTinPhongService.luuAnhPhong(tep);
            Map<String, String> phanHoi = new HashMap<>();
            phanHoi.put("duongDan", duongDan);
            return ResponseEntity.ok(phanHoi);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("loi", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("loi", "Không lưu được tệp"));
        }
    }

    @PostMapping("/phong-anh-nhieu")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<?> taiLenNhieu(
            @RequestParam(value = "files", required = false) MultipartFile[] mangTep) {
        boolean coTepThucSu = mangTep != null
                && Arrays.stream(mangTep).anyMatch(tep -> tep != null && !tep.isEmpty());
        if (!coTepThucSu)
            return ResponseEntity.badRequest().body(Map.of("loi", "Không có tệp"));
        List<Map<String, String>> ketQua = new ArrayList<>();
        for (MultipartFile moiTep : mangTep) {
            if (moiTep.isEmpty()) continue;
            try {
                String duongDan = tapTinPhongService.luuAnhPhong(moiTep);
                ketQua.add(Map.of("duongDan", duongDan));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("loi", e.getMessage()));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("loi", "Không lưu được tệp"));
            }
        }
        if (ketQua.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Không có tệp"));
        }
        return ResponseEntity.ok(Map.of("tep", ketQua));
    }
}
