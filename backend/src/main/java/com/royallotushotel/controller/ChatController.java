package com.royallotushotel.controller;

import com.royallotushotel.dto.CuocTroChuyenTomTatDto;
import com.royallotushotel.dto.NguoiDungHoTroChatDto;
import com.royallotushotel.dto.TinNhanChatDto;
import com.royallotushotel.dto.YeuCauGuiTinChat;
import com.royallotushotel.dto.YeuCauGuiTinKhach;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.ChatService;
import com.royallotushotel.service.TapTinPhongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final TapTinPhongService tapTinPhongService;

    @GetMapping("/nhan-vien-ho-tro")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<List<NguoiDungHoTroChatDto>> nhanVienHoTro() {
        return ResponseEntity.ok(chatService.danhSachNhanVienHoTro());
    }

    @GetMapping("/khach/tin-nhan")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<List<TinNhanChatDto>> tinNhanCuaKhach(
            @AuthenticationPrincipal ChuTheNguoiDung user,
            @RequestParam Long idNguoiHoTro) {
        return ResponseEntity.ok(chatService.tinNhanCuaKhach(user, idNguoiHoTro));
    }

    @PostMapping("/khach/tin-nhan")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<TinNhanChatDto> guiTinKhach(
            @AuthenticationPrincipal ChuTheNguoiDung user,
            @Valid @RequestBody YeuCauGuiTinKhach body) {
        return ResponseEntity.ok(chatService.guiTinKhach(
                user, body.getNoiDung(), body.getIdNguoiHoTro(), body.getKieuTin()));
    }

    @PostMapping("/tai-anh")
    @PreAuthorize("hasAnyRole('KHACH_HANG','LE_TAN','QUAN_TRI')")
    public ResponseEntity<?> taiAnhChat(@RequestParam("file") MultipartFile file) {
        try {
            String duongDan = tapTinPhongService.luuAnhChat(file);
            Map<String, String> body = new HashMap<>();
            body.put("duongDan", duongDan);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Khong luu duoc tep"));
        }
    }

    @GetMapping("/cuoc-tro-chuyen")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<List<CuocTroChuyenTomTatDto>> danhSachCuoc(
            @AuthenticationPrincipal ChuTheNguoiDung user) {
        return ResponseEntity.ok(chatService.danhSachCuocChoNhanVien(user));
    }

    @GetMapping("/cuoc-tro-chuyen/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<List<TinNhanChatDto>> tinTrongCuoc(
            @AuthenticationPrincipal ChuTheNguoiDung user,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.tinTrongCuoc(user, id));
    }

    @PostMapping("/cuoc-tro-chuyen/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<TinNhanChatDto> guiTinNhanVien(
            @AuthenticationPrincipal ChuTheNguoiDung user,
            @PathVariable Long id,
            @Valid @RequestBody YeuCauGuiTinChat body) {
        return ResponseEntity.ok(chatService.guiTinNhanVien(
                user, id, body.getNoiDung(), body.getKieuTin()));
    }
}
