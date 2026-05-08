package com.royallotushotel.controller;

import com.royallotushotel.dto.CuocTroChuyenTomTatDto;
import com.royallotushotel.dto.NguoiDungHoTroChatDto;
import com.royallotushotel.dto.TinNhanChatDto;
import com.royallotushotel.dto.YeuCauGuiTinChat;
import com.royallotushotel.dto.YeuCauGuiTinKhach;
import com.royallotushotel.dto.YeuCauGuiTinNhanVienChoKhach;
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
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @RequestParam Long idNguoiHoTro) {
        return ResponseEntity.ok(chatService.tinNhanCuaKhach(chuThe, idNguoiHoTro));
    }

    @PostMapping("/khach/tin-nhan")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<TinNhanChatDto> guiTinKhach(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @Valid @RequestBody YeuCauGuiTinKhach yeuCauPhieu) {
        return ResponseEntity.ok(chatService.guiTinKhach(
                chuThe,
                yeuCauPhieu.getNoiDung(),
                yeuCauPhieu.getIdNguoiHoTro(),
                yeuCauPhieu.getKieuTin()));
    }

    @PostMapping("/tai-anh")
    @PreAuthorize("hasAnyRole('KHACH_HANG','LE_TAN','QUAN_TRI')")
    public ResponseEntity<?> taiAnhChat(@RequestParam("file") MultipartFile tep) {
        try {
            String duongDan = tapTinPhongService.luuAnhChat(tep);
            Map<String, String> phanHoi = new HashMap<>();
            phanHoi.put("duongDan", duongDan);
            return ResponseEntity.ok(phanHoi);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("loi", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("loi", "Không lưu được tệp"));
        }
    }

    @GetMapping("/cuoc-tro-chuyen")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<List<CuocTroChuyenTomTatDto>> danhSachCuoc(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        return ResponseEntity.ok(chatService.danhSachCuocChoNhanVien(chuThe));
    }

    @GetMapping("/cuoc-tro-chuyen/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<List<TinNhanChatDto>> tinTrongCuoc(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.tinTrongCuoc(chuThe, id));
    }

    @PostMapping("/cuoc-tro-chuyen/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<TinNhanChatDto> guiTinNhanVien(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @PathVariable Long id,
            @Valid @RequestBody YeuCauGuiTinChat yeuCauPhieu) {
        return ResponseEntity.ok(chatService.guiTinNhanVien(
                chuThe, id, yeuCauPhieu.getNoiDung(), yeuCauPhieu.getKieuTin()));
    }

    @PostMapping("/nhan-vien/tin-nhan")
    @PreAuthorize("hasAnyRole('LE_TAN','QUAN_TRI')")
    public ResponseEntity<TinNhanChatDto> guiTinNhanVienTheoKhach(
            @AuthenticationPrincipal ChuTheNguoiDung chuThe,
            @Valid @RequestBody YeuCauGuiTinNhanVienChoKhach yeuCauPhieu) {
        return ResponseEntity.ok(chatService.guiTinNhanVienTheoKhach(
                chuThe,
                yeuCauPhieu.getIdNguoiDungKhach(),
                yeuCauPhieu.getNoiDung(),
                yeuCauPhieu.getKieuTin()));
    }
}
