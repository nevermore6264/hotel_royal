package com.royallotushotel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.GiaoDichThanhToan;
import com.royallotushotel.entity.ThanhToan;
import com.royallotushotel.hangso.LoaiGiaoDichThanhToan;
import com.royallotushotel.hangso.MaPhuongThucThanhToan;
import com.royallotushotel.hangso.MaTrangThaiThanhToan;
import com.royallotushotel.payment.PayOsKySo;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.ThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final DatPhongRepository datPhongRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final DatPhongService datPhongService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${payment.payos.client-id:}")
    private String payOsClientId;
    @Value("${payment.payos.api-key:}")
    private String payOsApiKey;
    @Value("${payment.payos.checksum-key:}")
    private String payOsChecksumKey;
    @Value("${payment.payos.api-url:https://api-merchant.payos.vn}")
    private String payOsApiUrl;
    @Value("${payment.payos.che-do-thu:false}")
    private boolean payOsCheDoThu;

    @Transactional
    public String taoUrlThanhToanPayOs(Long idDatPhong, String urlTroVe, String urlHuy) {
        DatPhong dp = datPhongRepository.findById(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        BigDecimal tongTien = datPhongService.tinhTongTien(idDatPhong);
        if (tongTien == null || tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền không hợp lệ");
        }
        datPhongService.capNhatTongThanhToan(idDatPhong);

        if (payOsCheDoThu) {
            xacNhanThanhToan(idDatPhong, MaPhuongThucThanhToan.CONG_PAYOS, "CHE_DO_THU");
            return noiQuery(urlTroVe, "idDatPhong=" + idDatPhong + "&payosCheDoThu=1");
        }

        if (payOsClientId == null || payOsClientId.isBlank()
                || payOsApiKey == null || payOsApiKey.isBlank()
                || payOsChecksumKey == null || payOsChecksumKey.isBlank()) {
            throw new RuntimeException(
                    "Chưa cấu hình payOS: đặt PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY hoặc bật payment.payos.che-do-thu=true để chạy local.");
        }

        long amountVnd = tongTien.longValue();
        int orderCode = taoMaDonPayOs();
        String moTa = moTaNgan(idDatPhong);
        String chuKy = PayOsKySo.taoChuKyTaoLinkThanhToan(
                amountVnd,
                urlHuy,
                moTa,
                orderCode,
                urlTroVe,
                payOsChecksumKey.trim()
        );

        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không có bản ghi thanh toán cho đặt phòng"));
        tt.setPayosOrderCode(orderCode);
        tt.setPhuongThuc(MaPhuongThucThanhToan.CONG_PAYOS);
        thanhToanRepository.save(tt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", payOsClientId.trim());
        headers.set("x-api-key", payOsApiKey.trim());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", amountVnd);
        body.put("description", moTa);
        body.put("cancelUrl", urlHuy);
        body.put("returnUrl", urlTroVe);
        body.put("signature", chuKy);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        String urlApi = payOsApiUrl.replaceAll("/+$", "") + "/v2/payment-requests";

        try {
            String json = restTemplate.postForObject(urlApi, entity, String.class);
            JsonNode root = objectMapper.readTree(json != null ? json : "{}");
            if (!"00".equals(root.path("code").asText())) {
                throw new RuntimeException("payOS: " + root.path("desc").asText("Lỗi tạo link thanh toán"));
            }
            String checkout = root.path("data").path("checkoutUrl").asText(null);
            if (checkout == null || checkout.isBlank()) {
                throw new RuntimeException("payOS không trả về checkoutUrl");
            }
            return checkout;
        } catch (org.springframework.web.client.RestClientException e) {
            throw new RuntimeException("Gọi API payOS thất bại: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Xử lý phản hồi payOS thất bại: " + e.getMessage(), e);
        }
    }

    private static String noiQuery(String base, String them) {
        if (base.contains("?")) return base + "&" + them;
        return base + "?" + them;
    }

    private int taoMaDonPayOs() {
        int code;
        int thu = 0;
        do {
            code = ThreadLocalRandom.current().nextInt(100_000_000, Integer.MAX_VALUE);
            thu++;
            if (thu > 40) {
                code = (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
                if (code < 0) code = -code;
                break;
            }
        } while (thanhToanRepository.existsByPayosOrderCode(code));
        return code;
    }

    private static String moTaNgan(Long idDatPhong) {
        String s = "DP" + idDatPhong;
        return s.length() <= 9 ? s : s.substring(0, 9);
    }

    @Transactional
    public void xacNhanThanhToan(Long idDatPhong, String cong, String maGiaoDich) {
        DatPhong dp = datPhongRepository.findById(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        ThanhToan tt0 = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElse(null);
        if (tt0 != null && MaTrangThaiThanhToan.DA_THANH_TOAN.equals(tt0.getTrangThai())) {
            return;
        }

        BigDecimal tongTien = datPhongService.tinhTongTien(idDatPhong);
        ThanhToan tt = tt0;
        if (tt == null) {
            tt = ThanhToan.builder()
                    .datPhong(dp)
                    .tongPhaiThu(tongTien)
                    .tongDaThu(BigDecimal.ZERO)
                    .tongHoan(BigDecimal.ZERO)
                    .conPhaiThu(tongTien)
                    .phuongThuc(cong)
                    .trangThai(MaTrangThaiThanhToan.CHUA_THANH_TOAN)
                    .thoiDiemThanhToan(java.time.LocalDateTime.now())
                    .build();
            tt = thanhToanRepository.save(tt);
        }
        tt.setTongPhaiThu(tongTien);
        tt.setTongDaThu(tongTien);
        tt.setTongHoan(tt.getTongHoan() != null ? tt.getTongHoan() : BigDecimal.ZERO);
        tt.setConPhaiThu(BigDecimal.ZERO);
        tt.setTrangThai(MaTrangThaiThanhToan.DA_THANH_TOAN);
        tt.setThoiDiemThanhToan(java.time.LocalDateTime.now());
        tt.setPhuongThuc(cong);
        thanhToanRepository.save(tt);
        GiaoDichThanhToan gd = GiaoDichThanhToan.builder()
                .thanhToan(tt)
                .maGiaoDich(maGiaoDich != null ? maGiaoDich : "")
                .loaiGiaoDich(LoaiGiaoDichThanhToan.THANH_TOAN)
                .soTien(tongTien)
                .trangThai(MaTrangThaiThanhToan.DA_THANH_TOAN)
                .phuongThuc(cong)
                .congThanhToan(cong)
                .thamChieuCong(maGiaoDich != null ? maGiaoDich : "")
                .ghiChu("Thanh toán đặt phòng qua payOS")
                .build();
        tt.getGiaoDich().add(gd);
        thanhToanRepository.save(tt);
        datPhongService.xacNhanDatPhong(idDatPhong);
    }

    @Transactional
    public void xuLyWebhookPayOs(JsonNode root) {
        if (payOsChecksumKey == null || payOsChecksumKey.isBlank()) {
            throw new RuntimeException("Chưa cấu hình payment.payos.checksum-key");
        }
        JsonNode data = root.get("data");
        if (data == null || data.isNull()) {
            return;
        }
        String sig = root.path("signature").asText("");
        if (!PayOsKySo.xacThucDuLieuWebhook(data, sig, payOsChecksumKey.trim())) {
            throw new RuntimeException("Chữ ký webhook payOS không hợp lệ");
        }
        if (!root.path("success").asBoolean(false) || !"00".equals(root.path("code").asText())) {
            return;
        }
        int orderCode = data.path("orderCode").asInt(0);
        if (orderCode == 0) return;

        ThanhToan tt = thanhToanRepository.findByPayosOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thanh toán payOS: " + orderCode));
        Long idDatPhong = tt.getDatPhong().getId();
        String ref = data.path("reference").asText("");
        if (ref.isBlank()) ref = "PAYOS-" + orderCode;
        xacNhanThanhToan(idDatPhong, MaPhuongThucThanhToan.CONG_PAYOS, ref);
    }
}
