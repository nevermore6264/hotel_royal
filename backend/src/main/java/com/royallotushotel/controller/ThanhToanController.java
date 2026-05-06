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
    public ResponseEntity<Map<String, String>> taoUrl(@RequestBody Map<String, Object> body) {
        Long idDatPhong = Long.valueOf(body.get("idDatPhong").toString());
        String urlTroVe = body.getOrDefault("urlTroVe", "http://localhost:5173/dat-phong/thanh-cong").toString();
        String urlHuy = body.getOrDefault("urlHuy", "http://localhost:5173/dat-phong").toString();
        Object cheDoRaw = body.get("cheDoThanhToan");
        String cheDoThanhToan = cheDoRaw != null ? cheDoRaw.toString().trim() : "TOAN_BO";
        String url = thanhToanService.taoUrlThanhToanPayOs(idDatPhong, urlTroVe, urlHuy, cheDoThanhToan);
        return ResponseEntity.ok(Map.of("duongThanhToan", url));
    }

    @PostMapping("/webhook-payos")
    public ResponseEntity<Map<String, String>> webhookPayOs(@RequestBody String rawBody) throws Exception {
        JsonNode body = objectMapper.readTree(rawBody);
        thanhToanService.xuLyWebhookPayOs(body);
        return ResponseEntity.ok(Map.of("message", "OK"));
    }

    /** Khách đăng nhập, quay lại từ PayOS — đồng bộ trạng thái khi webhook chưa/chưa tới được server. */
    @PostMapping("/dong-bo-payos")
    public ResponseEntity<Map<String, Object>> dongBoPayOs(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal ChuTheNguoiDung chuThe) {
        if (chuThe == null) {
            throw new RuntimeException("Cần đăng nhập để đồng bộ thanh toán");
        }
        Long idDatPhong = Long.valueOf(body.get("idDatPhong").toString());
        int orderCode = Integer.parseInt(body.get("orderCode").toString().trim());
        String paymentLinkId = body.get("paymentLinkId").toString().trim();
        Map<String, Object> ketQua = thanhToanService.dongBoSauRedirectPayOs(
                idDatPhong, orderCode, paymentLinkId, chuThe.getId());
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/goi-lai")
    public ResponseEntity<Map<String, String>> goiLai(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(Map.of(
                "trangThai", "ok",
                "thongDiep", "Luồng xác nhận qua payOS dùng webhook POST /thanh-toan/webhook-payos",
                "query", params.isEmpty() ? "{}" : params.toString()
        ));
    }
}
