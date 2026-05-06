package com.royallotushotel.controller;

import com.royallotushotel.service.TapTinPhongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
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
    public ResponseEntity<?> taiLenPhongAnh(@RequestParam("file") MultipartFile file) {
        try {
            String duongDan = tapTinPhongService.luuAnhPhong(file);
            Map<String, String> body = new HashMap<>();
            body.put("duongDan", duongDan);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Không lưu được tệp"));
        }
    }

    @PostMapping("/phong-anh-nhieu")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<?> taiLenNhieu(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0)
            return ResponseEntity.badRequest().body(Map.of("error", "Không có tệp"));
        List<Map<String, String>> ketQua = new ArrayList<>();
        for (MultipartFile f : files) {
            if (f.isEmpty()) continue;
            try {
                String duongDan = tapTinPhongService.luuAnhPhong(f);
                ketQua.add(Map.of("duongDan", duongDan));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Không lưu được tệp"));
            }
        }
        if (ketQua.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không có tệp"));
        }
        return ResponseEntity.ok(Map.of("tep", ketQua));
    }
}
