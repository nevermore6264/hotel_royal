package com.royallotushotel.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/thanh-toan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;
    private final ObjectMapper objectMapper;

    @PostMapping("/tao-url")
    public ResponseEntity<Map<String, String>> taoUrl(@RequestBody Map<String, Object> phieuYeuCau) {
        Long idDatPhong = Long.valueOf(phieuYeuCau.get("idDatPhong").toString());
        String urlTroVe = phieuYeuCau.getOrDefault("urlTroVe", "http://localhost:5173/dat-phong/thanh-cong").toString();
        String urlHuy = phieuYeuCau.getOrDefault("urlHuy", "http://localhost:5173/dat-phong").toString();
        Object cheDoRaw = phieuYeuCau.get("cheDoThanhToan");
        String cheDoThanhToan = cheDoRaw != null ? cheDoRaw.toString().trim() : "TOAN_BO";
        String url = thanhToanService.taoUrlThanhToanPayOs(idDatPhong, urlTroVe, urlHuy, cheDoThanhToan);
        return ResponseEntity.ok(Map.of("duongThanhToan", url));
    }

    @PostMapping("/webhook-payos")
    public ResponseEntity<Map<String, String>> webhookPayOs(@RequestBody String chuoiPhanThan) throws Exception {
        JsonNode nutGoc = objectMapper.readTree(chuoiPhanThan);
        thanhToanService.xuLyWebhookPayOs(nutGoc);
        return ResponseEntity.ok(Map.of("ketQua", "thanhCong"));
    }

    @PostMapping("/dong-bo-payos")
    public ResponseEntity<Map<String, Object>> dongBoPayOs(
            @RequestBody Map<String, Object> phieuYeuCau,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        if (chuThe == null) {
            throw new RuntimeException("Cần đăng nhập để đồng bộ thanh toán");
        }
        Long idDatPhong = Long.valueOf(phieuYeuCau.get("idDatPhong").toString());
        int orderCode = Integer.parseInt(phieuYeuCau.get("orderCode").toString().trim());
        String paymentLinkId = phieuYeuCau.get("paymentLinkId").toString().trim();
        Map<String, Object> ketQua = thanhToanService.dongBoSauRedirectPayOs(
                idDatPhong, orderCode, paymentLinkId, chuThe);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/goi-lai")
    public ResponseEntity<Map<String, String>> goiLai(@RequestParam Map<String, String> thamSo) {
        return ResponseEntity.ok(Map.of(
                "trangThai", "ok",
                "thongDiep", "Luồng xác nhận qua payOS dùng webhook POST /thanh-toan/webhook-payos",
                "chuoiThamSo", thamSo.isEmpty() ? "{}" : thamSo.toString()
        ));
    }
}
